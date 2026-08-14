const express = require("express");

const {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
} = require("../controllers/leaveRequestController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Authentication required for every leave request
router.use(protect);

// Get all leave requests
router.get("/", getLeaveRequests);

// Create leave request
router.post("/", createLeaveRequest);

// Admin only: approve/reject
router.put("/:id", allowRoles("admin"), updateLeaveRequestStatus);

// Admin only: delete
router.delete("/:id", allowRoles("admin"), deleteLeaveRequest);

module.exports = router;