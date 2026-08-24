const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  allowRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// AUTHENTICATION REQUIRED FOR ALL DEPARTMENT ROUTES
// ============================================================

router.use(protect);

// ============================================================
// VIEW DEPARTMENTS
// Admin and Employee can VIEW departments
// ============================================================

router.get(
  "/",
  getDepartments
);

router.get(
  "/:id",
  getDepartment
);

// ============================================================
// ADMIN ONLY OPERATIONS
// ============================================================

router.post(
  "/",
  allowRoles("admin"),
  createDepartment
);

router.put(
  "/:id",
  allowRoles("admin"),
  updateDepartment
);

router.delete(
  "/:id",
  allowRoles("admin"),
  deleteDepartment
);

module.exports = router;