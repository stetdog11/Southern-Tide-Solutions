const express = require("express");
const router = express.Router();

const { readBookings } = require("../models/bookingsStore");

/**
 * TEMP owner -> businesses map (we’ll move this to a real store later)
 * ownerId in URL: /api/owners/:ownerId/bookings
 */
const OWNER_BUSINESSES = {
  stetson: ["seadog", "islandtime"],
  // add more owners later:
  // buddy: ["seadog"],
};

/**
 * GET /api/owners/:ownerId/bookings
 * Example: /api/owners/stetson/bookings
 */
router.get("/:ownerId/bookings", (req, res) => {
  const { ownerId } = req.params;

  const businessIds = OWNER_BUSINESSES[ownerId];

  if (!businessIds) {
    return res.status(404).json({ error: "Owner not found" });
  }

  const allBookings = readBookings();

  const bookings = allBookings.filter((b) =>
    businessIds.includes(b.businessId),
  );

  return res.json({ ownerId, businessIds, bookings });
});

module.exports = router;
