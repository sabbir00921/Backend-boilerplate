const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const { CustomError } = require("../helpers/customError");
const QuickRally = require("../model/quickrally.model");
const crypto = require("crypto");
const {
  validateQuickRallyCreate,
} = require("../validation/quickrally.validation");

exports.createQuickRally = asyncHandaler(async (req, res) => {
  const userId = req.user._id;

  const { title, description, latitude, longitude, locationName } =
    await validateQuickRallyCreate(req);

  console.log(latitude, longitude);

  if (!latitude || !longitude) {
    throw new CustomError(400, "Current location is required");
  }

  // Generate short invite code
  const inviteCode = crypto.randomBytes(4).toString("hex");

  const rally = await QuickRally.create({
    host: userId,
    title,
    description,
    location: {
      name: locationName || "Current Location",
      latitude,
      longitude,
    },
    inviteCode,
    participants: [{ user: userId }],
  });

  apiResponse.sendSucess(res, 201, "Quick Rally created", {
    rally,
    inviteLink: `http://localhost:5000/api/v1/quick-rally/join-quickrally/${inviteCode}`,
  });
});

// join quick rally
exports.joinQuickRally = asyncHandaler(async (req, res) => {
  const { inviteCode } = req.params;
  const userId = req.user._id;

  if (!inviteCode) {
    throw new CustomError(400, "Invite code is required");
  }

  const rally = await QuickRally.findOne({
    inviteCode,
    isActive: true,
  });

  if (!rally) {
    throw new CustomError(400, "Invalid or expired invite code");
  }

  const alreadyJoined = rally.participants.some(
    (p) => p.user.toString() === userId.toString()
  );

  if (alreadyJoined) {
    return apiResponse.sendSucess(res, 200, "Already joined quick rally", {
      rallyId: rally._id,
    });
  }

  rally.participants.push({ user: userId });
  await rally.save();

  apiResponse.sendSucess(res, 200, "Joined quick rally", {
    rallyId: rally._id,
    chatEnabled: rally.chatEnabled,
  });
});

// leave quick rally
exports.leaveQuickRally = asyncHandaler(async (req, res) => {
  const { rallyId } = req.params;
  const userId = req.user._id;

  const rally = await QuickRally.findById(rallyId);

  if (!rally) {
    throw new CustomError(400, "Rally not found");
  }

  const alreadyJoined = rally.participants.some(
    (p) => p.user.toString() === userId.toString()
  );

  if (!alreadyJoined) {
    throw new CustomError(400, "You are not a participant of this rally");
  }

  rally.participants = rally.participants.filter(
    (p) => p.user.toString() !== userId.toString()
  );

  await rally.save();
  apiResponse.sendSucess(res, 200, "Left quick rally");
});

// get all quick rallies
exports.getAllQuickRallies = asyncHandaler(async (req, res) => {
  const { isActive, sortBy } = req.query;
  const filter = {};

  if (isActive) {
    filter.isActive = isActive;
  }

  const rallies = await QuickRally.find(filter)
    .sort({ createdAt: sortBy === "desc" ? -1 : 1 })
    .populate("host", "name email")
    .populate("participants.user", "name email");
  if (!rallies || rallies.length === 0) {
    throw new CustomError(404, "Quick rallies not found");
  }
  apiResponse.sendSucess(res, 200, "Quick rallies fetched", rallies);
});

// get single quick rally
exports.getSingleQuickRally = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const rally = await QuickRally.findById(id)
    .populate("host", "name email")
    .populate("participants.user", "name email");
  if (!rally) {
    throw new CustomError(404, "Quick rally not found");
  }
  apiResponse.sendSucess(res, 200, "Quick rally fetched", rally);
});

// update quick rally
exports.updateQuickRally = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { title, description, isActive, chatEnabled } = req.body;

  if (
    title === undefined &&
    description === undefined &&
    isActive === undefined &&
    chatEnabled === undefined
  ) {
    throw new CustomError(
      400,
      "At least one of title, description or isActive is required"
    );
  }

  const rally = await QuickRally.findById(id);
  if (!rally) {
    throw new CustomError(404, "Quick rally not found");
  }

  console.log(rally.chatEnabled, chatEnabled);
  if (rally.host.toString() !== userId.toString()) {
    throw new CustomError(
      403,
      "You are not authorized to update this rally or you are not the host"
    );
  }

  rally.title = title || rally.title;
  rally.description = description || rally.description;
  rally.isActive = isActive || rally.isActive;
  rally.chatEnabled = chatEnabled === true ? true : false;

  const updatedRally = await rally.save();

  apiResponse.sendSucess(res, 200, "Quick rally updated", updatedRally);
});

// delete quick rally
exports.deleteQuickRally = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const rally = await QuickRally.findById(id);
  if (!rally) {
    throw new CustomError(404, "Quick rally not found");
  }
  if (rally.host.toString() !== userId.toString()) {
    throw new CustomError(
      403,
      "You are not authorized to delete this rally or you are not the host"
    );
  }
  await rally.deleteOne(); // ✅ modern replacement for remove()
  apiResponse.sendSucess(res, 200, "Quick rally deleted");
});
