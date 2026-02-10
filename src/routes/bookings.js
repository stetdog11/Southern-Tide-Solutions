const express = require("express");
const router = express.Router();

/* 👇 MOVE DATA HERE (top-level) */
const allBookings = [
  {
    id: 1,
    businessId: "seadog",
    trip: "8:30 AM Snorkel Tour",
    date: "2026-02-08",
    booked: 10,
    capacity: 49,
  },
  {
    id: 2,
    businessId: "seadog",
    trip: "12:30 PM Snorkel Tour",
    date: "2026-02-08",
    booked: 0,
    capacity: 49,
  },
  {
    id: 3,
    businessId: "islandtime",
    trip: "1:00 PM Sunset Cruise",
    date: "2026-02-08",
    booked: 6,
    capacity: 18,
  },
];
// GET /api/bookings?businessId=seadog
router.get("/", (req, res) => {
  const { businessId } = req.query;

  const bookings = businessId
    ? allBookings.filter((b) => b.businessId === businessId)
    : allBookings;

  res.json({ bookings });
});
router._getAll = () => allBookings;

module.exports = router;
