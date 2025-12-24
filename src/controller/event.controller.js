const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const EventModel = require("../model/event.model");
const UserModel = require("../model/user.model");
const { CustomError } = require("../helpers/customError");

const {
  uploadImageCloudinary,
  deleteImageCloudinary,
} = require("../helpers/cloudinary");
const { validateEventCreate } = require("../validation/event.validation");

// create event
exports.createEvent = asyncHandaler(async (req, res) => {
  const { value, image } = await validateEventCreate(req);
  const hostId = req.user._id;

  const invitations = value.invitations
    ? value.invitations.map((userId) => ({
        user: userId,
        status: "pending",
        invitedAt: new Date(),
      }))
    : [];

  const event = new EventModel({
    ...value,
    host: hostId,
    invitations,
    barhops: value?.barhopId,
  });

  const eventCreate = await event.save();
  if (!eventCreate) throw new CustomError(400, "Event creation failed");

  // Upload image to cloudinary
  if (image) {
    const response = await uploadImageCloudinary(image.path);
    event.image = response;
  }

  await eventCreate.save();

  //  Update invited users
  if (value.invitations?.length) {
    await Promise.all(
      value.invitations.map((userId) =>
        UserModel.findByIdAndUpdate(
          userId,
          { $addToSet: { invitations: eventCreate._id } },
          { new: true }
        )
      )
    );
  }

  apiResponse.sendSucess(res, 201, "Event created successfully", eventCreate);
});

// get all events
exports.getAllEvents = asyncHandaler(async (req, res) => {
  const role = req.user.role;

  if (role === "admin") {
    const events = await EventModel.find({})
      .sort({ createdAt: -1 })
      .populate("host", "name email")
      .populate("invitations.user", "name email")
      .populate("participants.user", "name email");
    if (!events || events.length === 0)
      throw new CustomError(400, "Events not found");
    apiResponse.sendSucess(res, 200, "Events fetched successfully", events);
  } else {
    const events = await EventModel.find({ host: req.user._id })
      .sort({ createdAt: -1 })
      .populate("host", "name email")
      .populate("invitations.user", "name email")
      .populate("participants.user", "name email");
    if (!events || events.length === 0)
      throw new CustomError(400, "Events not found");
    apiResponse.sendSucess(res, 200, "Events fetched successfully", events);
  }
});

// get event by id
exports.getEventById = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const event = await EventModel.findById(id)
    .populate("host", "name email")
    .populate("invitations.user", "name email")
    .populate("participants.user", "name email");
  if (!event) throw new CustomError(400, "Event not found");
  apiResponse.sendSucess(res, 200, "Event fetched successfully", event);
});

// upcomeing events
exports.getUpcomingEvents = asyncHandaler(async (req, res) => {
  const now = new Date();

  const events = await EventModel.find({
    startsAt: { $gte: now },
  })
    .sort({ startsAt: 1 }) // nearest upcoming first
    .populate("host", "name email")
    .populate("invitations.user", "name email")
    .populate("participants.user", "name email");

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
    startsAt: { $lt: now },
  })
    .sort({ startsAt: -1 }) // most recent past first
    .populate("host", "name email")
    .populate("invitations.user", "name email")
    .populate("participants.user", "name email");

  if (!events || events.length === 0) {
    throw new CustomError(404, "Past events not found");
  }

  apiResponse.sendSucess(res, 200, "Past events fetched successfully", events);
});

exports.updateEvent = asyncHandaler(async (req, res) => {
  const { id } = req.params;

  //  Find event
  const event = await EventModel.findById(id);
  if (!event) throw new CustomError(404, "Event not found");
  if (event.host.toString() !== req.user._id.toString())
    throw new CustomError(400, "You are not allowed to edit this event");

  //  Update allowed fields
  const allowedFields = [
    "title",
    "description",
    "fee",
    "startsAt",
    "location",
    "isQuickRally",
    "capacity",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  });

  //  Replace image (delete old → upload new
  if (req.file) {
    // delete old images from cloudinary
    console.log(event.image);

    if (event?.image.public_id) {
      await deleteImageCloudinary(event.image.public_id);
      event.image = {};
    }

    // upload new image
    const imageAsset = await uploadImageCloudinary(req.file.path);
    event.image = imageAsset;
  }

  await event.save();

  apiResponse.sendSucess(res, 200, "Event updated successfully", event);
});

// Delete  image
exports.deleteEventImage = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const { public_id } = req.query;

  if (!public_id) throw new CustomError(400, "Image id is required");

  const event = await EventModel.findById(id);
  if (!event) throw new CustomError(400, "Event not found");
  if (event.host.toString() !== req.user._id.toString())
    throw new CustomError(400, "You are not allowed to delete this event");

  const response = await deleteImageCloudinary(event.image.public_id);
  if (!response) throw new CustomError(400, "Image not found");
  event.image = {};

  await event.save();

  apiResponse.sendSucess(res, 200, "Image deleted successfully");
});

// delete event
exports.deleteEvent = asyncHandaler(async (req, res) => {
  const { id } = req.params;

  const response = await EventModel.findById(id);
  if (!response) throw new CustomError(400, "Event not found");

  if (response.host.toString() !== req.user._id.toString())
    throw new CustomError(400, "You are not allowed to delete this event");
  const event = await EventModel.findByIdAndDelete(id);

  // delete invitations list from invited users
  if (event.invitations?.length > 0) {
    await Promise.all(
      event.invitations.map(async (invited) => {
        const user = await UserModel.findByIdAndUpdate(
          invited.user,
          { $pull: { invitations: event._id } },
          { new: true }
        );
      })
    );
  }

  if (event.image.public_id) {
    await deleteImageCloudinary(event.image?.public_id);
  }

  apiResponse.sendSucess(res, 200, "Event deleted successfully");
});

// accept invitation
exports.acceptInvitation = asyncHandaler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Find event
  const event = await EventModel.findById(eventId);
  if (!event) throw new CustomError(404, "Event not found");

  // 2️⃣ Prevent host from accepting
  if (event.host.toString() === userId.toString()) {
    throw new CustomError(400, "Host cannot accept their own invitation");
  }

  // 3️⃣ Find invitation
  const invitation = event.invitations.find(
    (i) => i.user.toString() == userId.toString()
  );

  if (!invitation) {
    throw new CustomError(400, "Invitation not found");
  }

  // 4️⃣ Prevent duplicate response
  if (invitation.status !== "pending") {
    throw new CustomError(400, "Invitation already responded");
  }

  // 5️⃣ Check capacity
  if (event.participants.length >= event.capacity) {
    throw new CustomError(400, "Event capacity is full");
  }

  // 6️⃣ Update invitation status
  invitation.status = "accepted";
  invitation.respondedAt = new Date();

  // 7️⃣ Add to participants (avoid duplicates)
  const alreadyParticipant = event.participants.some(
    (p) => p.user.toString() === userId.toString()
  );

  if (!alreadyParticipant) {
    event.participants.push({
      user: userId,
      joinedAt: new Date(),
    });
  }

  await event.save();

  // 8️⃣ Remove invitation from user model
  await UserModel.findByIdAndUpdate(userId, {
    $pull: { invitations: event._id },
  });

  apiResponse.sendSucess(res, 200, "Invitation accepted successfully");
});

// reject invitation
exports.rejectInvitation = asyncHandaler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;

  // 1️⃣ Find event
  const event = await EventModel.findById(eventId);
  if (!event) throw new CustomError(404, "Event not found");

  // 2️⃣ Prevent host from rejecting
  if (event.host.toString() === userId.toString()) {
    throw new CustomError(400, "Host cannot reject their own invitation");
  }

  // 3️⃣ Find invitation
  const invitation = event.invitations.find(
    (i) => i.user.toString() == userId.toString()
  );

  if (!invitation) {
    throw new CustomError(400, "Invitation not found");
  }

  // 4️⃣ Prevent duplicate response
  if (invitation.status !== "pending") {
    throw new CustomError(400, "Invitation already responded");
  }

  // 5️⃣ Update invitation status
  invitation.status = "declined";
  invitation.respondedAt = new Date();

  await event.save();

  // 6️⃣ Remove invitation from user model
  await UserModel.findByIdAndUpdate(userId, {
    $pull: { invitations: event._id },
  });

  apiResponse.sendSucess(res, 200, "Invitation rejected successfully");
});
