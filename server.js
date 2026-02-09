const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Booking platform is live ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log("Server listening on", PORT));
