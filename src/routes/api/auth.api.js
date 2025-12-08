const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { permission } = require("../../middleware/permission.middleware");

router.route("/registration").post(authController.registration);

router
  .route("/getall-users")
  .get(authGuard, permission(["admin"], ["view"]), authController.getAllUser);
router.route("/login-users").post(authController.login);

router
  .route("/get-user/:id")
  .delete(
    authGuard,
    permission(["admin", "employee"], ["view"]),
    authController.deleteUser
  );

router
  .route("/update-user/:id")
  .put(authGuard, permission(["admin"], ["edit"]), authController.updateUser);

router
  .route("/delete-user/:id")
  .delete(
    authGuard,
    permission(["admin"], ["delete"]),
    authController.deleteUser
  );

router.route("/logout-users").post(authController.logout);
router
  .route("/generate-access-token")
  .post(authController.regenerateAccessToken);

module.exports = router;
