const express = require("express");
const router = express.Router();

const bookingsRoutes = require("./bookings");

// GET /api/owners/:ownerId/bookings
router.get("/:ownerId/bookings", (req, res) => {
  const { ownerId } = req.params;

  // temporary owner → business mapping
  const ownerToBusiness = {
    stetson: "seadog",
    mike: "islandtime",
  };

  const businessId = ownerToBusiness[ownerId];

  if (!businessId) {
    return res.status(404).json({ error: "Owner not found" });
  }

  const allBookings = bookingsRoutes._getAll();
  const bookings = allBookings.filter((b) => b.businessId === businessId);

  res.json({ bookings });
});
module.exports = router;
