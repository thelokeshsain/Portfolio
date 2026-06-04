const mongoose = require("mongoose");

// Monitor database connection events
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected");
});

module.exports = async () => {
  try {
    mongoose.set("strictQuery", false);

    const options = {
      maxPoolSize: 10,
      minPoolSize: process.env.NODE_ENV === "production" ? 2 : 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      autoIndex: process.env.NODE_ENV !== "production", // Disable automatic index building in production
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
  } catch (e) {
    console.error("❌ MongoDB connection failed on boot:", e.message);
    process.exit(1);
  }
};
