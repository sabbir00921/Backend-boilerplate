const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));
router.use("/job", require("./api/job.api"));

module.exports = router;
