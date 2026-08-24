const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// ============================================================
// TODAY DATE
// ============================================================

const getTodayDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// GET LOGGED-IN EMPLOYEE ID
// ============================================================

const getLoggedInEmployeeId = (req) => {
  if (!req.user) {
    return null;
  }

  if (!req.user._id) {
    return null;
  }

  return req.user._id;
};

// ============================================================
// CLOCK IN
// ============================================================

const checkIn = async (req, res) => {
  try {
    const employeeId = getLoggedInEmployeeId(req);

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can mark attendance.",
      });
    }

    if (employee.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your employee account is inactive. Please contact admin.",
      });
    }

    const today = getTodayDate();

    let attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: today,
    });

    if (attendance && attendance.loginTime) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today.",
        attendance,
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        employeeId: employeeId,
        date: today,
        loginTime: new Date(),
        logoutTime: null,
        workingHours: 0,
        status: "Present",
      });
    } else {
      attendance.loginTime = new Date();
      attendance.logoutTime = null;
      attendance.workingHours = 0;
      attendance.status = "Present";
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Clock In successful.",
      attendance,
    });
  } catch (error) {
    console.error("CLOCK IN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark Clock In.",
      error: error.message,
    });
  }
};

// ============================================================
// CLOCK OUT
// ============================================================

const checkOut = async (req, res) => {
  try {
    const employeeId = getLoggedInEmployeeId(req);

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can mark attendance.",
      });
    }

    if (employee.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your employee account is inactive. Please contact admin.",
      });
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: today,
    });

    if (!attendance || !attendance.loginTime) {
      return res.status(400).json({
        success: false,
        message: "You must Clock In before Clock Out.",
      });
    }

    if (attendance.logoutTime) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today.",
        attendance,
      });
    }

    const logoutTime = new Date();

    attendance.logoutTime = logoutTime;

    const milliseconds =
      logoutTime.getTime() -
      attendance.loginTime.getTime();

    const workingHours =
      milliseconds / (1000 * 60 * 60);

    attendance.workingHours =
      Number(workingHours.toFixed(2));

    if (attendance.workingHours < 4) {
      attendance.status = "Half Day";
    } else {
      attendance.status = "Present";
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Clock Out successful.",
      attendance,
    });
  } catch (error) {
    console.error("CLOCK OUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark Clock Out.",
      error: error.message,
    });
  }
};

// ============================================================
// GET TODAY ATTENDANCE
// ============================================================

const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = getLoggedInEmployeeId(req);

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: today,
    }).populate(
      "employeeId",
      "employeeId firstName lastName email department position role status"
    );

    return res.status(200).json({
      success: true,
      attendance: attendance || null,
    });
  } catch (error) {
    console.error(
      "GET TODAY ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch today's attendance.",
      error: error.message,
    });
  }
};

// ============================================================
// GET MY ATTENDANCE
// ============================================================

const getMyAttendance = async (req, res) => {
  try {
    const employeeId = getLoggedInEmployeeId(req);

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const attendance = await Attendance.find({
      employeeId: employeeId,
    })
      .populate(
        "employeeId",
        "employeeId firstName lastName email department position role status"
      )
      .sort({
        date: -1,
      });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "GET MY ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance history.",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL ATTENDANCE
// ADMIN ONLY
// ============================================================

const getAllAttendance = async (req, res) => {
  try {
    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const attendance = await Attendance.find()
      .populate(
        "employeeId",
        "employeeId firstName lastName email department position role status"
      )
      .sort({
        date: -1,
      });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "GET ALL ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance.",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
};