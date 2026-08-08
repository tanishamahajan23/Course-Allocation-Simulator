import express from "express";
import { spawn } from "child_process";
import path from "path";

const app = express();

const PORT = 5000;

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Course Allocation API is running"
    });
});

// Run allocation
app.post("/api/allocations/run", (req, res) => {
    const solverPath = path.resolve(
        process.cwd(),
        "../solver/solver.py"
    );

    const pythonProcess = spawn("python", [solverPath]);

    let output = "";
    let errorOutput = "";

    // Receive normal output from Python
    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    // Receive error output from Python
    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    // Send allocation data to Python
    pythonProcess.stdin.write(
        JSON.stringify(req.body)
    );

    pythonProcess.stdin.end();

    // Python process finished
    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            console.error("Python solver error:");
            console.error(errorOutput);

            return res.status(500).json({
                error: "Solver failed",
                details: errorOutput
            });
        }

        try {
            const result = JSON.parse(output);

            return res.json(result);
        } catch {
            console.error("Could not parse solver output:");
            console.error(output);

            return res.status(500).json({
                error: "Invalid solver response"
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(
        `Server running on http://127.0.0.1:${PORT}`
    );
});