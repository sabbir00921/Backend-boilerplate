const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));
router.use("/job", require("./api/job.api"));
router.use("/application", require("./api/application.api"));
router.use("/payment", require("./api/payment.api"));
router.use("/invoice", require("./api/invoice.api"));
router.use("/analytics", require("./api/analytics.api"));

module.exports = router;
