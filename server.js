const express = require("express");
const bookingsRoutes = require("./src/routes/bookings");
const ownersRoutes = require("./src/routes/owners");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use("/api/bookings", bookingsRoutes);
app.use("/api/owners", ownersRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Booking platform is live ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log("Server listening on", PORT));
