const express = require("express");
const router = express.Router();
const jobController = require("../../controller/job.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { permission } = require("../../middleware/permission.middleware");

router
  .route("/create-job")
  .post(
    authGuard,
    permission(["employee", "admin"], ["add"]),
    jobController.createJob
  );

router.route("/get-all-jobs").get(authGuard, jobController.getAllJobs);

router.route("/get-job/:id").get(jobController.getJobById);

router
  .route("/update-job/:id")
  .put(
    authGuard,
    permission(["employee", "admin"], ["edit"]),
    jobController.updateJob
  );

router
  .route("/delete-job/:id")
  .delete(
    authGuard,
    permission(["employee", "admin"], ["delete"]),
    jobController.deleteJob
  );

module.exports = router;
