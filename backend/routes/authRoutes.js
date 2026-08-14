const express = require("express");

const {
  registerEmployee,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Employee registration
router.post("/register", registerEmployee);

// Login
router.post("/login", login);

module.exports = router;