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

// POST /api/bookings
// body: { businessId, tripId, qty }
router.post("/", (req, res) => {
  const { businessId, tripId, qty } = req.body;

  const qtyNum = Number(qty);

  if (
    !businessId ||
    tripId == null ||
    !Number.isFinite(qtyNum) ||
    qtyNum <= 0
  ) {
    return res
      .status(400)
      .json({ error: "businessId, tripId, qty are required" });
  }

  // Use the same source list as GET
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

  const booking = allBookings.find(
    (b) => b.businessId === businessId && b.id === Number(tripId),
  );

  if (!booking) {
    return res.status(404).json({ error: "Trip not found" });
  }

  const remaining = booking.capacity - booking.booked;
  if (qtyNum > remaining) {
    return res.status(400).json({
      error: "Not enough spots remaining",
      remaining,
    });
  }

  booking.booked += qtyNum;

  return res.json({
    ok: true,
    updated: booking,
  });
});

module.exports = router;
