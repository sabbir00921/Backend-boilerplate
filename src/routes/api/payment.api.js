const express = require("express");
const paymentController = require("../../controller/payment.controller");
const _ = express.Router();

_.route("/succes").post(paymentController.success);
_.route("/fail").post(paymentController.fail);
_.route("/cancel").post(paymentController.cancel);
_.route("/ipn").post(paymentController.ipn);

module.exports = _;
