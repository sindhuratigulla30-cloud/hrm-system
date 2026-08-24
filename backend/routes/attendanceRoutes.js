const express = require("express");

const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// GET MIDDLEWARE
// ============================================================

const {
  protect,
  requireAdmin,
  requireEmployee,
} = authMiddleware;

// ============================================================
// GET ATTENDANCE CONTROLLERS
// ============================================================

const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
} = attendanceController;

// ============================================================
// EMPLOYEE CLOCK IN
// POST /api/attendance/check-in
// ============================================================

router.post(
  "/check-in",
  protect,
  requireEmployee,
  checkIn
);

// ============================================================
// EMPLOYEE CLOCK OUT
// POST /api/attendance/check-out
// ============================================================

router.post(
  "/check-out",
  protect,
  requireEmployee,
  checkOut
);

// ============================================================
// EMPLOYEE TODAY ATTENDANCE
// GET /api/attendance/today
// ============================================================

router.get(
  "/today",
  protect,
  requireEmployee,
  getTodayAttendance
);

// ============================================================
// EMPLOYEE ATTENDANCE HISTORY
// GET /api/attendance/my
// ============================================================

router.get(
  "/my",
  protect,
  requireEmployee,
  getMyAttendance
);

// ============================================================
// ADMIN - ALL ATTENDANCE
// GET /api/attendance
// ============================================================

router.get(
  "/",
  protect,
  requireAdmin,
  getAllAttendance
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;