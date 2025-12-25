let io = null;
const { Server } = require("socket.io");
const { CustomError } = require("../helpers/customError");

module.exports = {
  initSocket: (httpServer) => {
    io = new Server(httpServer, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);

      const userId = socket.handshake.query.userId;
      if (userId) {
        socket.join(userId); // user personal room
        console.log("👤 User room joined:", userId);
      }

      // ✅ JOIN RALLY ROOM
      socket.on("joinRally", ({ rallyId }) => {
        socket.join(rallyId);
        console.log(`👥 Socket joined rally room: ${rallyId}`);
      });

      // ✅ CORRECT disconnect
      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });
  },

  getIo: () => {
    if (!io) throw new CustomError(500, "Socket.io not initialized");
    return io;
  },
};
