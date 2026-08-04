import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import env from "../config/env.js";
import {
  getRestaurantRoom,
  setSocketServer,
} from "./realtime.publisher.js";

const DASHBOARD_ROLES = new Set(["OWNER", "MANAGER"]);

const logRealtimeEvent = (...args) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[Realtime]", ...args);
  }
};

const getToken = (socket) => {
  const token = socket.handshake.auth?.token;

  return typeof token === "string" && token.trim() ? token : null;
};

const isAuthenticatedUser = (user) => {
  return (
    user &&
    typeof user === "object" &&
    typeof user.restaurantId === "string" &&
    user.restaurantId.length > 0 &&
    typeof user.role === "string" &&
    DASHBOARD_ROLES.has(user.role)
  );
};

export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  io.use((socket, next) => {
    const token = getToken(socket);

    if (!token) {
      return next(new Error("Unauthorized."));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);

      if (!isAuthenticatedUser(user)) {
        return next(new Error("Forbidden."));
      }

      socket.data.user = {
        restaurantId: user.restaurantId,
        role: user.role,
      };

      return next();
    } catch {
      return next(new Error("Unauthorized."));
    }
  });

  io.on("connection", async (socket) => {
    const { restaurantId } = socket.data.user;
    const room = getRestaurantRoom(restaurantId);

    await socket.join(room);

    console.log(`[Realtime] Socket connected to ${room}.`);
    logRealtimeEvent("room joined", {
      socketId: socket.id,
      room,
      joined: socket.rooms.has(room),
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Realtime] Socket disconnected from ${room}: ${reason}.`);
    });
  });

  setSocketServer(io);

  return io;
};
