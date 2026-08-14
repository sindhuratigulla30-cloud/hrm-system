const Payroll = require("../models/payrollModel");

// ============================================================
// GET ALL PAYROLL RECORDS
// ============================================================

const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find()
      .populate("employeeId", "firstName lastName employeeId department position")
      .sort({ createdAt: -1 });

    res.status(200).json({
      payroll,
    });
  } catch (error) {
    console.error("Get payroll error:", error);

    res.status(500).json({
      message: "Unable to fetch payroll records.",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE PAYROLL RECORD
// ============================================================

const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employeeId",
      "firstName lastName employeeId department position"
    );

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll record not found.",
      });
    }

    res.status(200).json({
      payroll,
    });
  } catch (error) {
    console.error("Get payroll by ID error:", error);

    res.status(500).json({
      message: "Unable to fetch payroll record.",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE PAYROLL RECORD
// ============================================================

const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      position,
      salary,
      bonus = 0,
      deductions = 0,
      status = "Pending",
      month = "",
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required.",
      });
    }

    if (!employeeName) {
      return res.status(400).json({
        message: "Employee name is required.",
      });
    }

    if (salary === undefined || salary === null) {
      return res.status(400).json({
        message: "Salary is required.",
      });
    }

    const numericSalary = Number(salary);
    const numericBonus = Number(bonus) || 0;
    const numericDeductions = Number(deductions) || 0;

    if (Number.isNaN(numericSalary)) {
      return res.status(400).json({
        message: "Salary must be a valid number.",
      });
    }

    const netSalary =
      numericSalary +
      numericBonus -
      numericDeductions;

    if (netSalary < 0) {
      return res.status(400).json({
        message: "Net salary cannot be negative.",
      });
    }

    const payroll = await Payroll.create({
      employeeId,
      employeeName,
      department: department || "",
      position: position || "",
      salary: numericSalary,
      bonus: numericBonus,
      deductions: numericDeductions,
      netSalary,
      status,
      month,
    });

    res.status(201).json({
      message: "Payroll record created successfully.",
      payroll,
    });
  } catch (error) {
    console.error("Create payroll error:", error);

    res.status(500).json({
      message: "Unable to create payroll record.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE PAYROLL RECORD
// ============================================================

const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll record not found.",
      });
    }

    const {
      employeeId,
      employeeName,
      department,
      position,
      salary,
      bonus,
      deductions,
      status,
      month,
    } = req.body;

    if (employeeId !== undefined) {
      payroll.employeeId = employeeId;
    }

    if (employeeName !== undefined) {
      payroll.employeeName = employeeName;
    }

    if (department !== undefined) {
      payroll.department = department;
    }

    if (position !== undefined) {
      payroll.position = position;
    }

    if (salary !== undefined) {
      payroll.salary = Number(salary);
    }

    if (bonus !== undefined) {
      payroll.bonus = Number(bonus) || 0;
    }

    if (deductions !== undefined) {
      payroll.deductions = Number(deductions) || 0;
    }

    if (status !== undefined) {
      payroll.status = status;
    }

    if (month !== undefined) {
      payroll.month = month;
    }

    payroll.netSalary =
      Number(payroll.salary || 0) +
      Number(payroll.bonus || 0) -
      Number(payroll.deductions || 0);

    if (payroll.netSalary < 0) {
      return res.status(400).json({
        message: "Net salary cannot be negative.",
      });
    }

    await payroll.save();

    res.status(200).json({
      message: "Payroll record updated successfully.",
      payroll,
    });
  } catch (error) {
    console.error("Update payroll error:", error);

    res.status(500).json({
      message: "Unable to update payroll record.",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE PAYROLL RECORD
// ============================================================

const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll record not found.",
      });
    }

    await payroll.deleteOne();

    res.status(200).json({
      message: "Payroll record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete payroll error:", error);

    res.status(500).json({
      message: "Unable to delete payroll record.",
      error: error.message,
    });
  }
};

module.exports = {
  getPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
};