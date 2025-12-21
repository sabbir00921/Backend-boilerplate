const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));

module.exports = router;
