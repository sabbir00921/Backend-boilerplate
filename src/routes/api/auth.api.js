const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");
const { authGuard } = require("../../middleware/auth.middleware");

router.route("/registration").post(authController.registration);
router.route("/login").post(authController.login);
router.route("/get-single-user").get(authGuard, authController.getSingleUser);
router.route("/update-userdata/:userid").put(authGuard,authController.updateUser);
router.route("/change-password").post(authController.changePassword);
router.route("/logout").post(authController.logout);
router.route("/forget-password").post(authController.forgetPassword);
router.route("/verify-otp").post(authController.verifyForgetPasswordOtp);
router.route("/reset-password").post(authController.resetPassword);

module.exports = router;
