const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

// @route   POST /api/upload
// @desc    Upload a single image, returns a URL the frontend can use
router.post("/", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }
  // Build a URL that points to the static /uploads folder (see server.js)
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

module.exports = router;
