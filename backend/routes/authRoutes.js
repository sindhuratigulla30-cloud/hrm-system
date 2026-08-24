const express = require("express");

const {
  adminLogin,
  employeeLogin,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
====================================================
ADMIN LOGIN
POST /api/auth/login
====================================================
*/

router.post(
  "/login",
  adminLogin
);

/*
====================================================
EMPLOYEE LOGIN
POST /api/auth/employee-login
====================================================
*/

router.post(
  "/employee-login",
  employeeLogin
);

/*
====================================================
GET CURRENT LOGGED-IN USER
GET /api/auth/me
====================================================
*/

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;