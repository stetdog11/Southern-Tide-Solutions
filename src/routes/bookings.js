const express = require("express");
const router = express.Router();

const {
  readReservations,
  writeReservations,
} = require("../models/reservationsStore");

const {
  readBookings,
  writeBookings,
  withLock,
} = require("../models/bookingsStore");

// ONE calcTotals only (keep this one)
function calcTotals({ qty, paymentMethod }) {
  const pricePerPersonCash = 80;
  const cardFeePerPerson = 4; // card = 84

  const qtyNum = Number(qty);

  const subtotal = pricePerPersonCash * qtyNum;
  const processingFee =
    paymentMethod === "card" ? cardFeePerPerson * qtyNum : 0;

  const tax = 0;
  const total = subtotal + processingFee + tax;

  return {
    qty: qtyNum,
    pricePerPersonCash,
    pricePerPersonCard: pricePerPersonCash + cardFeePerPerson,
    subtotal,
    processingFee,
    tax,
    total,
  };
}

// GET /api/bookings?businessId=seadog
router.get("/", async (req, res) => {
  try {
    const { businessId } = req.query;
    const allBookings = await readBookings();

    const bookings = businessId
      ? allBookings.filter((b) => b.businessId === businessId)
      : allBookings;

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/bookings/reservations?businessId=seadog
router.get("/reservations", (req, res) => {
  const { businessId } = req.query;
  const all = readReservations();

  const reservations = businessId
    ? all.filter((r) => r.businessId === businessId)
    : all;

  res.json({ reservations });
});

// POST /api/bookings
// body: { businessId, tripId, qty, type, paymentMethod }
router.post("/", async (req, res) => {
  try {
    return await withLock(async () => {
      const {
        businessId,
        tripId,
        qty,
        type = "public",
        paymentMethod = "cash",
      } = req.body;

      if (!businessId || tripId == null || qty == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const tripIdNum = Number(tripId);
      const qtyNum = Number(qty);

      if (
        !Number.isFinite(tripIdNum) ||
        !Number.isFinite(qtyNum) ||
        qtyNum <= 0
      ) {
        return res.status(400).json({ error: "Invalid numbers" });
      }

      const allBookings = await readBookings();

      const booking = allBookings.find(
        (b) => b.businessId === businessId && b.id === tripIdNum,
      );

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const remainingBefore = booking.capacity - booking.booked;

      if (type === "private" && qtyNum !== remainingBefore) {
        return res.status(400).json({
          error: "Private booking must take all remaining seats",
          remaining: remainingBefore,
        });
      }

      if (type === "public" && qtyNum > remainingBefore) {
        return res.status(400).json({
          error: "Not enough seats remaining",
          remaining: remainingBefore,
        });
      }

      // Apply booking + persist bookings
      booking.booked += qtyNum;
      await writeBookings(allBookings);

      // Build reservation record + persist reservations
      const totals = calcTotals({ qty: qtyNum, paymentMethod });

      const reservations = readReservations();
      const reservation = {
        id: "r_" + Date.now(),
        businessId,
        tripId: tripIdNum,
        trip: booking.trip,
        date: booking.date,
        qty: qtyNum,
        type,
        paymentMethod,
        totals,
        createdAt: new Date().toISOString(),
      };

      reservations.push(reservation);
      writeReservations(reservations);

      return res.json({
        ok: true,
        booking,
        reservation,
        remaining: booking.capacity - booking.booked,
      });
    });
  } catch (err) {
    console.error("LOCKED BOOKING FAILED:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
