const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorhandaler } = require("./helpers/globalErrorhandaler");
const { serverLiveTemplate } = require("./template/serverLiveTemplate");

// Middleware
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base
app.get("/", (_, res) => {
  serverLiveTemplate(res);
});

// Routes
app.use("/api/v1", require("./routes/index.api"));

// global error handler
app.use(globalErrorhandaler);
module.exports = app;
