import express from "express";
import cors from "cors";

import studentRoutes from "./student.routes.js";
import courseRoutes from "./course.routes.js";
import preferenceRoutes from "./preference.routes.js";
import allocationRoutes from "./allocation.routes.js";
import simulationRoutes from "./simulation.routes.js";

const app = express();

const PORT = 5000;

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/simulation", simulationRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Course Allocation API is running",
    });
});

app.listen(PORT, () => {
    console.log(
        `Server running on http://127.0.0.1:${PORT}`
    );
});