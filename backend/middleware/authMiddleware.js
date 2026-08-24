const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// ============================================================
// PROTECT
// ============================================================

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    // ========================================================
    // VERIFY TOKEN
    // ========================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ========================================================
    // FIND USER FROM JWT ID
    // ========================================================

    const user = await Employee.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // ========================================================
    // CHECK EMPLOYEE STATUS
    // ========================================================

    if (
      user.role === "employee" &&
      user.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your employee account is inactive. Please contact admin.",
      });
    }

    // ========================================================
    // STORE USER
    // ========================================================

    req.user = user;

    // Also keep decoded JWT
    req.userToken = decoded;

    next();
  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed. Please login again.",
    });
  }
};

// ============================================================
// ALLOW ROLES
// ============================================================

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

// ============================================================
// ADMIN ONLY
// ============================================================

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

// ============================================================
// EMPLOYEE ONLY
// ============================================================

const requireEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "employee") {
    return res.status(403).json({
      success: false,
      message: "Employee access required.",
    });
  }

  next();
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  protect,
  allowRoles,
  requireAdmin,
  requireEmployee,
};