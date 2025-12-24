const express = require("express");
const router = express.Router();
const eventController = require("../../controller/event.controller");
const { upload } = require("../../middleware/multer.middleware");
const { authGuard } = require("../../middleware/auth.middleware");

router
  .route("/create-event")
  .post(upload.single("image"), authGuard, eventController.createEvent);

router.route("/get-events").get(authGuard, eventController.getAllEvents);

router.route("/get-upcomeing-events").get(eventController.getUpcomingEvents);

router.route("/get-previous-events").get(eventController.getPastEvents);

router.route("/get-event/:id").get(eventController.getEventById);
router
  .route("/edit-event/:id")
  .put(upload.single("image"), authGuard, eventController.updateEvent);

router
  .route("/delete-image/:id")
  .delete(authGuard, eventController.deleteEventImage);

router
  .route("/delete-event/:id")
  .delete(authGuard, eventController.deleteEvent);

router
  .route("/accept-invitation/:id")
  .put(authGuard, eventController.acceptInvitation);
router
  .route("/reject-invitation/:id")
  .put(authGuard, eventController.rejectInvitation);

module.exports = router;
