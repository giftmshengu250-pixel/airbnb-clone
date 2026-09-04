const express = require("express");
const router = express.Router();
const {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
} = require("../controllers/accommodationController");
const { protect } = require("../middleware/auth");

router.get("/", getAccommodations);
router.get("/:id", getAccommodationById);
router.post("/", protect, createAccommodation);
router.put("/:id", protect, updateAccommodation);
router.delete("/:id", protect, deleteAccommodation);

module.exports = router;
