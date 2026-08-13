import bcrypt from "bcryptjs";
import { prisma } from "./database.js";

async function main() {
    // Remove student accounts created by the old seed
    await prisma.user.deleteMany({
        where: {
            role: "STUDENT",
        },
    });

    const passwordHash = await bcrypt.hash(
        "admin123",
        10
    );

    await prisma.user.upsert({
        where: {
            email: "admin@coursealloc.local",
        },
        update: {
            passwordHash,
            role: "ADMIN",
            studentId: null,
        },
        create: {
            email: "admin@coursealloc.local",
            passwordHash,
            role: "ADMIN",
        },
    });

    console.log("Admin account ready.");
    console.log(
        "Email: admin@coursealloc.local"
    );
    console.log("Password: admin123");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });