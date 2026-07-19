import app from "./app.js";
import prisma from "./database/prisma.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("Prisma initialized:", !!prisma);
});
