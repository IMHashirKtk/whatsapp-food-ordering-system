import { createServer } from "node:http";

import app from "./app.js";
import prisma from "./database/prisma.js";
import env from "./config/env.js";
import { initializeSocketServer } from "./realtime/socket.server.js";

const httpServer = createServer(app);

initializeSocketServer(httpServer);

httpServer.listen(env.port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${env.port}`);
  console.log("Prisma initialized:", !!prisma);
});
