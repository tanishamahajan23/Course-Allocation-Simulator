import express from "express";

import { prisma } from "./database.js";
import {
    AuthRequest,
    requireAuth,
    requireStudent,
} from "./auth.middleware.js";

const router = express.Router();

router.use(
    requireAuth,
    requireStudent
);

router.get(
    "/me",
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            const student =
                await prisma.student.findUnique({
                    where: {
                        id: req.user!.studentId!,
                    },
                    include: {
                        preferences: {
                            include: {
                                course: true,
                            },
                            orderBy: {
                                rank: "asc",
                            },
                        },
                        allocations: {
                            include: {
                                course: true,
                            },
                        },
                    },
                });

            if (!student) {
                return res.status(404).json({
                    error: "Student not found.",
                });
            }

            return res.json(student);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error:
                    "Failed to load student profile.",
            });
        }
    }
);

router.get(
    "/preferences",
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            const preferences =
                await prisma.preference.findMany({
                    where: {
                        studentId:
                            req.user!.studentId!,
                    },
                    include: {
                        course: true,
                    },
                    orderBy: {
                        rank: "asc",
                    },
                });

            return res.json(preferences);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error:
                    "Failed to load preferences.",
            });
        }
    }
);

router.get(
    "/allocation",
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            const allocation =
                await prisma.allocation.findUnique({
                    where: {
                        studentId:
                            req.user!.studentId!,
                    },
                    include: {
                        course: true,
                    },
                });

            return res.json(
                allocation || null
            );
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error:
                    "Failed to load allocation.",
            });
        }
    }
);

router.get(
    "/courses",
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            const courses =
                await prisma.course.findMany({
                    orderBy: {
                        code: "asc",
                    },
                });

            return res.json(courses);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error:
                    "Failed to load courses.",
            });
        }
    }
);

router.post(
    "/preferences",
    async (
        req: AuthRequest,
        res
    ) => {
        try {
            const studentId =
                req.user!.studentId!;

                const existingAllocation =
                await prisma.allocation.findUnique({
                    where: {
                        studentId,
                    },
                });
            
            if (existingAllocation) {
                return res.status(409).json({
                    error:
                        "Preferences are locked while an allocation exists. Ask the administrator to reset the allocation.",
                });
            }

            const {
                courseIds,
            } = req.body;

            if (
                !Array.isArray(courseIds)
            ) {
                return res.status(400).json({
                    error:
                        "courseIds must be an array.",
                });
            }

            if (courseIds.length === 0) {
                return res.status(400).json({
                    error:
                        "Select at least one course.",
                });
            }

            if (courseIds.length > 5) {
                return res.status(400).json({
                    error:
                        "You can select a maximum of 5 courses.",
                });
            }

            const uniqueCourseIds =
                new Set(courseIds);

            if (
                uniqueCourseIds.size !==
                courseIds.length
            ) {
                return res.status(400).json({
                    error:
                        "A course cannot appear more than once.",
                });
            }

            const courses =
                await prisma.course.findMany({
                    where: {
                        id: {
                            in: courseIds,
                        },
                    },
                });

            if (
                courses.length !==
                courseIds.length
            ) {
                return res.status(400).json({
                    error:
                        "One or more selected courses do not exist.",
                });
            }

            await prisma.$transaction(
                async (tx) => {
                    await tx.preference.deleteMany({
                        where: {
                            studentId,
                        },
                    });

                    await tx.preference.createMany({
                        data: courseIds.map(
                            (
                                courseId: number,
                                index: number
                            ) => ({
                                studentId,
                                courseId,
                                rank: index + 1,
                            })
                        ),
                    });
                }
            );

            const preferences =
                await prisma.preference.findMany({
                    where: {
                        studentId,
                    },
                    include: {
                        course: true,
                    },
                    orderBy: {
                        rank: "asc",
                    },
                });

            return res.json({
                message:
                    "Preferences saved successfully.",
                preferences,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error:
                    "Failed to save preferences.",
            });
        }
    }
);

export default router;