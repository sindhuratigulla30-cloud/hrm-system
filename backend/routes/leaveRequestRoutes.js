const express = require("express");

const {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
} = require("../controllers/leaveRequestController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  allowRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// AUTHENTICATION REQUIRED FOR EVERY LEAVE REQUEST
// ============================================================

router.use(protect);

// ============================================================
// GET LEAVE REQUESTS
// ============================================================

router.get(
  "/",
  getLeaveRequests
);

// ============================================================
// CREATE LEAVE REQUEST
// Employee can create
// ============================================================

router.post(
  "/",
  createLeaveRequest
);

// ============================================================
// ADMIN ONLY: APPROVE / REJECT
// ============================================================

router.put(
  "/:id",
  allowRoles("admin"),
  updateLeaveRequestStatus
);

// ============================================================
// ADMIN ONLY: DELETE
// ============================================================

router.delete(
  "/:id",
  allowRoles("admin"),
  deleteLeaveRequest
);

module.exports = router;