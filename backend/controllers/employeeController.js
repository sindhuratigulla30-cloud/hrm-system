const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");

// Create employee
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

    // Validate required fields
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

    // Check duplicate employee ID
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID or email already exists.",
      });
    }

    // Generate temporary password
    const temporaryPassword = "Employee@123";

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      status: status || "Active",
      address,
      password: hashedPassword,
    });

    // Never send hashed password to frontend
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee: employeeResponse,
      temporaryPassword,
    });
  } catch (error) {
    console.error("Create employee error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one employee
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
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

    const employee = await Employee.findByIdAndUpdate(
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

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};