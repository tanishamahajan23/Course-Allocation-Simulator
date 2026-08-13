import { Router } from "express";
import { prisma } from "./database.js";

import {
    requireAuth,
    requireAdmin,
} from "./auth.middleware.js";



// your existing course routes below...

const router = Router();

router.use(
    requireAuth,
    requireAdmin
);

// Create a course
router.post("/", async (req, res) => {
    try {
        const { code, name, capacity } = req.body;

        if (!code || !name || capacity === undefined) {
            return res.status(400).json({
                error: "Code, name, and capacity are required",
            });
        }

        if (!Number.isInteger(capacity) || capacity <= 0) {
            return res.status(400).json({
                error: "Capacity must be a positive integer",
            });
        }

        const course = await prisma.course.create({
            data: {
                code,
                name,
                capacity,
            },
        });

        return res.status(201).json(course);
    } catch (error) {
        console.error("Failed to create course:", error);

        return res.status(500).json({
            error: "Failed to create course",
        });
    }
});

// Get all courses
router.get("/", async (req, res) => {
    try {
        const courses = await prisma.course.findMany();

        return res.json(courses);
    } catch (error) {
        console.error("Failed to fetch courses:", error);

        return res.status(500).json({
            error: "Failed to fetch courses",
        });
    }
});

export default router;