const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

/* ============================================================
   CREATE JWT TOKEN
============================================================ */

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      employeeId: user.employeeId || null,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

/* ============================================================
   ADMIN LOGIN
============================================================ */

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    /* -----------------------------
       FIND ADMIN ONLY
    ----------------------------- */

    const admin = await Employee.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    /* -----------------------------
       CHECK PASSWORD
    ----------------------------- */

    if (!admin.password) {
      return res.status(500).json({
        success: false,
        message: "Admin account does not have a password configured",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    /* -----------------------------
       CREATE ADMIN TOKEN
    ----------------------------- */

    const token = createToken(admin);

    /* -----------------------------
       ADMIN RESPONSE
    ----------------------------- */

    return res.status(200).json({
      success: true,
      message: "Admin login successful",

      token,

      user: {
        id: admin._id,
        employeeId: admin.employeeId || null,
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        email: admin.email,
        department: admin.department || "",
        position: admin.position || "",
        phone: admin.phone || "",
        role: "admin",
        status: admin.status || "active",
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

/* ============================================================
   EMPLOYEE LOGIN

   Employee must provide:
   1. Employee ID
   2. Email
   3. Password

   IMPORTANT:
   Employee can ONLY login as role = employee.
============================================================ */

const employeeLogin = async (req, res) => {
  try {
    const {
      employeeId,
      email,
      password,
    } = req.body;

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!employeeId || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, email and password are required",
      });
    }

    const normalizedEmployeeId =
      employeeId.trim();

    const normalizedEmail =
      email.toLowerCase().trim();

    /* -----------------------------
       FIND EXACT EMPLOYEE

       employeeId + email + role
       must all match.
    ----------------------------- */

    const employee = await Employee.findOne({
      employeeId: normalizedEmployeeId,
      email: normalizedEmail,
      role: "employee",
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid employee ID, email or password",
      });
    }

    /* -----------------------------
       CHECK ACCOUNT STATUS
    ----------------------------- */

    const employeeStatus =
      String(employee.status || "")
        .toLowerCase()
        .trim();

    if (employeeStatus !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your employee account is inactive. Please contact admin.",
      });
    }

    /* -----------------------------
       CHECK PASSWORD
    ----------------------------- */

    if (!employee.password) {
      return res.status(500).json({
        success: false,
        message:
          "Employee account does not have a password configured",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        employee.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid employee ID, email or password",
      });
    }

    /* -----------------------------
       CREATE EMPLOYEE TOKEN
    ----------------------------- */

    const token = createToken(employee);

    /* -----------------------------
       EMPLOYEE RESPONSE

       Only this employee's details
       are returned.
    ----------------------------- */

    return res.status(200).json({
      success: true,
      message: "Employee login successful",

      token,

      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email,
        department: employee.department || "",
        position: employee.position || "",
        phone: employee.phone || "",
        role: "employee",
        status: employee.status,
        address: employee.address || "",
      },
    });
  } catch (error) {
    console.error(
      "EMPLOYEE LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during employee login",
    });
  }
};

/* ============================================================
   GET CURRENT USER

   IMPORTANT:
   req.user.id comes from the verified JWT.

   This means an employee cannot request another
   employee's profile by changing an ID in the frontend.
============================================================ */

const getCurrentUser = async (req, res) => {
  try {
    /* -----------------------------
       CHECK AUTH USER
    ----------------------------- */

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /* -----------------------------
       GET ONLY JWT USER
    ----------------------------- */

    const user = await Employee.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* -----------------------------
       SECURITY CHECK

       If JWT says employee, return
       employee's own record only.

       There is NO find-all operation
       here.
    ----------------------------- */

    return res.status(200).json({
      success: true,
      employee: user,
    });
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   EXPORT
============================================================ */

module.exports = {
  adminLogin,
  employeeLogin,
  getCurrentUser,
};