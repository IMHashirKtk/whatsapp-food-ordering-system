import bcrypt from "bcrypt";
import prisma from "../database/prisma.js";

async function bootstrap() {
  console.log("🚀 Bootstrapping Restaurant...");

  // ----------------------------------------------------
  // Restaurant
  // ----------------------------------------------------

  let restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "Demo Restaurant",
        slug: "demo-restaurant",
        phone: "+920000000000",
        email: "admin@restaurant.com",
        currency: "PKR",
      },
    });

    console.log("✅ Restaurant created");
  } else {
    console.log("ℹ️ Restaurant already exists");
  }

  // ----------------------------------------------------
  // Restaurant Settings
  // ----------------------------------------------------

  const settings = await prisma.restaurantSettings.findUnique({
    where: {
      restaurantId: restaurant.id,
    },
  });

  if (!settings) {
    await prisma.restaurantSettings.create({
      data: {
        restaurantId: restaurant.id,
      },
    });

    console.log("✅ Restaurant settings created");
  } else {
    console.log("ℹ️ Restaurant settings already exist");
  }

  // ----------------------------------------------------
  // Owner User
  // ----------------------------------------------------

  const existingUser = await prisma.user.findUnique({
    where: {
      email: "owner@restaurant.com",
    },
  });

  if (!existingUser) {
    const password = await bcrypt.hash("12345678", 10);

    await prisma.user.create({
      data: {
        restaurantId: restaurant.id,
        name: "Restaurant Owner",
        email: "owner@restaurant.com",
        password,
        role: "OWNER",
      },
    });

    console.log("✅ Owner user created");
  } else {
    console.log("ℹ️ Owner user already exists");
  }

  console.log("");
  console.log("====================================");
  console.log("Bootstrap completed successfully.");
  console.log("====================================");
  console.log("");
  console.log("Login Credentials");
  console.log("-----------------");
  console.log("Email    : owner@restaurant.com");
  console.log("Password : 12345678");
}

bootstrap()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
