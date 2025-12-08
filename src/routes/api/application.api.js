const express = require("express");
const router = express.Router();
const applicationController = require("../../controller/application.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { permission } = require("../../middleware/permission.middleware");
const { upload } = require("../../middleware/multer.middleware");

router
  .route("/create-application")
  .post(
    authGuard,
    permission(["job_seeker"], ["add"]),
    upload.fields([{ name: "cv", maxCount: 1 }]),
    applicationController.createApplication
  );

router
  .route("/get-all-applications")
  .get(
    authGuard,
    permission(["admin", "employee"], ["view"]),
    applicationController.getAllApplications
  );
router
  .route("/get-applicationhistory")
  .get(
    authGuard,
    permission(["job_seeker"], ["view"]),
    applicationController.getApplicationHistoryById
  );

router
  .route("/accept-application/:id")
  .put(
    authGuard,
    permission(["admin", "employee"], ["edit"]),
    applicationController.acceptJob
  );

router
  .route("/reject-application/:id")
  .put(
    authGuard,
    permission(["admin", "employee"], ["edit"]),
    applicationController.rejectJob
  );

router
  .route("/delete-application/:id")
  .delete(
    authGuard,
    permission(["admin", "employee"], ["delete"]),
    applicationController.deleteApplication
  );

module.exports = router;
