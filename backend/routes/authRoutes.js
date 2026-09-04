const express = require("express");

const {
  registerEmployee,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// EMPLOYEE REGISTRATION
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  registerEmployee
);

// ============================================================
// COMMON LOGIN
// POST /api/auth/login
//
// HR/Admin + Employee
// Backend automatically identifies role.
// ============================================================

router.post(
  "/login",
  login
);

// ============================================================
// CURRENT LOGGED-IN USER
// GET /api/auth/me
// ============================================================

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;