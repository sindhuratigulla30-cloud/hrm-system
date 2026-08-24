const express = require("express");

const {
  createEmployee,
  getEmployees,
  getEmployee,
  getMyEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN ONLY EMPLOYEE MANAGEMENT
// ==========================================

// Create employee
router.post(
  "/",
  protect,
  allowRoles("admin"),
  createEmployee
);

// Get all employees
router.get(
  "/",
  protect,
  allowRoles("admin"),
  getEmployees
);

// Get currently logged-in employee
router.get(
  "/me",
  protect,
  allowRoles("employee"),
  getMyEmployee
);


// Get a specific employee
router.get(
  "/:id",
  protect,
  allowRoles("admin"),
  getEmployee
);

// Update employee
router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  updateEmployee
);

// Delete employee
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteEmployee
);

module.exports = router;