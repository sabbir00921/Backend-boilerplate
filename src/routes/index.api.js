const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));
router.use("/event", require("./api/event.api"));

module.exports = router;
