const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "bookings.json");

// Simple in-process mutex (prevents 2 POSTs updating at the same time)
let locked = false;
const waiters = [];

function acquireLock() {
  return new Promise((resolve) => {
    if (!locked) {
      locked = true;
      return resolve();
    }
    waiters.push(resolve);
  });
}

function releaseLock() {
  const next = waiters.shift();
  if (next) return next();
  locked = false;
}

async function withLock(fn) {
  await acquireLock();
  try {
    return await fn();
  } finally {
    releaseLock();
  }
}

async function readBookings() {
  const raw = await fs.promises.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeBookings(bookings) {
  await fs.promises.writeFile(
    DATA_PATH,
    JSON.stringify(bookings, null, 2),
    "utf8",
  );
}

module.exports = { readBookings, writeBookings, withLock };
