const chalk = require("chalk");
const { io } = require("socket.io-client");

const RALLY_ID = "694c6cb555d111d0d5b9fc88";

const socket = io("http://localhost:5000", {
  query: { userId: "123" },
});

// ✅ CONNECT
socket.on("connect", () => {
  console.log(chalk.yellow("Client server connected"));

  // ✅ JOIN RALLY ROOM
  socket.emit("joinRally", { rallyId: RALLY_ID });
});

// 🔔 NEW RALLY CREATED (HOST / USERS)
socket.on("createRally", (payload) => {
  console.log(chalk.green("[NEW RALLY]"), payload.message);
});

// 🔔 CHAT MESSAGE
socket.on("newMessage", (payload) => {
  console.log(chalk.cyan("[CHAT]"), payload.sender, ":", payload.message);
});

// 🔔 NEW MEMBER JOINED (🔥 THIS WAS MISSING)
socket.on("rallyMemberJoined", (payload) => {
  console.log(
    chalk.magenta("[RALLY UPDATE]"),
    payload.message,
    "| User:",
    payload.userId
  );
});

// ❌ DISCONNECT
socket.on("disconnect", () => {
  console.log(chalk.bgRed("Disconnect from server"));
});

// ⚠️ CONNECTION ERROR
socket.on("connect_error", (err) => {
  console.log(chalk.bgYellow("Connection Error"), err.message);
});
