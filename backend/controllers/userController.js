const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ─── In-memory user store ────────────────────────────────────────────────────
// Used when MongoDB is unavailable. Pre-seeded with the three demo accounts.
// Passwords are bcrypt-hashed at startup so login works exactly like the DB path.

let memUsers = [];

const hashSync = (pw) => bcrypt.hashSync(pw, 10);

const DEMO_ACCOUNTS = [
  { username: "guest",  email: "guest@example.com",  password: "password123",  role: "user"  },
  { username: "host",   email: "host@example.com",   password: "hostpass123",   role: "host"  },
  { username: "admin",  email: "admin@example.com",  password: "adminpass123",  role: "admin" },
];

// Bootstrap in-memory store with demo accounts
DEMO_ACCOUNTS.forEach((u, i) => {
  memUsers.push({
    _id:      `mem-${i + 1}`,
    username: u.username,
    email:    u.email,
    password: hashSync(u.password),
    role:     u.role,
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (u) => ({
  _id:      u._id      || u.id,
  username: u.username,
  email:    u.email,
  role:     u.role,
});

// Try to load the Mongoose User model — may not be available if MongoDB is down
let User = null;
let mongoReady = false;
try {
  User = require("../models/User");
} catch (_) {}

// Subscribe to Mongoose connection events so we know when Mongo comes up
try {
  const mongoose = require("mongoose");
  mongoose.connection.on("connected", () => { mongoReady = true;  });
  mongoose.connection.on("error",     () => { mongoReady = false; });
  mongoose.connection.on("disconnected", () => { mongoReady = false; });
  // If already connected at require-time
  if (mongoose.connection.readyState === 1) mongoReady = true;
} catch (_) {}

// ─── Register ────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email and password are required" });

    // ── MongoDB path ──
    if (mongoReady && User) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "A user with that email already exists" });
      const user = await User.create({ username, email, password, role });
      return res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
    }

    // ── In-memory path ──
    if (memUsers.find((u) => u.email === email))
      return res.status(400).json({ message: "A user with that email already exists" });

    const newUser = {
      _id:      `mem-${Date.now()}`,
      username,
      email,
      password: hashSync(password),
      role:     role || "user",
    };
    memUsers.push(newUser);
    return res.status(201).json({ ...safeUser(newUser), token: generateToken(newUser._id) });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // ── MongoDB path ──
    if (mongoReady && User) {
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        return res.json({ ...safeUser(user), token: generateToken(user._id) });
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ── In-memory path ──
    const user = memUsers.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });

    return res.json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ─── Get current user ────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json(req.user);
};

const seedDemoUsers = async () => {
  if (!mongoReady || !User) return;

  for (const u of DEMO_ACCOUNTS) {
    const exists = await User.findOne({ email: u.email });

    if (!exists) {
      await User.create(u);
      console.log(`Demo user created: ${u.email}`);
    }
  }
};

// ─── Seed visible demo accounts (dev only) ───────────────────────────────────
const seedVisibleUsers = async (req, res) => {
  if (process.env.NODE_ENV === "production")
    return res.status(403).json({ message: "Not allowed in production" });

  // If MongoDB is up, seed there
  if (mongoReady && User) {
    const results = [];
    for (const u of DEMO_ACCOUNTS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        results.push({ email: u.email, created: true, role: u.role });
      } else {
        results.push({ email: u.email, created: false, role: user.role });
      }
    }
    return res.json({ message: "Seed complete (MongoDB)", accounts: results });
  }

  // Otherwise just report in-memory state
  const accounts = memUsers.map((u) => ({
    email:   u.email,
    role:    u.role,
    source:  "in-memory",
  }));
  res.json({ message: "Using in-memory users (MongoDB offline)", accounts });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  seedVisibleUsers,
  seedDemoUsers,
};
