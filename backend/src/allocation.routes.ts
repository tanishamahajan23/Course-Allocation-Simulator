import express from "express";
import { spawn } from "child_process";
import path from "path";

import { prisma } from "./database.js";

const router = express.Router();

/*
 * GET /api/allocations
 *
 * Return the current allocation results.
 */
router.get("/", async (req, res) => {
    try {
        const allocations = await prisma.allocation.findMany({
            include: {
                student: true,
                course: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        res.json(allocations);
    } catch (error) {
        console.error("Failed to fetch allocations:", error);

        res.status(500).json({
            error: "Failed to fetch allocations",
        });
    }
});


/*
 * POST /api/allocations/run
 *
 * Run the Python OR-Tools solver.
 */
router.post("/run", async (req, res) => {
    try {
        /*
         * --------------------------------------------------------
         * 1. Get data from PostgreSQL
         * --------------------------------------------------------
         */

        const students = await prisma.student.findMany({
            orderBy: {
                id: "asc",
            },
        });

        const courses = await prisma.course.findMany({
            orderBy: {
                id: "asc",
            },
        });

        const preferences = await prisma.preference.findMany({
            include: {
                student: true,
                course: true,
            },
            orderBy: {
                rank: "asc",
            },
        });


        /*
         * --------------------------------------------------------
         * 2. Convert database data into solver input
         * --------------------------------------------------------
         */

        const solverInput = {
            students: students.map((student) => student.name),

            courses: Object.fromEntries(
                courses.map((course) => [
                    course.code,
                    course.capacity,
                ])
            ),

            preferences: Object.fromEntries(
                students.map((student) => {
                    const studentPreferences = preferences
                        .filter(
                            (preference) =>
                                preference.studentId ===
                                student.id
                        )
                        .sort(
                            (a, b) =>
                                a.rank - b.rank
                        )
                        .map(
                            (preference) =>
                                preference.course.code
                        );

                    return [
                        student.name,
                        studentPreferences,
                    ];
                })
            ),
        };

        console.log(
            "Sending data to solver:"
        );

        console.log(
            JSON.stringify(
                solverInput,
                null,
                2
            )
        );


        /*
         * --------------------------------------------------------
         * 3. Locate Python and solver
         * --------------------------------------------------------
         *
         * Project structure:
         *
         * course-allocation-simulator/
         * ├── backend/
         * ├── solver/
         * │   └── solver.py
         * └── virtualEnv/
         *     └── Scripts/
         *         └── python.exe
         */

        const solverPath = path.resolve(
            process.cwd(),
            "../solver/solver.py"
        );

        const pythonPath =
    process.env.PYTHON_PATH || "python3";

        console.log(
            "Python executable:",
            pythonPath
        );

        console.log(
            "Solver path:",
            solverPath
        );


        /*
         * --------------------------------------------------------
         * 4. Start Python solver
         * --------------------------------------------------------
         */

        const pythonProcess = spawn(
            pythonPath,
            [solverPath]
        );

        let output = "";
        let errorOutput = "";


        /*
         * --------------------------------------------------------
         * 5. Receive solver output
         * --------------------------------------------------------
         */

        pythonProcess.stdout.on(
            "data",
            (data) => {
                output += data.toString();
            }
        );


        /*
         * --------------------------------------------------------
         * 6. Receive Python errors
         * --------------------------------------------------------
         */

        pythonProcess.stderr.on(
            "data",
            (data) => {
                errorOutput += data.toString();
            }
        );


        /*
         * --------------------------------------------------------
         * 7. Send input to Python
         * --------------------------------------------------------
         */

        pythonProcess.stdin.write(
            JSON.stringify(solverInput)
        );

        pythonProcess.stdin.end();


        /*
         * --------------------------------------------------------
         * 8. Python process finished
         * --------------------------------------------------------
         */

        pythonProcess.on(
            "close",
            async (code) => {
                if (code !== 0) {
                    console.error(
                        "Python solver error:"
                    );

                    console.error(
                        errorOutput
                    );

                    return res.status(500).json({
                        error: "Solver failed",
                        details: errorOutput,
                    });
                }


                /*
                 * ------------------------------------------------
                 * 9. Parse solver response
                 * ------------------------------------------------
                 */

                let solverResult: any;

                try {
                    solverResult =
                        JSON.parse(output);
                } catch (error) {
                    console.error(
                        "Could not parse solver output:"
                    );

                    console.error(
                        output
                    );

                    return res.status(500).json({
                        error:
                            "Invalid solver response",
                    });
                }


                /*
                 * ------------------------------------------------
                 * 10. Check solver result
                 * ------------------------------------------------
                 */

                if (
                    !solverResult ||
                    !Array.isArray(
                        solverResult.allocations
                    )
                ) {
                    console.error(
                        "Unexpected solver response:",
                        solverResult
                    );

                    return res.status(500).json({
                        error:
                            "Solver returned an unexpected response",
                    });
                }

                if (solverResult.status === "infeasible") {
                    return res.status(400).json({
                        error: "Allocation is infeasible.",
                        details:
                            "One or more students cannot be allocated because they have no valid course preferences.",
                        solver: solverResult,
                    });
                }


                /*
                 * ------------------------------------------------
                 * 11. Remove previous allocations
                 * ------------------------------------------------
                 */

                await prisma.allocation.deleteMany();


                /*
                 * ------------------------------------------------
                 * 12. Convert solver results into database rows
                 * ------------------------------------------------
                 */

                const allocationRows =
                    solverResult.allocations
                        .map(
                            (allocation: any) => {
                                const student =
                                    students.find(
                                        (student) =>
                                            student.name ===
                                            allocation.student
                                    );

                                const course =
                                    courses.find(
                                        (course) =>
                                            course.code ===
                                            allocation.course
                                    );

                                if (
                                    !student ||
                                    !course
                                ) {
                                    return null;
                                }

                                return {
                                    studentId:
                                        student.id,

                                    courseId:
                                        course.id,

                                    preferenceRank:
                                        allocation.preferenceRank ??
                                        allocation.rank ??
                                        0,

                                    score:
                                        allocation.score ??
                                        0,
                                };
                            }
                        )
                        .filter(
                            (
                                allocation: any
                            ) =>
                                allocation !== null
                        );


                /*
                 * ------------------------------------------------
                 * 13. Save allocations
                 * ------------------------------------------------
                 */

                if (
                    allocationRows.length > 0
                ) {
                    await prisma.allocation.createMany(
                        {
                            data: allocationRows,
                        }
                    );
                }


                /*
                 * ------------------------------------------------
                 * 14. Fetch saved allocations
                 * ------------------------------------------------
                 */

                const savedAllocations =
                    await prisma.allocation.findMany(
                        {
                            include: {
                                student: true,
                                course: true,
                            },

                            orderBy: {
                                id: "asc",
                            },
                        }
                    );


                /*
                 * ------------------------------------------------
                 * 15. Return result to React
                 * ------------------------------------------------
                 */

                return res.json({
                    success: true,

                    message:
                        "Allocation completed successfully.",

                    allocations:
                        savedAllocations,

                    solver: solverResult,
                });
            }
        );
    } catch (error) {
        console.error(
            "Allocation route failed:",
            error
        );

        return res.status(500).json({
            error: "Failed to run allocation",
            details:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
});

export default router;