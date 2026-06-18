import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@arenafc.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "123456";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrador Arena FC",
      passwordHash,
    },
    create: {
      name: "Administrador Arena FC",
      email: adminEmail,
      passwordHash,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
