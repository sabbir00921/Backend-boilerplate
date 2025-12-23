const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: [{}],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// slugify pre middleware
EventSchema.pre("save", async function () {
  this.slug = slugify(this.name, { lower: true });
});

module.exports = mongoose.model("Event", EventSchema);
