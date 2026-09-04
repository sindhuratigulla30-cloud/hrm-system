const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");


// ============================================================
// CREATE EMPLOYEE
// ADMIN / HR ONLY
//
// This is for HR/Admin creating an employee manually.
// Public employee registration is handled by authController.
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
      joiningDate,
    } = req.body;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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


    const normalizedEmployeeId =
      employeeId.trim();

    const normalizedEmail =
      email.toLowerCase().trim();


    // --------------------------------------------------------
    // CHECK DUPLICATE EMPLOYEE ID
    // --------------------------------------------------------

    const existingEmployeeId =
      await Employee.findOne({
        employeeId: normalizedEmployeeId,
      });

    if (existingEmployeeId) {
      return res.status(409).json({
        success: false,
        message:
          "Employee ID already exists.",
      });
    }


    // --------------------------------------------------------
    // CHECK DUPLICATE EMAIL
    // --------------------------------------------------------

    const existingEmail =
      await Employee.findOne({
        email: normalizedEmail,
      });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Email address is already registered.",
      });
    }


    // --------------------------------------------------------
    // DEFAULT PASSWORD
    //
    // HR-created accounts receive a temporary password.
    // Public registration uses the employee's own password.
    // --------------------------------------------------------

    const temporaryPassword =
      "Employee@123";

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );


    // --------------------------------------------------------
    // CREATE EMPLOYEE
    // --------------------------------------------------------

    const employee =
      await Employee.create({
        employeeId:
          normalizedEmployeeId,

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        phone:
          phone ? phone.trim() : "",

        department:
          department ? department.trim() : "",

        position:
          position ? position.trim() : "",

        salary:
          Number(salary) || 0,

        status:
          status === "inactive"
            ? "inactive"
            : "active",

        address:
          address ? address.trim() : "",

        joiningDate:
          joiningDate || Date.now(),

        // NEVER allow this API to create an admin.
        role: "employee",
      });


    // --------------------------------------------------------
    // REMOVE PASSWORD
    // --------------------------------------------------------

    const employeeResponse =
      employee.toObject();

    delete employeeResponse.password;


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Employee created successfully.",

      employee:
        employeeResponse,

      temporaryPassword,
    });

  } catch (error) {

    console.error(
      "CREATE EMPLOYEE ERROR:",
      error
    );


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Employee ID or email already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Server error while creating employee.",
    });
  }
};


// ============================================================
// GET ALL EMPLOYEES
// ADMIN / HR ONLY
// GET /api/employees
// ============================================================

const getEmployees = async (req, res) => {
  try {

    const employees =
      await Employee.find({
        role: "employee",
      })
        .select("-password")
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      count:
        employees.length,

      employees,
    });

  } catch (error) {

    console.error(
      "GET EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching employees.",
    });
  }
};


// ============================================================
// GET ONE EMPLOYEE
// ADMIN / HR ONLY
// GET /api/employees/:id
// ============================================================

const getEmployee = async (req, res) => {
  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee ID.",
      });
    }


    const employee =
      await Employee.findOne({
        _id: req.params.id,
        role: "employee",
      }).select("-password");


    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found.",
      });
    }


    return res.status(200).json({
      success: true,
      employee,
    });

  } catch (error) {

    console.error(
      "GET EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching employee.",
    });
  }
};


// ============================================================
// GET CURRENT LOGGED-IN EMPLOYEE
// EMPLOYEE ONLY
//
// GET /api/employees/me
//
// IMPORTANT:
//
// The employee ID is NEVER accepted from the frontend.
//
// We use:
// req.user._id
//
// Therefore:
//
// Employee A → Employee A's data
// Employee B → Employee B's data
// Employee C → Employee C's data
// ============================================================

const getMyEmployee = async (req, res) => {
  try {

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // --------------------------------------------------------
    // EMPLOYEE ROLE
    // --------------------------------------------------------

    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message:
          "Employee access required.",
      });
    }


    // --------------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------------

    const employee =
      await Employee.findOne({
        _id: req.user._id,
        role: "employee",
      }).select("-password");


    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee account not found.",
      });
    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

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
// ADMIN / HR ONLY
// PUT /api/employees/:id
// ============================================================

const updateEmployee = async (req, res) => {
  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee ID.",
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
      joiningDate,
    } = req.body;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      !firstName ||
      !lastName ||
      !email ||
      !department ||
      !position
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email, department and position are required.",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedEmployeeId =
      employeeId
        ? employeeId.trim()
        : undefined;


    // --------------------------------------------------------
    // CHECK DUPLICATE EMAIL
    // --------------------------------------------------------

    const duplicateEmail =
      await Employee.findOne({
        email: normalizedEmail,
        _id: {
          $ne: req.params.id,
        },
      });

    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Email address is already used by another employee.",
      });
    }


    // --------------------------------------------------------
    // CHECK DUPLICATE EMPLOYEE ID
    // --------------------------------------------------------

    if (normalizedEmployeeId) {

      const duplicateEmployeeId =
        await Employee.findOne({
          employeeId:
            normalizedEmployeeId,

          _id: {
            $ne: req.params.id,
          },
        });


      if (duplicateEmployeeId) {
        return res.status(409).json({
          success: false,
          message:
            "Employee ID is already used by another employee.",
        });
      }
    }


    // --------------------------------------------------------
    // BUILD UPDATE
    // --------------------------------------------------------

    const updateData = {
      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      email:
        normalizedEmail,

      phone:
        phone ? phone.trim() : "",

      department:
        department ? department.trim() : "",

      position:
        position ? position.trim() : "",

      salary:
        Number(salary) || 0,

      status:
        status === "inactive"
          ? "inactive"
          : "active",

      address:
        address ? address.trim() : "",
    };


    if (normalizedEmployeeId) {
      updateData.employeeId =
        normalizedEmployeeId;
    }


    if (joiningDate) {
      updateData.joiningDate =
        joiningDate;
    }


    // --------------------------------------------------------
    // UPDATE
    //
    // Notice:
    // role is NOT included.
    //
    // HR can update employee information,
    // but this endpoint cannot accidentally
    // change an employee into an admin.
    // --------------------------------------------------------

    const employee =
      await Employee.findOneAndUpdate(
        {
          _id: req.params.id,
          role: "employee",
        },

        updateData,

        {
          new: true,
          runValidators: true,
        }
      ).select("-password");


    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found.",
      });
    }


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


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Employee ID or email already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Server error while updating employee.",
    });
  }
};


// ============================================================
// DELETE EMPLOYEE
// ADMIN / HR ONLY
// DELETE /api/employees/:id
// ============================================================

const deleteEmployee = async (req, res) => {
  try {

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid employee ID.",
      });
    }


    const employee =
      await Employee.findOneAndDelete({
        _id: req.params.id,
        role: "employee",
      });


    if (!employee) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found.",
      });
    }


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

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting employee.",
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