const express = require("express");

const {
  getAttendance,
  createAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const { protect } = require("../middleware/authMiddleware");

const {
  requireAdmin,
  requireEmployee,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// ADMIN / HR — GET ALL ATTENDANCE
// GET /api/attendance
// ============================================================

router.get(
  "/",
  protect,
  requireAdmin,
  getAttendance
);

// ============================================================
// ADMIN / HR — CREATE ATTENDANCE
// POST /api/attendance
// ============================================================

router.post(
  "/",
  protect,
  requireAdmin,
  createAttendance
);

// ============================================================
// ADMIN / HR — DELETE ATTENDANCE
// DELETE /api/attendance/:id
// ============================================================

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteAttendance
);

module.exports = router;