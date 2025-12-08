const express = require("express");
const router = express.Router();
const analyticsController = require("../../controller/analytics.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { permission } = require("../../middleware/permission.middleware");

router
  .route("/get-analytics")
  .get(
    authGuard,
    permission(["admin"], ["view"]),
    analyticsController.getAnalytics
  );

module.exports = router;
