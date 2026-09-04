const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error but keep the server running so in-memory auth still works
    console.warn(`MongoDB unavailable (${error.message}) — running in offline mode`);
  }
};

module.exports = connectDB;
