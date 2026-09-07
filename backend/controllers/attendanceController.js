const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

/* ============================================================
   HELPER — GET CURRENT DATE
   Format: YYYY-MM-DD
============================================================ */

const getCurrentDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* ============================================================
   HELPER — GET CURRENT TIME
   Format: HH:mm
============================================================ */

const getCurrentTime = () => {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

/* ============================================================
   HELPER — CALCULATE WORKING HOURS
============================================================ */

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

  if (
    Number.isNaN(inHour) ||
    Number.isNaN(inMinute) ||
    Number.isNaN(outHour) ||
    Number.isNaN(outMinute)
  ) {
    return "0h 0m";
  }

  let startMinutes =
    inHour * 60 + inMinute;

  let endMinutes =
    outHour * 60 + outMinute;

  /*
    Supports overnight shifts.
  */
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

/* ============================================================
   HELPER — CALCULATE LIVE WORKING HOURS
   Used when employee has checked in but not checked out.
============================================================ */

const calculateLiveWorkingHours = (checkIn) => {
  if (!checkIn || checkIn === "-") {
    return "0h 0m";
  }

  const now = getCurrentTime();

  return calculateWorkingHours(
    checkIn,
    now
  );
};

/* ============================================================
   HELPER — GET EMPLOYEE NAME
============================================================ */

const getEmployeeName = (employee) => {
  return `${employee.firstName || ""} ${
    employee.lastName || ""
  }`.trim() || "Employee";
};

/* ============================================================
   ADMIN — GET ALL ATTENDANCE
   GET /api/attendance
============================================================ */

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

    return res.status(200).json({
      success: true,
      attendance: records,
    });
  } catch (error) {
    console.error(
      "GET ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load attendance records.",
    });
  }
};

/* ============================================================
   EMPLOYEE — GET MY ATTENDANCE
   GET /api/attendance/my

   IMPORTANT:
   Employee ID comes from JWT / authenticated user.
   Employee cannot request another employee's data.
============================================================ */

const getMyAttendance = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const records = await Attendance.find({
      employee: req.user._id,
    })
      .sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      attendance: records,
    });
  } catch (error) {
    console.error(
      "GET MY ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load your attendance.",
    });
  }
};

/* ============================================================
   EMPLOYEE — GET TODAY'S ATTENDANCE
   GET /api/attendance/my/today
============================================================ */

const getMyTodayAttendance = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const today = getCurrentDate();

    const attendance =
      await Attendance.findOne({
        employee: req.user._id,
        date: today,
      });

    if (!attendance) {
      return res.status(200).json({
        success: true,
        attendance: null,
      });
    }

    let liveWorkingHours =
      attendance.workingHours;

    if (
      attendance.checkIn !== "-" &&
      attendance.checkOut === "-"
    ) {
      liveWorkingHours =
        calculateLiveWorkingHours(
          attendance.checkIn
        );
    }

    return res.status(200).json({
      success: true,
      attendance: {
        ...attendance.toObject(),
        liveWorkingHours,
      },
    });
  } catch (error) {
    console.error(
      "GET TODAY ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load today's attendance.",
    });
  }
};

/* ============================================================
   EMPLOYEE — CHECK IN
   POST /api/attendance/check-in
============================================================ */

const checkIn = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message:
          "Only employees can check in.",
      });
    }

    const today = getCurrentDate();
    const currentTime = getCurrentTime();

    /*
      Prevent duplicate check-in.
    */
    const existing =
      await Attendance.findOne({
        employee: req.user._id,
        date: today,
      });

    if (existing) {
      if (
        existing.checkIn &&
        existing.checkIn !== "-"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "You have already checked in today.",
          attendance: existing,
        });
      }
    }

    const employeeName =
      getEmployeeName(req.user);

    let attendance;

    if (existing) {
      existing.checkIn = currentTime;
      existing.checkOut = "-";
      existing.workingHours = "0h 0m";
      existing.status = "Present";

      attendance =
        await existing.save();
    } else {
      attendance =
        await Attendance.create({
          employee: req.user._id,

          employeeId:
            req.user.employeeId,

          employeeName,

          date: today,

          status: "Present",

          checkIn: currentTime,

          checkOut: "-",

          workingHours: "0h 0m",
        });
    }

    return res.status(201).json({
      success: true,
      message:
        `Check-in successful at ${currentTime}.`,
      attendance,
    });
  } catch (error) {
    console.error(
      "EMPLOYEE CHECK-IN ERROR:",
      error
    );

    /*
      Handle MongoDB unique index race condition.
    */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for today.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to record check-in.",
    });
  }
};

/* ============================================================
   EMPLOYEE — CHECK OUT
   PUT /api/attendance/check-out
============================================================ */

const checkOut = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message:
          "Only employees can check out.",
      });
    }

    const today = getCurrentDate();
    const currentTime = getCurrentTime();

    const attendance =
      await Attendance.findOne({
        employee: req.user._id,
        date: today,
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "You have not checked in today.",
      });
    }

    if (
      !attendance.checkIn ||
      attendance.checkIn === "-"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please check in before checking out.",
      });
    }

    if (
      attendance.checkOut &&
      attendance.checkOut !== "-"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already checked out today.",
        attendance,
      });
    }

    const workingHours =
      calculateWorkingHours(
        attendance.checkIn,
        currentTime
      );

    attendance.checkOut =
      currentTime;

    attendance.workingHours =
      workingHours;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message:
        `Check-out successful at ${currentTime}.`,
      attendance,
    });
  } catch (error) {
    console.error(
      "EMPLOYEE CHECK-OUT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to record check-out.",
    });
  }
};

/* ============================================================
   ADMIN — CREATE ATTENDANCE
   POST /api/attendance
============================================================ */

const createAttendance = async (
  req,
  res
) => {
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
        message:
          "Employee not found.",
      });
    }

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
      getEmployeeName(
        employeeRecord
      );

    const finalStatus =
      status || "Present";

    const finalCheckIn =
      finalStatus === "Absent"
        ? "-"
        : checkIn || "-";

    const finalCheckOut =
      finalStatus === "Absent"
        ? "-"
        : checkOut || "-";

    const workingHours =
      finalStatus === "Absent"
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

        employeeName,

        date,

        status:
          finalStatus,

        checkIn:
          finalCheckIn,

        checkOut:
          finalCheckOut,

        workingHours,
      });

    return res.status(201).json({
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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this employee on this date.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to save attendance.",
    });
  }
};

/* ============================================================
   ADMIN — DELETE ATTENDANCE
   DELETE /api/attendance/:id
============================================================ */

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

    return res.status(200).json({
      success: true,
      message:
        "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete attendance.",
    });
  }
};

/* ============================================================
   EXPORT
============================================================ */

module.exports = {
  getAttendance,
  getMyAttendance,
  getMyTodayAttendance,
  checkIn,
  checkOut,
  createAttendance,
  deleteAttendance,
};