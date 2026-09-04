const Reservation = require("../models/Reservation");
const Accommodation = require("../models/Accommodation");

// In-memory reservation store used when MongoDB is offline
const memReservations = [];

let mongoReady = false;
try {
  const mongoose = require("mongoose");
  mongoose.connection.on("connected",    () => { mongoReady = true;  });
  mongoose.connection.on("error",        () => { mongoReady = false; });
  mongoose.connection.on("disconnected", () => { mongoReady = false; });
  if (mongoose.connection.readyState === 1) mongoReady = true;
} catch (_) {}

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { accommodationId, checkIn, checkOut, guests, totalCost } = req.body;

    if (mongoReady) {
      const accommodation = await Accommodation.findById(accommodationId);
      if (!accommodation)
        return res.status(404).json({ message: "Accommodation not found" });

      const reservation = await Reservation.create({
        accommodation: accommodationId,
        user:     req.user._id,
        host:     accommodation.host,
        checkIn, checkOut, guests, totalCost,
      });
      return res.status(201).json(reservation);
    }

    // ── In-memory fallback ──────────────────────────────────────────────────
    const reservation = {
      _id:             `mem-res-${Date.now()}`,
      accommodation:   { _id: accommodationId, title: "Listing", location: "" },
      user:            req.user._id || req.user.id,
      host:            null,
      checkIn, checkOut, guests,
      totalCost:       totalCost || 0,
      createdAt:       new Date().toISOString(),
    };
    memReservations.push(reservation);
    return res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: "Could not create reservation", error: error.message });
  }
};

// GET /api/reservations/host
const getReservationsByHost = async (req, res) => {
  try {
    if (mongoReady) {
      const reservations = await Reservation.find({ host: req.user._id })
        .populate("accommodation", "title location images price")
        .populate("user", "username email")
        .sort({ createdAt: -1 });
      return res.json(reservations);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch host reservations", error: error.message });
  }
};

// GET /api/reservations/user
const getReservationsByUser = async (req, res) => {
  try {
    if (mongoReady) {
      const reservations = await Reservation.find({ user: req.user._id })
        .populate("accommodation", "title location images price")
        .sort({ createdAt: -1 });
      return res.json(reservations);
    }
    // Return in-memory reservations for this user
    const uid = String(req.user._id || req.user.id);
    return res.json(memReservations.filter((r) => String(r.user) === uid));
  } catch (error) {
    res.status(500).json({ message: "Could not fetch user reservations", error: error.message });
  }
};

// GET /api/reservations/all   (admin only)
const getAllReservations = async (req, res) => {
  try {
    if (mongoReady) {
      const reservations = await Reservation.find()
        .populate("accommodation", "title location images price")
        .populate("user", "username email")
        .sort({ createdAt: -1 });
      return res.json(reservations);
    }
    res.json(memReservations);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch reservations", error: error.message });
  }
};

// DELETE /api/reservations/:id
const deleteReservation = async (req, res) => {
  try {
    if (mongoReady) {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ message: "Reservation not found" });
      const isOwner = reservation.user.toString() === req.user._id.toString();
      const isHost  = reservation.host?.toString() === req.user._id.toString();
      if (!isOwner && !isHost) return res.status(403).json({ message: "Not authorized" });
      await reservation.deleteOne();
      return res.json({ message: "Reservation deleted" });
    }
    // In-memory delete
    const idx = memReservations.findIndex((r) => r._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Reservation not found" });
    memReservations.splice(idx, 1);
    res.json({ message: "Reservation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete reservation", error: error.message });
  }
};

module.exports = { createReservation, getReservationsByHost, getReservationsByUser, getAllReservations, deleteReservation };
