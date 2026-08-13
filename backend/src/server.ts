import express from "express";
import cors from "cors";

import studentRoutes from "./student.routes.js";
import courseRoutes from "./course.routes.js";
import preferenceRoutes from "./preference.routes.js";
import allocationRoutes from "./allocation.routes.js";
import simulationRoutes from "./simulation.routes.js";
import authRoutes from "./auth.routes.js";
import studentPortalRoutes from "./student.portal.routes.js";

const app = express();

const PORT = Number(
    process.env.PORT || 5000
);

app.use(express.json());

app.use(
    cors({
        origin:true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/simulation", simulationRoutes);

app.use("/api/student",studentPortalRoutes);


app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Course Allocation API is running",
    });
});


app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);

app.get("/", (req, res) => {
    res.json({
        message:
            "Course Allocation Backend Working",
    });
});