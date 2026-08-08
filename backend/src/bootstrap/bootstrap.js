import bcrypt from "bcrypt";
import { z } from "zod";

import prisma from "../database/prisma.js";
import env from "../config/env.js";

const bootstrapCredentialsSchema = z.object({
  ownerName: z.string().trim().min(1).max(120),
  ownerEmail: z.string().trim().email().transform((value) => value.toLowerCase()),
  ownerPassword: z.string().min(6),
});

const getBootstrapCredentials = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Bootstrap is disabled in production.");
  }

  const result = bootstrapCredentialsSchema.safeParse(env.bootstrap);

  if (!result.success) {
    throw new Error(
      "Bootstrap owner credentials are required: BOOTSTRAP_OWNER_NAME, BOOTSTRAP_OWNER_EMAIL, and BOOTSTRAP_OWNER_PASSWORD (minimum 6 characters).",
    );
  }

  return result.data;
};

async function bootstrap() {
  const credentials = getBootstrapCredentials();

  console.log("🚀 Bootstrapping Restaurant...");

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

  const settings = await prisma.restaurantSettings.findUnique({
    where: { restaurantId: restaurant.id },
  });

  if (!settings) {
    await prisma.restaurantSettings.create({
      data: { restaurantId: restaurant.id },
    });

    console.log("✅ Restaurant settings created");
  } else {
    console.log("ℹ️ Restaurant settings already exist");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      restaurantId_email: {
        restaurantId: restaurant.id,
        email: credentials.ownerEmail,
      },
    },
  });

  if (!existingUser) {
    const password = await bcrypt.hash(credentials.ownerPassword, 10);

    await prisma.user.create({
      data: {
        restaurantId: restaurant.id,
        name: credentials.ownerName,
        email: credentials.ownerEmail,
        password,
        role: "OWNER",
      },
    });

    console.log("✅ Owner user created");
  } else {
    console.log("ℹ️ Owner user already exists");
  }

  console.log("✅ Bootstrap completed successfully.");
}

bootstrap()
  .catch((error) => {
    console.error(error?.message || "Bootstrap failed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
