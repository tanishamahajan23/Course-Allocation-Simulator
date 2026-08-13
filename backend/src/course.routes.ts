import { Router } from "express";
import { prisma } from "./database.js";

import {
    requireAuth,
    requireAdmin,
} from "./auth.middleware.js";

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
                error:
                    "Code, name, and capacity are required",
            });
        }

        if (
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            return res.status(400).json({
                error:
                    "Capacity must be a positive integer",
            });
        }

        const course =
            await prisma.course.create({
                data: {
                    code: code.trim(),
                    name: name.trim(),
                    capacity,
                },
            });

        return res.status(201).json(course);
    } catch (error) {
        console.error(
            "Failed to create course:",
            error
        );

        return res.status(500).json({
            error: "Failed to create course",
        });
    }
});

// Get all courses
router.get("/", async (req, res) => {
    try {
        const courses =
            await prisma.course.findMany({
                orderBy: {
                    id: "asc",
                },
            });

        return res.json(courses);
    } catch (error) {
        console.error(
            "Failed to fetch courses:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch courses",
        });
    }
});

// Update a course
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { code, name, capacity } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid course ID",
            });
        }

        if (!code || !name || capacity === undefined) {
            return res.status(400).json({
                error:
                    "Code, name, and capacity are required",
            });
        }

        if (
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            return res.status(400).json({
                error:
                    "Capacity must be a positive integer",
            });
        }

        const existingCourse =
            await prisma.course.findUnique({
                where: {
                    id,
                },
            });

        if (!existingCourse) {
            return res.status(404).json({
                error: "Course not found",
            });
        }

        const updatedCourse =
            await prisma.course.update({
                where: {
                    id,
                },
                data: {
                    code: code.trim(),
                    name: name.trim(),
                    capacity,
                },
            });

        return res.json(updatedCourse);
    } catch (error) {
        console.error(
            "Failed to update course:",
            error
        );

        return res.status(500).json({
            error: "Failed to update course",
        });
    }
});

// Delete a course
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid course ID",
            });
        }

        const course =
            await prisma.course.findUnique({
                where: {
                    id,
                },
            });

        if (!course) {
            return res.status(404).json({
                error: "Course not found",
            });
        }

        const affectedAllocations =
            await prisma.allocation.findMany({
                where: {
                    courseId: id,
                },
            });

        await prisma.$transaction(
            async (tx) => {
                // Remove allocations involving this course.
                await tx.allocation.deleteMany({
                    where: {
                        courseId: id,
                    },
                });

                // Remove student preferences for
                // the deleted course.
                await tx.preference.deleteMany({
                    where: {
                        courseId: id,
                    },
                });

                // Finally remove the course.
                await tx.course.delete({
                    where: {
                        id,
                    },
                });
            }
        );

        return res.json({
            message:
                "Course deleted successfully.",
            affectedStudents:
                affectedAllocations.length,
            allocationReset:
                affectedAllocations.length > 0,
        });
    } catch (error) {
        console.error(
            "Failed to delete course:",
            error
        );

        return res.status(500).json({
            error: "Failed to delete course",
        });
    }
});

export default router;