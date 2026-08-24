const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");

// ============================================================
// CREATE EMPLOYEE
// ADMIN ONLY
// ============================================================

const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      status,
      address,
    } = req.body;

    // ========================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================

    if (
      !employeeId ||
      !firstName ||
      !lastName ||
      !email ||
      !department ||
      !position
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, first name, last name, email, department and position are required.",
      });
    }

    // ========================================================
    // CHECK DUPLICATE EMPLOYEE ID OR EMAIL
    // ========================================================

    const existingEmployee = await Employee.findOne({
      $or: [
        {
          employeeId: employeeId.trim(),
        },
        {
          email: email.toLowerCase().trim(),
        },
      ],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID or email already exists.",
      });
    }

    // ========================================================
    // DEFAULT EMPLOYEE PASSWORD
    // ========================================================

    const temporaryPassword = "Employee@123";

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10
    );

    // ========================================================
    // CREATE EMPLOYEE
    // ========================================================

    const employee = await Employee.create({
      employeeId: employeeId.trim(),

      firstName: firstName.trim(),

      lastName: lastName.trim(),

      email: email.toLowerCase().trim(),

      phone: phone || "",

      department: department || "",

      position: position || "",

      salary: salary || 0,

      status: status || "active",

      // IMPORTANT:
      // Employees created here are ALWAYS employees.
      role: "employee",

      address: address || "",

      password: hashedPassword,
    });

    // ========================================================
    // REMOVE PASSWORD FROM RESPONSE
    // ========================================================

    const employeeResponse = employee.toObject();

    delete employeeResponse.password;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee: employeeResponse,
      temporaryPassword,
    });
  } catch (error) {
    console.error(
      "CREATE EMPLOYEE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL EMPLOYEES
// ADMIN ONLY
// ============================================================

const getEmployees = async (req, res) => {
  try {
    // ========================================================
    // EXTRA ADMIN SECURITY CHECK
    // ========================================================

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    // ========================================================
    // GET ALL EMPLOYEES
    // ========================================================

    const employees = await Employee.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error(
      "GET EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ONE EMPLOYEE
// ADMIN ONLY
// ============================================================

const getEmployee = async (req, res) => {
  try {
    // ========================================================
    // EXTRA ADMIN SECURITY CHECK
    // ========================================================

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    // ========================================================
    // FIND EMPLOYEE BY DATABASE ID
    // ========================================================

    const employee = await Employee.findById(
      req.params.id
    ).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(
      "GET EMPLOYEE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: "Invalid employee ID.",
    });
  }
};

// ============================================================
// GET CURRENT LOGGED-IN EMPLOYEE
// EMPLOYEE ONLY
// ============================================================
//
// IMPORTANT:
//
// This endpoint NEVER accepts:
//
// req.params.id
// req.query.employeeId
// req.body.employeeId
//
// It gets the employee directly from req.user._id.
//
// Therefore:
//
// Employee A → gets Employee A
// Employee B → gets Employee B
// Employee C → gets Employee C
//
// ============================================================

const getMyEmployee = async (req, res) => {
  try {
    // ========================================================
    // MAKE SURE USER IS AUTHENTICATED
    // ========================================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ========================================================
    // MAKE SURE USER IS AN EMPLOYEE
    // ========================================================

    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee access required.",
      });
    }

    // ========================================================
    // GET LOGGED-IN EMPLOYEE ID
    // ========================================================
    //
    // THIS IS THE MOST IMPORTANT PART.
    //
    // req.user._id comes from the JWT-authenticated
    // database user.
    //
    // We DO NOT trust an employee ID from frontend.
    //
    // ========================================================

    const loggedInEmployeeId =
      req.user._id;

    if (!loggedInEmployeeId) {
      return res.status(401).json({
        success: false,
        message:
          "Unable to identify logged-in employee.",
      });
    }

    // ========================================================
    // FIND ONLY THAT EMPLOYEE
    // ========================================================

    const employee = await Employee.findById(
      loggedInEmployeeId
    ).select("-password");

    // ========================================================
    // EMPLOYEE NOT FOUND
    // ========================================================

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee account not found.",
      });
    }

    // ========================================================
    // EXTRA SECURITY CHECK
    // ========================================================
    //
    // This ensures the employee document itself is actually
    // an employee account.
    //
    // ========================================================

    if (employee.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee access required.",
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(
      "GET MY EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your employee details.",
    });
  }
};

// ============================================================
// UPDATE EMPLOYEE
// ADMIN ONLY
// ============================================================

const updateEmployee = async (req, res) => {
  try {
    // ========================================================
    // EXTRA ADMIN SECURITY CHECK
    // ========================================================

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      status,
      address,
    } = req.body;

    // ========================================================
    // UPDATE
    // ========================================================

    const employee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        {
          employeeId,
          firstName,
          lastName,
          email,
          phone,
          department,
          position,
          salary,
          status,
          address,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message:
        "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error(
      "UPDATE EMPLOYEE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DELETE EMPLOYEE
// ADMIN ONLY
// ============================================================

const deleteEmployee = async (req, res) => {
  try {
    // ========================================================
    // EXTRA ADMIN SECURITY CHECK
    // ========================================================

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    // ========================================================
    // DELETE
    // ========================================================

    const employee =
      await Employee.findByIdAndDelete(
        req.params.id
      );

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message:
        "Employee deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE EMPLOYEE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message: "Invalid employee ID.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  getMyEmployee,
  updateEmployee,
  deleteEmployee,
};