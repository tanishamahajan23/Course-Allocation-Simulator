import {
    Request,
    Response,
    NextFunction,
} from "express";

import jwt, {
    JwtPayload,
} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not defined in environment variables."
    );
}

interface TokenPayload extends JwtPayload {
    userId: number;
    role: "ADMIN" | "STUDENT";
    studentId: number | null;
}

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        role: "ADMIN" | "STUDENT";
        studentId: number | null;
    };
}

export function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const header =
        req.headers.authorization;

    if (
        !header ||
        !header.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    const token = header.substring(7);

    try {
        const decoded = jwt.verify(
            token,
            JWT_SECRET!
        );

        if (typeof decoded === "string") {
            return res.status(401).json({
                error: "Invalid token.",
            });
        }

        const payload =
            decoded as TokenPayload;

        req.user = {
            userId: payload.userId,
            role: payload.role,
            studentId: payload.studentId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token.",
        });
    }
}

export function requireStudent(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    if (req.user?.role !== "STUDENT") {
        return res.status(403).json({
            error: "Student access required.",
        });
    }

    next();
}

export function requireAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            error: "Admin access required.",
        });
    }

    next();
}