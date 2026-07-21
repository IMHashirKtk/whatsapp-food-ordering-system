import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  /* ==========================
     Clear Database
  ========================== */

  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.cartItemOption.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  await prisma.option.deleteMany();
  await prisma.optionGroup.deleteMany();

  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  await prisma.customer.deleteMany();

  await prisma.admin.deleteMany();

  /* ==========================
     Admin User
  ========================== */

  const password = await bcrypt.hash("Admin@123", 10);

  await prisma.admin.create({
    data: {
      name: "Administrator",
      email: "admin@example.com",
      password,
    },
  });

  /* ==========================
     Categories
  ========================== */

  const pizza = await prisma.category.create({
    data: {
      name: "Pizza",
      description: "Fresh oven baked pizzas",
      sortOrder: 1,
    },
  });

  const burgers = await prisma.category.create({
    data: {
      name: "Burgers",
      description: "Premium grilled burgers",
      sortOrder: 2,
    },
  });

  const shawarma = await prisma.category.create({
    data: {
      name: "Shawarma",
      description: "Arabic style shawarma",
      sortOrder: 3,
    },
  });

  const drinks = await prisma.category.create({
    data: {
      name: "Drinks",
      description: "Cold beverages",
      sortOrder: 4,
    },
  });

  /* ==========================
     Pizza
  ========================== */

  const chickenTikka = await prisma.menuItem.create({
    data: {
      categoryId: pizza.id,
      name: "Chicken Tikka Pizza",
      description: "Loaded with chicken tikka",
      basePrice: 1299,
      isFeatured: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: pizza.id,
      name: "Fajita Pizza",
      description: "Spicy fajita chicken",
      basePrice: 1399,
    },
  });

  /* ==========================
     Burgers
  ========================== */

  await prisma.menuItem.create({
    data: {
      categoryId: burgers.id,
      name: "Zinger Burger",
      description: "Crispy chicken fillet",
      basePrice: 699,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: burgers.id,
      name: "Beef Burger",
      description: "Juicy beef patty",
      basePrice: 799,
    },
  });

  /* ==========================
     Shawarma
  ========================== */

  await prisma.menuItem.create({
    data: {
      categoryId: shawarma.id,
      name: "Chicken Shawarma",
      description: "Arabic wrap",
      basePrice: 399,
    },
  });

  /* ==========================
     Drinks
  ========================== */

  await prisma.menuItem.create({
    data: {
      categoryId: drinks.id,
      name: "Coca Cola",
      description: "500ml",
      basePrice: 120,
    },
  });

  /* ==========================
     Option Groups
  ========================== */

  const size = await prisma.optionGroup.create({
    data: {
      menuItemId: chickenTikka.id,
      name: "Choose Size",
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      sortOrder: 1,
    },
  });

  await prisma.option.createMany({
    data: [
      {
        optionGroupId: size.id,
        name: "Small",
        extraPrice: 0,
        sortOrder: 1,
      },
      {
        optionGroupId: size.id,
        name: "Medium",
        extraPrice: 300,
        sortOrder: 2,
      },
      {
        optionGroupId: size.id,
        name: "Large",
        extraPrice: 700,
        sortOrder: 3,
      },
    ],
  });

  const cheese = await prisma.optionGroup.create({
    data: {
      menuItemId: chickenTikka.id,
      name: "Extra Cheese",
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      sortOrder: 2,
    },
  });

  await prisma.option.createMany({
    data: [
      {
        optionGroupId: cheese.id,
        name: "Yes",
        extraPrice: 250,
        sortOrder: 1,
      },
      {
        optionGroupId: cheese.id,
        name: "No",
        extraPrice: 0,
        sortOrder: 2,
      },
    ],
  });

  console.log("✅ Database seeded successfully.");
  console.log("");
  console.log("Admin Login");
  console.log("Email: admin@example.com");
  console.log("Password: Admin@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
