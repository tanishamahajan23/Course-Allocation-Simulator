import { Router } from "express";
import { prisma } from "./database.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required",
            });
        }

        const student = await prisma.student.create({
            data: {
                name,
                email,
            },
        });

        return res.status(201).json(student);
    } catch (error) {
        console.error("Failed to create student:", error);

        return res.status(500).json({
            error: "Failed to create student",
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const students = await prisma.student.findMany();

        return res.json(students);
    } catch (error) {
        console.error("Failed to fetch students:", error);

        return res.status(500).json({
            error: "Failed to fetch students",
        });
    }
});

export default router;