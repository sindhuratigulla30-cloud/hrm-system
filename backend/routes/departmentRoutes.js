const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Authentication required for all department routes
router.use(authMiddleware);

// View departments
router.get("/", getDepartments);
router.get("/:id", getDepartment);

// Admin-only operations
router.post("/", allowRoles("admin"), createDepartment);
router.put("/:id", allowRoles("admin"), updateDepartment);
router.delete("/:id", allowRoles("admin"), deleteDepartment);

module.exports = router;