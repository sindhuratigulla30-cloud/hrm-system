const express = require("express");

const {
  createEmployee,
  getEmployees,
  getEmployee,
  getMyEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");

const {
  requireAdmin,
  requireEmployee,
} = require("../middleware/roleMiddleware");

const router = express.Router();


// ============================================================
// ADMIN — CREATE EMPLOYEE
// POST /api/employees
// ============================================================

router.post(
  "/",
  protect,
  requireAdmin,
  createEmployee
);


// ============================================================
// ADMIN — GET ALL EMPLOYEES
// GET /api/employees
// ============================================================

router.get(
  "/",
  protect,
  requireAdmin,
  getEmployees
);


// ============================================================
// EMPLOYEE — GET OWN PROFILE
// GET /api/employees/me
// ============================================================

router.get(
  "/me",
  protect,
  requireEmployee,
  getMyEmployee
);


// ============================================================
// ADMIN — GET SINGLE EMPLOYEE
// GET /api/employees/:id
// ============================================================

router.get(
  "/:id",
  protect,
  requireAdmin,
  getEmployee
);


// ============================================================
// ADMIN — UPDATE EMPLOYEE
// PUT /api/employees/:id
// ============================================================

router.put(
  "/:id",
  protect,
  requireAdmin,
  updateEmployee
);


// ============================================================
// ADMIN — DELETE EMPLOYEE
// DELETE /api/employees/:id
// ============================================================

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteEmployee
);


module.exports = router;