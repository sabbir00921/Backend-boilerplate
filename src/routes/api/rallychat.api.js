const express = require("express");
const router = express.Router();
const rallychatController = require("../../controller/rallychat.controller");
const { authGuard } = require("../../middleware/auth.middleware");

router
  .route("/sent-message/:rallyId")
  .post(authGuard, rallychatController.sendMessage);

module.exports = router;
