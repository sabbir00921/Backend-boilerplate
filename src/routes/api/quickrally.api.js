const express = require("express");
const router = express.Router();
const quickrallyController = require("../../controller/quickrqlly.controller");
const { authGuard } = require("../../middleware/auth.middleware");

router
  .route("/create-quickrally")
  .post(authGuard, quickrallyController.createQuickRally);

router
  .route("/join-quickrally/:inviteCode")
  .post(authGuard, quickrallyController.joinQuickRally);
router
  .route("/leave-quickrally/:rallyId")
  .post(authGuard, quickrallyController.leaveQuickRally);

router
  .route("/single-quickrally/:id")
  .get(quickrallyController.getSingleQuickRally);
router.route("/get-quickrallies").get(quickrallyController.getAllQuickRallies);
router
  .route("/update-quickrallies/:id")
  .get(authGuard, quickrallyController.updateQuickRally);
router
  .route("/delete-quickrallies/:id")
  .get(authGuard, quickrallyController.deleteQuickRally);

module.exports = router;
