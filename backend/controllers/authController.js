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
      expiresIn: "7d",
    }
  );
};


/* ============================================================
   EMPLOYEE REGISTRATION
   POST /api/auth/register
============================================================ */

const registerEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      position,
      address,
    } = req.body;


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "First name, email and password are required.",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName ? lastName.trim() : "";


    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }


    // ------------------------------------------
    // CHECK EXISTING EMAIL
    // ------------------------------------------

    const existingEmployee =
      await Employee.findOne({
        email: normalizedEmail,
      });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }


    // ------------------------------------------
    // GENERATE EMPLOYEE ID
    // ------------------------------------------

    const lastEmployee =
      await Employee.findOne({
        role: "employee",
      }).sort({
        createdAt: -1,
      });


    let nextNumber = 1;

    if (
      lastEmployee &&
      lastEmployee.employeeId
    ) {
      const match =
        lastEmployee.employeeId.match(
          /EMP(\d+)/
        );

      if (match) {
        nextNumber =
          parseInt(match[1], 10) + 1;
      }
    }


    const employeeId =
      `EMP${String(nextNumber).padStart(3, "0")}`;


    // ------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);


    // ------------------------------------------
    // CREATE EMPLOYEE
    // ------------------------------------------

    const employee =
      await Employee.create({
        employeeId,

        firstName:
          normalizedFirstName,

        lastName:
          normalizedLastName,

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

        address:
          address ? address.trim() : "",

        status: "active",

        // VERY IMPORTANT
        // Every public registration is ALWAYS
        // an employee account.
        role: "employee",
      });


    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Employee registration successful.",

      employee: {
        id: employee._id,

        employeeId:
          employee.employeeId,

        firstName:
          employee.firstName,

        lastName:
          employee.lastName,

        email:
          employee.email,

        phone:
          employee.phone,

        department:
          employee.department,

        position:
          employee.position,

        address:
          employee.address,

        status:
          employee.status,

        role:
          employee.role,
      },
    });

  } catch (error) {

    console.error(
      "EMPLOYEE REGISTRATION ERROR:",
      error
    );


    // MongoDB duplicate error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with these details already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Server error during employee registration.",
    });
  }
};


/* ============================================================
   COMMON LOGIN
   POST /api/auth/login

   ONE LOGIN FOR:
   - HR/Admin
   - Employee

   Backend identifies the role automatically.
============================================================ */

const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();


    // ------------------------------------------
    // FIND USER
    // ------------------------------------------

    const user =
      await Employee.findOne({
        email: normalizedEmail,
      });


    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // ------------------------------------------
    // CHECK ACCOUNT STATUS
    // ------------------------------------------

    const userStatus =
      String(user.status || "")
        .toLowerCase()
        .trim();


    if (userStatus !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact HR/Admin.",
      });
    }


    // ------------------------------------------
    // CHECK PASSWORD
    // ------------------------------------------

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message:
          "This account does not have a password configured.",
      });
    }


    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // ------------------------------------------
    // CREATE JWT
    // ------------------------------------------

    const token =
      createToken(user);


    // ------------------------------------------
    // USER DATA
    // ------------------------------------------

    const userData = {
      id: user._id,

      employeeId:
        user.employeeId || null,

      firstName:
        user.firstName || "",

      lastName:
        user.lastName || "",

      email:
        user.email,

      phone:
        user.phone || "",

      department:
        user.department || "",

      position:
        user.position || "",

      address:
        user.address || "",

      joiningDate:
        user.joiningDate || null,

      salary:
        user.salary || 0,

      status:
        user.status,

      role:
        user.role,
    };


    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

      user: userData,
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login.",
    });
  }
};


/* ============================================================
   GET CURRENT LOGGED-IN USER
   GET /api/auth/me
============================================================ */

const getCurrentUser = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    const user =
      await Employee.findById(
        req.user._id || req.user.id
      ).select("-password");


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    return res.status(200).json({
      success: true,

      user,
    });

  } catch (error) {

    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error.",
    });
  }
};


/* ============================================================
   EXPORT CONTROLLERS
============================================================ */

module.exports = {
  registerEmployee,
  login,
  getCurrentUser,
};