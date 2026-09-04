const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// ============================================================
// CALCULATE WORKING HOURS
// ============================================================

const calculateWorkingHours = (checkIn, checkOut) => {
  if (
    !checkIn ||
    !checkOut ||
    checkIn === "-" ||
    checkOut === "-"
  ) {
    return "0h 0m";
  }

  const [inHour, inMinute] = checkIn
    .split(":")
    .map(Number);

  const [outHour, outMinute] = checkOut
    .split(":")
    .map(Number);

  let startMinutes =
    inHour * 60 + inMinute;

  let endMinutes =
    outHour * 60 + outMinute;

  // Supports overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const difference =
    endMinutes - startMinutes;

  const hours =
    Math.floor(difference / 60);

  const minutes =
    difference % 60;

  return `${hours}h ${minutes}m`;
};

// ============================================================
// GET ALL ATTENDANCE
// ============================================================

const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate(
        "employee",
        "employeeId firstName lastName email department position"
      )
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      attendance: records,
    });
  } catch (error) {
    console.error(
      "GET ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load attendance records.",
    });
  }
};

// ============================================================
// CREATE ATTENDANCE
// ============================================================

const createAttendance = async (req, res) => {
  try {
    const {
      employee,
      date,
      status,
      checkIn,
      checkOut,
    } = req.body;

    if (!employee || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Employee and date are required.",
      });
    }

    const employeeRecord =
      await Employee.findById(employee);

    if (!employeeRecord) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check duplicate attendance
    const existing =
      await Attendance.findOne({
        employee,
        date,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this employee on this date.",
      });
    }

    const employeeName =
      `${employeeRecord.firstName || ""} ${
        employeeRecord.lastName || ""
      }`.trim();

    const finalCheckIn =
      status === "Absent"
        ? "-"
        : checkIn || "-";

    const finalCheckOut =
      status === "Absent"
        ? "-"
        : checkOut || "-";

    const workingHours =
      status === "Absent"
        ? "0h 0m"
        : calculateWorkingHours(
            finalCheckIn,
            finalCheckOut
          );

    const attendance =
      await Attendance.create({
        employee:
          employeeRecord._id,

        employeeId:
          employeeRecord.employeeId,

        employeeName:
          employeeName || "Employee",

        date,

        status:
          status || "Present",

        checkIn:
          finalCheckIn,

        checkOut:
          finalCheckOut,

        workingHours,
      });

    res.status(201).json({
      success: true,
      message:
        "Attendance marked successfully.",
      attendance,
    });
  } catch (error) {
    console.error(
      "CREATE ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to save attendance.",
    });
  }
};

// ============================================================
// DELETE ATTENDANCE
// ============================================================

const deleteAttendance = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const attendance =
      await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found.",
      });
    }

    await Attendance.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to delete attendance.",
    });
  }
};

module.exports = {
  getAttendance,
  createAttendance,
  deleteAttendance,
};