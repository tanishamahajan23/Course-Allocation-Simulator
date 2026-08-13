import express from "express";
import { spawn } from "child_process";
import path from "path";
import { prisma } from "./database.js";
const router = express.Router();
router.post("/run", async (req, res) => {
    try {
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
         * Read simulation parameters
         * --------------------------------------------------------
         */
        const capacityOverrides = req.body.capacityOverrides || {};
        const preferenceScores = req.body.preferenceScores || {
            0: 100,
            1: 50,
            2: 10,
        };
        /*
         * --------------------------------------------------------
         * Build temporary course capacities
         *
         * The database is NOT modified.
         * --------------------------------------------------------
         */
        const simulatedCourses = Object.fromEntries(courses.map((course) => {
            const override = capacityOverrides[course.code];
            const capacity = override !== undefined
                ? Number(override)
                : course.capacity;
            return [
                course.code,
                capacity,
            ];
        }));
        /*
         * --------------------------------------------------------
         * Build preference data
         * --------------------------------------------------------
         */
        const solverPreferences = Object.fromEntries(students.map((student) => {
            const studentPreferences = preferences
                .filter((preference) => preference.studentId ===
                student.id)
                .sort((a, b) => a.rank - b.rank)
                .map((preference) => preference.course.code);
            return [
                student.name,
                studentPreferences,
            ];
        }));
        const solverInput = {
            students: students.map((student) => student.name),
            courses: simulatedCourses,
            preferences: solverPreferences,
            preferenceScores,
        };
        console.log("Simulation input:");
        console.log(JSON.stringify(solverInput, null, 2));
        /*
         * --------------------------------------------------------
         * Locate Python and solver
         * --------------------------------------------------------
         */
        const solverPath = path.resolve(process.cwd(), "../solver/solver.py");
        const pythonPath = process.env.PYTHON_PATH || "python3";
        /*
         * --------------------------------------------------------
         * Start Python
         * --------------------------------------------------------
         */
        const pythonProcess = spawn(pythonPath, [solverPath]);
        let output = "";
        let errorOutput = "";
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });
        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });
        /*
         * --------------------------------------------------------
         * Handle Python startup errors
         * --------------------------------------------------------
         */
        pythonProcess.on("error", (error) => {
            console.error("Failed to start Python:", error);
        });
        /*
         * --------------------------------------------------------
         * Send simulation data
         * --------------------------------------------------------
         */
        pythonProcess.stdin.write(JSON.stringify(solverInput));
        pythonProcess.stdin.end();
        /*
         * --------------------------------------------------------
         * Process solver result
         * --------------------------------------------------------
         */
        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error("Simulation solver error:");
                console.error(errorOutput);
                return res.status(500).json({
                    error: "Simulation solver failed",
                    details: errorOutput,
                });
            }
            let result;
            try {
                result = JSON.parse(output);
            }
            catch (error) {
                console.error("Invalid simulation output:", output);
                return res.status(500).json({
                    error: "Invalid solver response",
                });
            }
            if (result.status ===
                "infeasible") {
                return res.status(400).json({
                    error: "Simulation is infeasible.",
                    solver: result,
                });
            }
            /*
             * IMPORTANT:
             *
             * We return the result directly.
             *
             * Nothing is written to PostgreSQL.
             */
            return res.json({
                success: true,
                simulated: true,
                allocations: result.allocations,
                totalScore: result.totalScore,
                status: result.status,
                simulatedCourses,
                preferenceScores,
            });
        });
    }
    catch (error) {
        console.error("Simulation route failed:", error);
        return res.status(500).json({
            error: "Failed to run simulation",
            details: error instanceof Error
                ? error.message
                : "Unknown error",
        });
    }
});
export default router;
