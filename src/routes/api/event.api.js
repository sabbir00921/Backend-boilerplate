const express = require("express");
const router = express.Router();
const eventController = require("../../controller/event.controller");
const { upload } = require("../../middleware/multer.middleware");

router
  .route("/create-event")
  .post(
    upload.fields([{ name: "image", maxCount: 5 }]),
    eventController.createEvent
  );

router.route("/get-events").get(eventController.getAllEvents);
router.route("/get-upcomeing-events").get(eventController.getUpcomingEvents);
router.route("/get-previous-events").get(eventController.getPastEvents);
router.route("/get-event/:id").get(eventController.getEventById);
router
  .route("/edit-event/:id")
  .put(upload.single("image"), eventController.updateEvent);
router.route("/delete-image/:id").delete(eventController.deleteEventImage);
router.route("/delete-event/:id").delete(eventController.deleteEvent);

module.exports = router;
