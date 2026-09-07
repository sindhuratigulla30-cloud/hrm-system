const express = require("express");

const {
  getAttendance,
  getMyAttendance,
  getMyTodayAttendance,
  checkIn,
  checkOut,
  createAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  requireAdmin,
  requireEmployee,
} = require("../middleware/roleMiddleware");

const router = express.Router();

/* ============================================================
   EMPLOYEE ATTENDANCE
============================================================ */

/*
  GET MY ATTENDANCE

  GET /api/attendance/my
*/
router.get(
  "/my",
  protect,
  requireEmployee,
  getMyAttendance
);

/*
  GET TODAY'S ATTENDANCE

  GET /api/attendance/my/today
*/
router.get(
  "/my/today",
  protect,
  requireEmployee,
  getMyTodayAttendance
);

/*
  EMPLOYEE CHECK IN

  POST /api/attendance/check-in
*/
router.post(
  "/check-in",
  protect,
  requireEmployee,
  checkIn
);

/*
  EMPLOYEE CHECK OUT

  PUT /api/attendance/check-out
*/
router.put(
  "/check-out",
  protect,
  requireEmployee,
  checkOut
);

/* ============================================================
   ADMIN / HR ATTENDANCE
============================================================ */

/*
  GET ALL ATTENDANCE

  GET /api/attendance
*/
router.get(
  "/",
  protect,
  requireAdmin,
  getAttendance
);

/*
  ADMIN CREATE ATTENDANCE

  POST /api/attendance
*/
router.post(
  "/",
  protect,
  requireAdmin,
  createAttendance
);

/*
  ADMIN DELETE ATTENDANCE

  DELETE /api/attendance/:id
*/
router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteAttendance
);

module.exports = router;