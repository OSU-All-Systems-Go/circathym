/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// ESM


// timer.js
// Mock Timer Microservice for CS361 - A7
// const morgan = require("morgan");
// app.use(morgan("dev"));
const express = require("express");
const app = express();
app.use(express.json());

const PORT = 3001;

// Mock Timer State
let timer = {
  durationSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,
  lastSetAt: null
};

// Helper: setTimer
function setTimer(seconds) {
  timer.durationSeconds = seconds;
  timer.remainingSeconds = seconds;
  timer.isRunning = true;
  timer.lastSetAt = new Date().toISOString();
  return timer;
}
// Helper: getTimer
function getTimer() {
  return timer;
}
// Helper: resetTimer
function resetTimer() {
  timer.remainingSeconds = timer.durationSeconds;
  timer.isRunning = false;
  return timer;
}

// POST /setTimer
app.post("/setTimer", (req, res) => {
  const { seconds } = req.body;
  if (typeof seconds !== "number" || seconds <= 0) {
    return res.status(400).json({
      error: "Please provide a positive number for seconds."
    });
  }
  timer = {
    durationSeconds: seconds,
    remainingSeconds: seconds,
    isRunning: true,
    lastUpdated: new Date().toISOString()
  };
  res.status(200).json({
    message: "Timer set successfully.",
    timer: timer
  });
});
// GET /getTimer
app.get("/getTimer", (req, res) => {
  res.status(200).json({
    message: "Timer retrieved successfully.",
    timer: timer
  });
});
// POST /resetTimer
app.post("/resetTimer", (req, res) => {
  timer = {
    durationSeconds: timer.durationSeconds,
    remainingSeconds: timer.durationSeconds,
    isRunning: false,
    lastUpdated: new Date().toISOString()
  };
  res.status(200).json({
    message: "Timer reset successfully.",
    timer: timer
  });
});


// Home Route
app.get("/", (req, res) => {
  res.send("CRT Timer Microservice is running");
});
app.listen(PORT, () => {
  console.log(`CRT Timer Microservice running on http://localhost:${PORT}`);
});