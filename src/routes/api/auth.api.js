const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");

router.route("/registration").post(authController.registration);
router.route("/login").post(authController.login);
router.route("/get-single-user/:id").get(authController.getSingleUser);
router.route("/logout").post(authController.logout);
router.route("/change-password").post(authController.changePassword);
router.route("/forget-password").post(authController.forgetPassword);
router.route("/verify-otp").post(authController.verifyForgetPasswordOtp);
router.route("/reset-password").post(authController.resetPassword);

module.exports = router;
