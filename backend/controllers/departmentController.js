const Department = require("../models/Department");
const Employee = require("../models/Employee");

// Create department
const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const departmentsWithCount = await Promise.all(
      departments.map(async (department) => {
        const employeeCount = await Employee.countDocuments({
          department: department.name,
        });

        return {
          ...department.toObject(),
          employeeCount,
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithCount.length,
      departments: departmentsWithCount,
    });
  } catch (error) {
    console.error("Get departments error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one department
const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

     const employeeCount = await Employee.countDocuments({
      department: department.name,
    });

    res.json({
      success: true,
      department: {
        ...department.toObject(),
        employeeCount,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const oldDepartment = await Department.findById(req.params.id);

    if (!oldDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const oldName = oldDepartment.name;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Update employees if department name changed
    if (req.body.name && req.body.name !== oldName) {
      await Employee.updateMany(
        { department: oldName },
        { $set: { department: req.body.name } }
      );
    }

    res.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const employeeCount = await Employee.countDocuments({
      department: department.name,
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${department.name}. ${employeeCount} employee(s) are assigned to this department.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error.message);

    res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};