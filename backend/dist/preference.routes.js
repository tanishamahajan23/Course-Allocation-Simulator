import { Router } from "express";
import { prisma } from "./database.js";
const router = Router();
// Create a student preference
router.post("/", async (req, res) => {
    try {
        const { studentId, courseId, rank } = req.body;
        if (studentId === undefined ||
            courseId === undefined ||
            rank === undefined) {
            return res.status(400).json({
                error: "studentId, courseId, and rank are required",
            });
        }
        if (!Number.isInteger(rank) || rank <= 0) {
            return res.status(400).json({
                error: "Rank must be a positive integer",
            });
        }
        const preference = await prisma.preference.create({
            data: {
                studentId,
                courseId,
                rank,
            },
        });
        return res.status(201).json(preference);
    }
    catch (error) {
        console.error("Failed to create preference:", error);
        return res.status(500).json({
            error: "Failed to create preference",
        });
    }
});
// Get all preferences
router.get("/", async (req, res) => {
    try {
        const preferences = await prisma.preference.findMany({
            include: {
                student: true,
                course: true,
            },
            orderBy: [
                {
                    studentId: "asc",
                },
                {
                    rank: "asc",
                },
            ],
        });
        return res.json(preferences);
    }
    catch (error) {
        console.error("Failed to fetch preferences:", error);
        return res.status(500).json({
            error: "Failed to fetch preferences",
        });
    }
});
export default router;
