const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, seedVisibleUsers } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
// Dev-only: create visible placeholder accounts for the project marker
router.get("/seed-visible", seedVisibleUsers);

module.exports = router;
