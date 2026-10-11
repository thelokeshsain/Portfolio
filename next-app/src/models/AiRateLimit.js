import mongoose from "mongoose";

const aiRateLimitSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index automatically cleans up expired entries
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default mongoose.models.AiRateLimit ||
  mongoose.model("AiRateLimit", aiRateLimitSchema);
