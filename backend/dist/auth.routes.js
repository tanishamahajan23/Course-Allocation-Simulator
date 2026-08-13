import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./database.js";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
/*
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email.trim(),
            },
            include: {
                student: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }
        const token = jwt.sign({
            userId: user.id,
            role: user.role,
            studentId: user.studentId,
        }, JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                student: user.student,
            },
        });
    }
    catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({
            error: "Login failed.",
        });
    }
});
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required.",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters.",
            });
        }
        const student = await prisma.student.findUnique({
            where: {
                email: email.trim().toLowerCase(),
            },
        });
        if (!student) {
            return res.status(403).json({
                error: "This email is not registered by the administrator.",
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.trim(),
            },
        });
        if (existingUser) {
            return res.status(409).json({
                error: "An account already exists for this email.",
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: student.email,
                passwordHash,
                role: "STUDENT",
                studentId: student.id,
            },
        });
        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
            },
        });
    }
    catch (error) {
        console.error("Registration failed:", error);
        return res.status(500).json({
            error: "Registration failed.",
        });
    }
});
export default router;
