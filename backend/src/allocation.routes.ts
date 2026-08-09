import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import { prisma } from "./database.js";

const router = Router();

router.post("/run", async (req, res) => {
    try {
        // Get all students
        const students = await prisma.student.findMany();

        // Get all courses
        const courses = await prisma.course.findMany();

        // Get all preferences
        const preferences = await prisma.preference.findMany({
            orderBy: [
                {
                    studentId: "asc",
                },
                {
                    rank: "asc",
                },
            ],
        });

        if (students.length === 0) {
            return res.status(400).json({
                error: "No students found",
            });
        }

        if (courses.length === 0) {
            return res.status(400).json({
                error: "No courses found",
            });
        }

        if (preferences.length === 0) {
            return res.status(400).json({
                error: "No preferences found",
            });
        }

        // Convert database records into the format
        // expected by the Python solver.

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
                                preference.studentId === student.id
                        )
                        .sort((a, b) => a.rank - b.rank);

                    const courseCodes = studentPreferences
                        .map((preference) => {
                            const course = courses.find(
                                (course) =>
                                    course.id === preference.courseId
                            );

                            return course?.code;
                        })
                        .filter(
                            (code): code is string =>
                                code !== undefined
                        );

                    return [student.name, courseCodes];
                })
            ),
        };

        console.log("Sending data to solver:");
        console.log(JSON.stringify(solverInput, null, 2));

        // Find Python solver
        const solverPath = path.resolve(
            process.cwd(),
            "../solver/solver.py"
        );

        const pythonProcess = spawn(
            "python",
            [solverPath]
        );

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        // Send database data to Python
        pythonProcess.stdin.write(
            JSON.stringify(solverInput)
        );

        pythonProcess.stdin.end();

        pythonProcess.on("close", async (code) => {
            if (code !== 0) {
                console.error("Python solver error:");
                console.error(errorOutput);

                return res.status(500).json({
                    error: "Solver failed",
                    details: errorOutput,
                });
            }

            try {
                const result = JSON.parse(output);

// Remove previous allocation results
await prisma.allocation.deleteMany();

// Save the new allocation results
for (const allocation of result.allocations) {
    const student = students.find(
        (student) => student.name === allocation.student
    );

    const course = courses.find(
        (course) => course.code === allocation.course
    );

    if (!student || !course) {
        console.error(
            "Could not match allocation:",
            allocation
        );

        continue;
    }

    await prisma.allocation.create({
        data: {
            studentId: student.id,
            courseId: course.id,
            preferenceRank: allocation.preferenceRank,
            score: allocation.score,
        },
    });
}

return res.json(result);
            } catch {
                console.error(
                    "Could not parse solver output:"
                );
                console.error(output);

                return res.status(500).json({
                    error: "Invalid solver response",
                });
            }
        });
    } catch (error) {
        console.error(
            "Failed to run allocation:",
            error
        );

        return res.status(500).json({
            error: "Failed to run allocation",
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const allocations = await prisma.allocation.findMany({
            include: {
                student: true,
                course: true,
            },
            orderBy: {
                studentId: "asc",
            },
        });

        return res.json(allocations);
    } catch (error) {
        console.error("Failed to fetch allocations:", error);

        return res.status(500).json({
            error: "Failed to fetch allocations",
        });
    }
});

export default router;