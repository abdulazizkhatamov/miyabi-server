import { PrismaClient } from "./generated/prisma";
import argon2 from "argon2";
const prisma = new PrismaClient();
async function main() {
  const dummyAdmin = {
    email: process.env.SUPER_ADMIN_EMAIL || "t@t.com",
    name: process.env.SUPER_ADMIN_NAME || "Abdulaziz",
    password: process.env.SUPER_ADMIN_PASSWORD || "Admin123!",
  };

  const hashedPassword = await argon2.hash(dummyAdmin.password);

  await prisma.admin.upsert({
    where: { email: dummyAdmin.email },
    update: {},
    create: {
      email: dummyAdmin.email,
      name: dummyAdmin.name,
      password: hashedPassword,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
