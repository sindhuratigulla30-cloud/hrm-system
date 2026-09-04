const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");

const getLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find()
      .populate("employeeId", "firstName lastName employeeId department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      leaveRequests: requests,
    });
  } catch (error) {
    console.error("Get leave requests error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Employee, leave type, start date and end date are required.",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave dates.",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

    const request = await LeaveRequest.create({
      employeeId: employee._id,
      employeeName,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason || "",
      status: "Pending",
    });

    const populated = await request.populate(
      "employeeId",
      "firstName lastName employeeId department"
    );

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      leaveRequest: populated,
    });
  } catch (error) {
    console.error("Create leave request error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Approved or Rejected.",
      });
    }

    const request = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("employeeId", "firstName lastName employeeId department");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      leaveRequest: request,
    });
  } catch (error) {
    console.error("Update leave request error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    res.json({
      success: true,
      message: "Leave request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete leave request error:", error.message);
    res.status(400).json({
      success: false,
      message: "Invalid leave request ID.",
    });
  }
};

module.exports = {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
};

const updateLeaveRequest = async (req, res) => {
  try {
    const {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !employeeId ||
      !leaveType ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, leave type, start date and end date are required.",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave dates.",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const employeeName =
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim();

    const request =
      await LeaveRequest.findByIdAndUpdate(
        req.params.id,
        {
          employeeId: employee._id,
          employeeName,
          leaveType,
          startDate: start,
          endDate: end,
          reason: reason || "",
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "employeeId",
        "firstName lastName employeeId department"
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    res.json({
      success: true,
      message: "Leave request updated successfully.",
      leaveRequest: request,
    });
  } catch (error) {
    console.error(
      "Update leave request error:",
      error.message
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};