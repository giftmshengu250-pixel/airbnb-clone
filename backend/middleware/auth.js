const jwt = require("jsonwebtoken");

// Try Mongoose User — may be unavailable when MongoDB is down
let User = null;
try { User = require("../models/User"); } catch (_) {}

let mongoReady = false;
try {
  const mongoose = require("mongoose");
  mongoose.connection.on("connected",    () => { mongoReady = true;  });
  mongoose.connection.on("error",        () => { mongoReady = false; });
  mongoose.connection.on("disconnected", () => { mongoReady = false; });
  if (mongoose.connection.readyState === 1) mongoReady = true;
} catch (_) {}

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized, no token provided" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── MongoDB path ──
    if (mongoReady && User) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User no longer exists" });
      req.user = user;
      return next();
    }

    // ── In-memory path: reconstruct user from JWT payload ──
    // The token was signed with { id, ... } — attach a lightweight user object
    req.user = { _id: decoded.id, id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };
