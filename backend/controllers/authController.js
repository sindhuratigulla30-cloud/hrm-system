const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

/*
|--------------------------------------------------------------------------
| Employee Login
|--------------------------------------------------------------------------
*/
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const employee = await Employee.findOne({
      email: normalizedEmail,
    });

    if (!employee) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (employee.status !== "Active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    if (!employee.password) {
      return res.status(401).json({
        message: "Password is not configured for this account.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        role: employee.role,
        status: employee.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Employee Registration
|--------------------------------------------------------------------------
*/
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        message: "Please enter your full name.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    // Check whether email already exists
    const existingEmployee = await Employee.findOne({
      email: normalizedEmail,
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "An employee with this email already exists.",
      });
    }

    /*
     * Split full name into first name and last name.
     *
     * Example:
     * "Siddeshwar Srawan"
     * firstName = Siddeshwar
     * lastName  = Srawan
     */
    const nameParts = trimmedName.split(/\s+/);

    const firstName = nameParts[0];

    const lastName =
      nameParts.length > 1
        ? nameParts.slice(1).join(" ")
        : "";

    /*
     * Generate Employee ID
     *
     * Example:
     * EMP-1723981234567
     */
    const employeeId = `EMP-${Date.now()}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    /*
     * Create employee
     *
     * New registrations are always normal employees.
     * They cannot register themselves as administrators.
     */
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email: normalizedEmail,

      // Default values for self-registration
      department: "General",
      position: "Employee",

      password: hashedPassword,

      status: "Active",
      role: "employee",
    });

    return res.status(201).json({
      message: "Registration successful.",
      employee: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        role: employee.role,
        status: employee.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // MongoDB duplicate-key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this information already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
};


module.exports = {
  login,
  register,
};