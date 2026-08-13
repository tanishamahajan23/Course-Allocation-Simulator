import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header ||
        !header.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }
    const token = header.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") {
            return res.status(401).json({
                error: "Invalid token.",
            });
        }
        const payload = decoded;
        req.user = {
            userId: payload.userId,
            role: payload.role,
            studentId: payload.studentId,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token.",
        });
    }
}
export function requireStudent(req, res, next) {
    if (req.user?.role !== "STUDENT") {
        return res.status(403).json({
            error: "Student access required.",
        });
    }
    next();
}
export function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            error: "Admin access required.",
        });
    }
    next();
}
