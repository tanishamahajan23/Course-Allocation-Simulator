import { Router } from "express";
import { prisma } from "./database.js";
import { requireAuth, requireAdmin, } from "./auth.middleware.js";
const router = Router();
router.use(requireAuth, requireAdmin);
// Create student
router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                error: "Name and email are required.",
            });
        }
        const existingStudent = await prisma.student.findUnique({
            where: {
                email: email.trim(),
            },
        });
        if (existingStudent) {
            return res.status(409).json({
                error: "A student with this email already exists.",
            });
        }
        const student = await prisma.student.create({
            data: {
                name: name.trim(),
                email: email.trim(),
            },
        });
        return res.status(201).json(student);
    }
    catch (error) {
        console.error("Failed to create student:", error);
        return res.status(500).json({
            error: "Failed to create student.",
        });
    }
});
// Get all students
router.get("/", async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            orderBy: {
                id: "asc",
            },
        });
        return res.json(students);
    }
    catch (error) {
        console.error("Failed to fetch students:", error);
        return res.status(500).json({
            error: "Failed to fetch students.",
        });
    }
});
// Update student
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email } = req.body;
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid student ID.",
            });
        }
        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                error: "Name and email are required.",
            });
        }
        const student = await prisma.student.findUnique({
            where: { id },
        });
        if (!student) {
            return res.status(404).json({
                error: "Student not found.",
            });
        }
        const emailOwner = await prisma.student.findUnique({
            where: {
                email: email.trim(),
            },
        });
        if (emailOwner &&
            emailOwner.id !== id) {
            return res.status(409).json({
                error: "Another student already uses this email.",
            });
        }
        const updatedStudent = await prisma.student.update({
            where: { id },
            data: {
                name: name.trim(),
                email: email.trim(),
            },
        });
        return res.json(updatedStudent);
    }
    catch (error) {
        console.error("Failed to update student:", error);
        return res.status(500).json({
            error: "Failed to update student.",
        });
    }
});
// Delete student
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid student ID.",
            });
        }
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                preferences: true,
                allocations: true,
            },
        });
        if (!student) {
            return res.status(404).json({
                error: "Student not found.",
            });
        }
        if (student.allocations.length > 0) {
            return res.status(409).json({
                error: "This student has an active allocation. Reset the allocation before deleting the student.",
            });
        }
        await prisma.$transaction(async (tx) => {
            await tx.preference.deleteMany({
                where: {
                    studentId: id,
                },
            });
            await tx.student.delete({
                where: {
                    id,
                },
            });
        });
        return res.json({
            message: "Student deleted successfully.",
        });
    }
    catch (error) {
        console.error("Failed to delete student:", error);
        return res.status(500).json({
            error: "Failed to delete student.",
        });
    }
});
export default router;
