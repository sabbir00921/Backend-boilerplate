const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const EventModel = require("../model/event.model");
const { CustomError } = require("../helpers/customError");
const { validateEventCreate } = require("../validation/auth.validation");
const {
  uploadImageCloudinary,
  deleteImageCloudinary,
} = require("../helpers/cloudinary");

// create event
exports.createEvent = asyncHandaler(async (req, res) => {
  const { images, value } = await validateEventCreate(req);

  //   upload image to cloudinary
  const image = await Promise.all(
    images.map(async (image) => {
      return await uploadImageCloudinary(image.path);
    })
  );

  const event = await EventModel.create({
    ...value,
    image,
  });
  if (!event) {
    await Promise.all(
      images.map(async (image) => {
        await uploadImageCloudinary(image?.public_id);
      })
    );
    throw new CustomError(400, "Event creation failed");
  }
  apiResponse.sendSucess(res, 201, "Event created successfully", event);
});

// get all events
exports.getAllEvents = asyncHandaler(async (req, res) => {
  const events = await EventModel.find({})
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");
  if (!events || events.length === 0)
    throw new CustomError(400, "Events not found");
  apiResponse.sendSucess(res, 200, "Events fetched successfully", events);
});

// get event by id
exports.getEventById = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const event = await EventModel.findById(id).populate(
    "createdBy",
    "name email"
  );
  if (!event) throw new CustomError(400, "Event not found");
  apiResponse.sendSucess(res, 200, "Event fetched successfully", event);
});

// upcomeing events
exports.getUpcomingEvents = asyncHandaler(async (req, res) => {
  const now = new Date();

  const events = await EventModel.find({
    date: { $gte: now },
  })
    .sort({ date: 1 }) // nearest upcoming first
    .populate("createdBy", "name email");

  if (!events || events.length === 0) {
    throw new CustomError(404, "Upcoming events not found");
  }

  apiResponse.sendSucess(
    res,
    200,
    "Upcoming events fetched successfully",
    events
  );
});

// get past events
exports.getPastEvents = asyncHandaler(async (req, res) => {
  const now = new Date();

  const events = await EventModel.find({
    date: { $lt: now },
  })
    .sort({ date: -1 }) // nearest past first
    .populate("createdBy", "name email");

  if (!events || events.length === 0) {
    throw new CustomError(404, "Past events not found");
  }

  apiResponse.sendSucess(res, 200, "Past events fetched successfully", events);
});

// update event
exports.updateEvent = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const event = await EventModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!event) throw new CustomError(400, "Event not found");

  // update image
  if (req.file) {
    const image = req?.file;

    const imageAsset = await uploadImageCloudinary(image.path);
    event.image.push(imageAsset);
    await event.save();
  }

  apiResponse.sendSucess(res, 200, "Event updated successfully", event);
});

// Delete single image
exports.deleteEventImage = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const { imageId } = req.query;
  console.log(req.params, req.query);

  if (!imageId) throw new CustomError(400, "Image id is required");

  const event = await EventModel.findById(id);
  if (!event) throw new CustomError(400, "Event not found");

  const image = event.image.find((image) => image.public_id === imageId);
  if (!image) throw new CustomError(400, "Image not found");

  await deleteImageCloudinary(image.public_id);

  event.image = event.image.filter((image) => image.public_id !== imageId);
  await event.save();

  apiResponse.sendSucess(res, 200, "Image deleted successfully");
});

// delete event
exports.deleteEvent = asyncHandaler(async (req, res) => {
  const { id } = req.params;

  const event = await EventModel.findByIdAndDelete(id);

  if (!event) throw new CustomError(400, "Event not found");

  if (event.image.length > 0) {
    await Promise.all(
      event.image.map(async (image) => {
        await deleteImageCloudinary(image?.public_id);
      })
    );
  }

  apiResponse.sendSucess(res, 200, "Event deleted successfully");
});
