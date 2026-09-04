const express = require("express");
const router = express.Router();
const { getCities, getListings, getListingById } = require("../controllers/taplineController");

router.get("/cities", getCities);
router.get("/listings", getListings);
router.get("/listings/:id", getListingById);

module.exports = router;
