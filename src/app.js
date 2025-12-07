const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorhandaler } = require("./helpers/globalErrorhandaler");

// Middleware
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", require("./routes/index.api"));

// global error handler
app.use(globalErrorhandaler);
module.exports = app;
