const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// ============================================================
// PROTECT MIDDLEWARE
// Verifies JWT and loads the latest user from MongoDB
// ============================================================

const protect = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // CHECK AUTHORIZATION HEADER
    // --------------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // CHECK BEARER FORMAT
    // --------------------------------------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    // --------------------------------------------------------
    // GET TOKEN
    // --------------------------------------------------------

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    // --------------------------------------------------------
    // CHECK JWT SECRET
    // --------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // --------------------------------------------------------
    // VERIFY JWT
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // LOAD LATEST USER FROM DATABASE
    // IMPORTANT:
    // Never trust role/status from the frontend.
    // Always get the latest values from MongoDB.
    // --------------------------------------------------------

    const user = await Employee.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // --------------------------------------------------------
    // CHECK ACCOUNT STATUS
    // --------------------------------------------------------

    const userStatus = String(
      user.status || ""
    )
      .trim()
      .toLowerCase();

    if (userStatus !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact HR/Admin.",
      });
    }

    // --------------------------------------------------------
    // STORE AUTHENTICATED USER
    // --------------------------------------------------------

    req.user = user;

    // Keep decoded JWT available separately
    req.userToken = decoded;

    // --------------------------------------------------------
    // CONTINUE
    // --------------------------------------------------------

    next();

  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    // --------------------------------------------------------
    // EXPIRED TOKEN
    // --------------------------------------------------------

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please login again.",
      });
    }

    // --------------------------------------------------------
    // INVALID JWT
    // --------------------------------------------------------

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    // --------------------------------------------------------
    // INVALID TOKEN FORMAT
    // --------------------------------------------------------

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is not active yet.",
      });
    }

    // --------------------------------------------------------
    // OTHER AUTHENTICATION ERROR
    // --------------------------------------------------------

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed. Please login again.",
    });
  }
};


// ============================================================
// ALLOW SPECIFIC ROLES
//
// Example:
// allowRoles("admin")
// allowRoles("employee")
// allowRoles("admin", "employee")
// ============================================================

const allowRoles = (...roles) => {
  return (req, res, next) => {

    // --------------------------------------------------------
    // USER MUST BE AUTHENTICATED
    // --------------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // CHECK ROLE
    // --------------------------------------------------------

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    // --------------------------------------------------------
    // ROLE ALLOWED
    // --------------------------------------------------------

    next();
  };
};


// ============================================================
// ADMIN ONLY
// ============================================================

const requireAdmin = (req, res, next) => {

  // --------------------------------------------------------
  // AUTHENTICATION CHECK
  // --------------------------------------------------------

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // --------------------------------------------------------
  // ADMIN ROLE CHECK
  // --------------------------------------------------------

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "Admin access required.",
    });
  }

  // --------------------------------------------------------
  // ADMIN ALLOWED
  // --------------------------------------------------------

  next();
};


// ============================================================
// EMPLOYEE ONLY
// ============================================================

const requireEmployee = (req, res, next) => {

  // --------------------------------------------------------
  // AUTHENTICATION CHECK
  // --------------------------------------------------------

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // --------------------------------------------------------
  // EMPLOYEE ROLE CHECK
  // --------------------------------------------------------

  if (req.user.role !== "employee") {
    return res.status(403).json({
      success: false,
      message:
        "Employee access required.",
    });
  }

  // --------------------------------------------------------
  // EMPLOYEE ALLOWED
  // --------------------------------------------------------

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
