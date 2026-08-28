import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUsers = [
    { email: "ace@example.com", username: "ace_typer", bestTimeMs: 8200 },
    { email: "flash@example.com", username: "flash_fingers", bestTimeMs: 9100 },
    { email: "nova@example.com", username: "nova", bestTimeMs: 10500 },
    { email: "quill@example.com", username: "quill", bestTimeMs: 12300 },
    { email: "demo@example.com", username: "demo_user", bestTimeMs: 15000 },
  ];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { bestTimeMs: u.bestTimeMs },
      create: {
        email: u.email,
        username: u.username,
        passwordHash,
        bestTimeMs: u.bestTimeMs,
      },
    });

    await prisma.gameResult.create({
      data: {
        userId: user.id,
        timeMs: u.bestTimeMs,
        errorCount: Math.floor(Math.random() * 4),
        isNewBest: true,
      },
    });
  }

  console.log("✅ Seed complete. Demo login: demo@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
