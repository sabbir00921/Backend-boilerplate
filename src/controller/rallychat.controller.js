const { CustomError } = require("../helpers/customError");
const RallyChat = require("../model/rallychat.model");
const QuickRally = require("../model/quickrally.model");
const { getIo } = require("../socket/server");
const { apiResponse } = require("../utils/apiResponse");

/**
 * Send message (REST + Socket)
 */
exports.sendMessage = async (req, res) => {
  const { rallyId } = req.params;
  const { message } = req.body;
  const senderId = req.user._id;

  // 1️⃣ Validate message
  if (!message || !message.trim()) {
    throw new CustomError(400, "Message is required");
  }

  // 2️⃣ Validate rally
  const rally = await QuickRally.findById(rallyId);
  if (!rally) {
    throw new CustomError(404, "Quick Rally not found");
  }

  // 3️⃣ Permission check (participants)
  const isMember = rally.participants.some(
    (p) => p.user.toString() === senderId.toString()
  );

  if (!isMember) {
    throw new CustomError(403, "You are not a member of this rally");
  }

  // 4️⃣ Save message
  const chat = await RallyChat.create({
    rally: rallyId,
    sender: senderId,
    message: message.trim(),
  });

  // 5️⃣ Emit real-time message to rally room
  const io = getIo();
  io.to(rallyId.toString()).emit("newMessage", {
    _id: chat._id,
    rallyId,
    sender: senderId,
    message: chat.message,
    createdAt: chat.createdAt,
  });

  // 6️⃣ REST response
  return apiResponse.sendSucess(res, 201, "Message sent successfully", chat);
};

/**
 * Get rally chat history
 */
exports.getRallyMessages = async (req, res) => {
  const { rallyId } = req.params;
  const userId = req.user._id;

  const rally = await QuickRally.findById(rallyId);
  if (!rally) {
    throw new CustomError(404, "Quick Rally not found");
  }

  if (!rally.members.includes(userId)) {
    throw new CustomError(403, "You are not a member of this rally");
  }

  const messages = await RallyChat.find({ rally: rallyId })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  return apiResponse.sendSucess(res, 200, "Rally messages fetched", messages);
};
