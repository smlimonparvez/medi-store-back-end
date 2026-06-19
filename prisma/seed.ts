import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

// const prisma = new PrismaClient();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string,
});

async function main() {
  console.log("Starting seed...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@medistore.com" },
    update: {},
    create: {
      name: "MediStore Admin",
      email: "admin@medistore.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
    },
  });

  console.log("✅ Admin seeded:", admin.email);

  const categoriesData = [
    { name: "Pain Relief", slug: "pain-relief" },
    { name: "Vitamins & Supplements", slug: "vitamins-supplements" },
    { name: "Cold & Flu", slug: "cold-flu" },
    { name: "Digestive Health", slug: "digestive-health" },
    { name: "Skin Care", slug: "skin-care" },
    { name: "Eye & Ear Care", slug: "eye-ear-care" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✅ Categories seeded");
  console.log("\n Seed complete!");
  console.log("----------------------------");
  console.log("Admin Email:    admin@medistore.com");
  console.log("Admin Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
