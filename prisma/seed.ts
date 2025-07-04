import { PrismaClient } from "./generated/prisma";
import argon2 from "argon2";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const dummyAdmin = {
    email: process.env.SUPER_ADMIN_EMAIL || "t@t.com",
    name: process.env.SUPER_ADMIN_NAME || "Abdulaziz",
    password: process.env.SUPER_ADMIN_PASSWORD || "Admin123!",
  };

  const hashedPassword = await argon2.hash(dummyAdmin.password);

  console.log("Processing...");

  await prisma.admin.upsert({
    where: { email: dummyAdmin.email },
    update: {},
    create: {
      email: dummyAdmin.email,
      name: dummyAdmin.name,
      password: hashedPassword,
      roles: ["super_admin"],
    },
  });
}
main()
  .then(async () => {
    console.log("Disconnecting...");

    await prisma.$disconnect();

    console.log("Disconnected.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
