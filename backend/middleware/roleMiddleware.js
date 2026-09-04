const allowRoles = (...roles) => {
  return (req, res, next) => {
    // ==========================================
    // USER MUST BE AUTHENTICATED
    // ==========================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // CHECK ROLE
    // ==========================================

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


module.exports = {
  allowRoles,
  requireAdmin,
  requireEmployee,
};