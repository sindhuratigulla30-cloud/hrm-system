const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// ==========================================
// EMPLOYEE REGISTRATION
// ==========================================

const registerEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      password,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !department ||
      !position ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check whether email already exists
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Generate employee ID
    const employeeCount = await Employee.countDocuments();

    const employeeId = `EMP${String(employeeCount + 1).padStart(4, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await Employee.create({
      employeeId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      department: department.trim(),
      position: position.trim(),
      password: hashedPassword,
      role: "employee",
      status: "Active",
    });

    // Return safe response
    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Employee registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find employee by email
    const employee = await Employee.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (employee.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Check whether password exists
    if (!employee.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account is not configured for login. Please contact the administrator.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration is missing",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        role: employee.role,
        status: employee.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

module.exports = {
  registerEmployee,
  login,
};