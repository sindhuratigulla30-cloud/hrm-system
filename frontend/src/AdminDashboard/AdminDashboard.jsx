import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCircle,
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUserTimes,
  FaChevronRight,
  FaClipboardList,
  FaBriefcase,
  FaTimes,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdBadge,
} from "react-icons/fa";

import Attendance from "../Attendance/Attendance";
import Payroll from "../Payroll/Payroll";
import LeaveRequests from "../LeaveRequests/LeaveRequests";

import "./AdminDashboard.css";

const emptyEmployee = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  department: "",
  position: "",
  phone: "",
  salary: "",
  status: "active",
  role: "employee",
  joiningDate: "",
  address: "",
};

function AdminDashboard({
  user,
  token,
  apiUrl,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showEmployeeModal, setShowEmployeeModal] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [employeeForm, setEmployeeForm] =
    useState(emptyEmployee);

  const [savingEmployee, setSavingEmployee] =
    useState(false);

  const [deleteEmployee, setDeleteEmployee] =
    useState(null);

  const [deletingEmployee, setDeletingEmployee] =
    useState(false);

  // ============================================================
  // AXIOS CONFIG
  // ============================================================

  const axiosConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  // ============================================================
  // FETCH EMPLOYEES
  // ============================================================

  const fetchEmployees = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${apiUrl}/api/employees`,
        axiosConfig
      );

      const data =
        response.data?.data ||
        response.data?.employees ||
        response.data ||
        [];

      setEmployees(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "FETCH EMPLOYEES ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {
    fetchEmployees();
  }, [token, apiUrl]);

  // ============================================================
  // EMPLOYEE STATISTICS
  // ============================================================

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) =>
      String(
        employee.status || ""
      ).toLowerCase() === "active"
  ).length;

  const inactiveEmployees =
    totalEmployees - activeEmployees;

  // ============================================================
  // DEPARTMENTS
  // ============================================================

  const departmentNames = [
    ...new Set(
      employees
        .map((employee) =>
          String(
            employee.department || ""
          ).trim()
        )
        .filter(Boolean)
    ),
  ];

  const totalDepartments =
    departmentNames.length;

  // ============================================================
  // SEARCH EMPLOYEES
  // ============================================================

  const filteredEmployees =
    employees.filter((employee) => {
      const searchValue =
        search.toLowerCase().trim();

      if (!searchValue) return true;

      const fullName =
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        String(
          employee.employeeId || ""
        )
          .toLowerCase()
          .includes(searchValue) ||
        String(
          employee.email || ""
        )
          .toLowerCase()
          .includes(searchValue) ||
        String(
          employee.department || ""
        )
          .toLowerCase()
          .includes(searchValue) ||
        String(
          employee.position || ""
        )
          .toLowerCase()
          .includes(searchValue)
      );
    });

  // ============================================================
  // RECENT EMPLOYEES
  // ============================================================

  const recentEmployees = [...employees]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt ||
          a.joiningDate ||
          0
      ).getTime();

      const dateB = new Date(
        b.createdAt ||
          b.joiningDate ||
          0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // ============================================================
  // DEPARTMENT DATA
  // ============================================================

  const departments =
    departmentNames.map((department) => {
      const departmentEmployees =
        employees.filter(
          (employee) =>
            String(
              employee.department || ""
            )
              .trim()
              .toLowerCase() ===
            String(department)
              .trim()
              .toLowerCase()
        );

      const active =
        departmentEmployees.filter(
          (employee) =>
            String(
              employee.status || ""
            ).toLowerCase() === "active"
        ).length;

      const inactive =
        departmentEmployees.length -
        active;

      return {
        name: department,
        total: departmentEmployees.length,
        active,
        inactive,
      };
    });

  // ============================================================
  // DEPARTMENT COVERAGE
  // ============================================================

  const employeesWithDepartment =
    employees.filter(
      (employee) =>
        String(
          employee.department || ""
        ).trim() !== ""
    ).length;

  const departmentCoverage =
    totalEmployees > 0
      ? Math.round(
          (employeesWithDepartment /
            totalEmployees) *
            100
        )
      : 0;

  // ============================================================
  // OPEN ADD EMPLOYEE
  // ============================================================

  const handleAddEmployee = () => {
    setEditingEmployee(null);

    setEmployeeForm({
      ...emptyEmployee,
      employeeId: `EMP${String(
        employees.length + 1
      ).padStart(3, "0")}`,
    });

    setShowEmployeeModal(true);
  };

  // ============================================================
  // OPEN EDIT EMPLOYEE
  // ============================================================

  const handleEditEmployee = (
    employee
  ) => {
    setEditingEmployee(employee);

    setEmployeeForm({
      employeeId:
        employee.employeeId || "",

      firstName:
        employee.firstName || "",

      lastName:
        employee.lastName || "",

      email:
        employee.email || "",

      password: "",

      department:
        employee.department || "",

      position:
        employee.position || "",

      phone:
        employee.phone || "",

      salary:
        employee.salary || "",

      status:
        employee.status || "active",

      role:
        employee.role || "employee",

      joiningDate:
        employee.joiningDate
          ? String(
              employee.joiningDate
            ).substring(0, 10)
          : "",

      address:
        employee.address || "",
    });

    setShowEmployeeModal(true);
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setEmployeeForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ============================================================
  // SAVE EMPLOYEE
  // ============================================================

  const handleSaveEmployee =
    async (event) => {
      event.preventDefault();

      try {
        setSavingEmployee(true);
        setError("");

        const payload = {
          ...employeeForm,

          salary:
            employeeForm.salary === ""
              ? 0
              : Number(
                  employeeForm.salary
                ),
        };

        // Password required for new employee
        if (
          !editingEmployee &&
          !payload.password
        ) {
          setError(
            "Password is required for a new employee."
          );

          setSavingEmployee(false);
          return;
        }

        // Don't send blank password while editing
        if (
          editingEmployee &&
          !payload.password
        ) {
          delete payload.password;
        }

        if (editingEmployee) {
          const id =
            editingEmployee._id ||
            editingEmployee.id;

          await axios.put(
            `${apiUrl}/api/employees/${id}`,
            payload,
            axiosConfig
          );
        } else {
          await axios.post(
            `${apiUrl}/api/employees`,
            payload,
            axiosConfig
          );
        }

        await fetchEmployees();

        setShowEmployeeModal(false);
        setEditingEmployee(null);
        setEmployeeForm(emptyEmployee);
      } catch (err) {
        console.error(
          "SAVE EMPLOYEE ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to save employee."
        );
      } finally {
        setSavingEmployee(false);
      }
    };

  // ============================================================
  // DELETE EMPLOYEE
  // ============================================================

  const handleDeleteEmployee =
    async () => {
      if (!deleteEmployee) return;

      try {
        setDeletingEmployee(true);

        const id =
          deleteEmployee._id ||
          deleteEmployee.id;

        await axios.delete(
          `${apiUrl}/api/employees/${id}`,
          axiosConfig
        );

        setDeleteEmployee(null);

        await fetchEmployees();
      } catch (err) {
        console.error(
          "DELETE EMPLOYEE ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to delete employee."
        );
      } finally {
        setDeletingEmployee(false);
      }
    };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (
    value
  ) => {
    const amount =
      Number(value || 0);

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    value
  ) => {
    if (!value) return "—";

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  const getEmployeeName = (
    employee
  ) => {
    const name =
      `${employee?.firstName || ""} ${
        employee?.lastName || ""
      }`.trim();

    return (
      name || "Unknown Employee"
    );
  };

  // ============================================================
  // EMPLOYEE INITIALS
  // ============================================================

  const getInitials = (
    employee
  ) => {
    const first =
      employee?.firstName?.charAt(
        0
      ) || "";

    const last =
      employee?.lastName?.charAt(
        0
      ) || "";

    return (
      `${first}${last}`.toUpperCase() ||
      "E"
    );
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigation = [
    {
      id: "overview",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      id: "employees",
      label: "Employees",
      icon: <FaUsers />,
    },
    {
      id: "departments",
      label: "Departments",
      icon: <FaBuilding />,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <FaCalendarCheck />,
    },
    {
      id: "leave",
      label: "Leave Requests",
      icon: <FaClipboardList />,
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: <FaMoneyBillWave />,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="admin-dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="admin-sidebar">

        <div className="sidebar-brand">

          <div className="brand-logo">
            <FaUsers />
          </div>

          <div className="brand-text">
            <h2>
              HR Management
            </h2>

            <span>
              Organization Dashboard
            </span>
          </div>

        </div>

        <div className="system-status">

          <span className="online-dot"></span>

          <div>
            <strong>
              System Online
            </strong>

            <small>
              All systems connected
            </small>
          </div>

        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-navigation">

          {navigation.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${
                  activeTab ===
                  item.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    item.id
                  )
                }
              >

                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.label}
                </span>

                {activeTab ===
                  item.id && (
                  <FaChevronRight className="nav-arrow" />
                )}

              </button>
            )
          )}

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <FaSignOutAlt />
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <main className="admin-main">

        {/* TOP HEADER */}

        <header className="admin-topbar">

          <div className="topbar-title">

            <h1>

              {activeTab ===
                "overview" &&
                "Dashboard"}

              {activeTab ===
                "employees" &&
                "Employees"}

              {activeTab ===
                "departments" &&
                "Departments"}

              {activeTab ===
                "attendance" &&
                "Attendance"}

              {activeTab ===
                "leave" &&
                "Leave Requests"}

              {activeTab ===
                "payroll" &&
                "Payroll Management"}

            </h1>

            <p>

              {activeTab ===
                "overview" &&
                "Welcome to your HR management dashboard."}

              {activeTab ===
                "employees" &&
                "Manage and monitor your organization employees."}

              {activeTab ===
                "departments" &&
                "View employee distribution across departments."}

              {activeTab ===
                "attendance" &&
                "Monitor employee attendance and working hours."}

              {activeTab ===
                "leave" &&
                "Review and manage employee leave requests."}

              {activeTab ===
                "payroll" &&
                "Manage employee salaries and compensation."}

            </p>

          </div>

          <div className="topbar-user">

            <div className="topbar-user-avatar">

              {user?.firstName
                ?.charAt(0)
                ?.toUpperCase() ||
                user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                "S"}

            </div>

            <div className="topbar-user-info">

              <strong>

                {user?.firstName
                  ? `${user.firstName} ${
                      user.lastName ||
                      ""
                    }`
                  : user?.name ||
                    "System"}

              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="admin-error">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <FaTimes />
            </button>

          </div>
        )}

        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        {activeTab ===
          "overview" && (
          <section className="admin-content">

            <div className="section-heading-row">

              <div>

                <h2>
                  Dashboard Overview
                </h2>

                <p>
                  Monitor your organization's workforce.
                </p>

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleAddEmployee
                }
              >
                <FaUserPlus />
                Add Employee
              </button>

            </div>

            {/* STATISTICS */}

            <div className="statistics-grid">

              <div className="stat-card">

                <div className="stat-icon blue">
                  <FaUsers />
                </div>

                <div className="stat-content">

                  <span>
                    Total Employees
                  </span>

                  <strong>
                    {totalEmployees}
                  </strong>

                  <small>
                    Registered employees
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  <FaCheckCircle />
                </div>

                <div className="stat-content">

                  <span>
                    Active Employees
                  </span>

                  <strong>
                    {activeEmployees}
                  </strong>

                  <small>
                    Currently active
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  <FaUserTimes />
                </div>

                <div className="stat-content">

                  <span>
                    Inactive Employees
                  </span>

                  <strong>
                    {inactiveEmployees}
                  </strong>

                  <small>
                    Not currently active
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon purple">
                  <FaBuilding />
                </div>

                <div className="stat-content">

                  <span>
                    Departments
                  </span>

                  <strong>
                    {totalDepartments}
                  </strong>

                  <small>
                    Active departments
                  </small>

                </div>

              </div>

            </div>

            {/* RECENT EMPLOYEES */}

            <div className="content-card recent-employees-card">

              <div className="card-header">

                <div>

                  <h3>
                    Recent Employees
                  </h3>

                  <p>
                    Latest employees added to the system.
                  </p>

                </div>

                <button
                  type="button"
                  className="view-all-button"
                  onClick={() =>
                    setActiveTab(
                      "employees"
                    )
                  }
                >
                  View All
                  <FaChevronRight />
                </button>

              </div>

              {loading ? (

                <div className="table-loading">

                  <div className="loading-spinner"></div>

                  <span>
                    Loading employees...
                  </span>

                </div>

              ) : recentEmployees.length ===
                0 ? (

                <div className="empty-state">

                  <FaUsers />

                  <h3>
                    No Employees Yet
                  </h3>

                  <p>
                    Add your first employee to get started.
                  </p>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="admin-table recent-employees-table">

                    <thead>

                      <tr>
                        <th>
                          EMPLOYEE
                        </th>

                        <th>
                          EMPLOYEE ID
                        </th>

                        <th>
                          DEPARTMENT
                        </th>

                        <th>
                          POSITION
                        </th>

                        <th>
                          STATUS
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {recentEmployees.map(
                        (employee) => (
                          <tr
                            key={
                              employee._id ||
                              employee.employeeId
                            }
                          >

                            <td>

                              <div className="employee-cell">

                                <div className="employee-avatar">
                                  {getInitials(
                                    employee
                                  )}
                                </div>

                                <div className="employee-details">

                                  <strong>
                                    {getEmployeeName(
                                      employee
                                    )}
                                  </strong>

                                  <span>
                                    {employee.email ||
                                      "—"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="employee-id">
                                {employee.employeeId ||
                                  "—"}
                              </span>

                            </td>

                            <td>

                              <span className="department-badge">
                                {employee.department ||
                                  "—"}
                              </span>

                            </td>

                            <td>
                              {employee.position ||
                                "—"}
                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  String(
                                    employee.status ||
                                      ""
                                  ).toLowerCase() ===
                                  "active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >

                                <span></span>

                                {employee.status ||
                                  "Inactive"}

                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>
        )}

        {/* ====================================================
            EMPLOYEES
        ==================================================== */}

        {activeTab ===
          "employees" && (
          <section className="admin-content">

            <div className="section-heading-row">

              <div>

                <h2>
                  Employee Management
                </h2>

                <p>
                  Manage all employees in your organization.
                </p>

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleAddEmployee
                }
              >
                <FaUserPlus />
                Add Employee
              </button>

            </div>

            <div className="content-card">

              <div className="card-header employee-list-header">

                <div>

                  <h3>
                    All Employees
                  </h3>

                  <p>
                    {employees.length} employees found
                  </p>

                </div>

                <div className="search-box">

                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                  />

                </div>

              </div>

              {loading ? (

                <div className="table-loading">

                  <div className="loading-spinner"></div>

                  <span>
                    Loading employees...
                  </span>

                </div>

              ) : filteredEmployees.length ===
                0 ? (

                <div className="empty-state">

                  <FaUsers />

                  <h3>
                    No Employees Found
                  </h3>

                  <p>
                    Try changing your search or add a new employee.
                  </p>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="admin-table employee-management-table">

                    <thead>

                      <tr>

                        <th>
                          EMPLOYEE
                        </th>

                        <th>
                          ID
                        </th>

                        <th>
                          DEPARTMENT
                        </th>

                        <th>
                          POSITION
                        </th>

                        <th>
                          PHONE
                        </th>

                        <th>
                          SALARY
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTIONS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredEmployees.map(
                        (employee) => (
                          <tr
                            key={
                              employee._id ||
                              employee.employeeId
                            }
                          >

                            <td>

                              <div className="employee-cell">

                                <div className="employee-avatar">
                                  {getInitials(
                                    employee
                                  )}
                                </div>

                                <div className="employee-details">

                                  <strong>
                                    {getEmployeeName(
                                      employee
                                    )}
                                  </strong>

                                  <span>
                                    {employee.email ||
                                      "—"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="employee-id">
                                {employee.employeeId ||
                                  "—"}
                              </span>

                            </td>

                            <td>

                              <span className="department-badge">
                                {employee.department ||
                                  "—"}
                              </span>

                            </td>

                            <td>
                              {employee.position ||
                                "—"}
                            </td>

                            <td>
                              {employee.phone ||
                                "—"}
                            </td>

                            <td>

                              <strong className="salary-text">
                                {formatCurrency(
                                  employee.salary
                                )}
                              </strong>

                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  String(
                                    employee.status ||
                                      ""
                                  ).toLowerCase() ===
                                  "active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >

                                <span></span>

                                {employee.status ||
                                  "Inactive"}

                              </span>

                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  type="button"
                                  className="icon-action edit"
                                  title="Edit Employee"
                                  onClick={() =>
                                    handleEditEmployee(
                                      employee
                                    )
                                  }
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="icon-action delete"
                                  title="Delete Employee"
                                  onClick={() =>
                                    setDeleteEmployee(
                                      employee
                                    )
                                  }
                                >
                                  <FaTrash />
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>
        )}

        {/* ====================================================
            DEPARTMENTS
        ==================================================== */}

        {activeTab ===
          "departments" && (
          <section className="admin-content">

            <div className="section-heading-row">

              <div>

                <h2>
                  Department Management
                </h2>

                <p>
                  Manage and monitor employee distribution across departments.
                </p>

              </div>

            </div>

            {/* DEPARTMENT SUMMARY */}

            <div className="department-summary-grid">

              <div className="department-summary-card">

                <div className="department-summary-icon blue">
                  <FaBuilding />
                </div>

                <div>

                  <span>
                    Total Departments
                  </span>

                  <strong>
                    {totalDepartments}
                  </strong>

                  <small>
                    Departments in organization
                  </small>

                </div>

              </div>

              <div className="department-summary-card">

                <div className="department-summary-icon green">
                  <FaUsers />
                </div>

                <div>

                  <span>
                    Total Employees
                  </span>

                  <strong>
                    {totalEmployees}
                  </strong>

                  <small>
                    Employees across departments
                  </small>

                </div>

              </div>

              <div className="department-summary-card">

                <div className="department-summary-icon orange">
                  <FaCheckCircle />
                </div>

                <div>

                  <span>
                    Active Employees
                  </span>

                  <strong>
                    {activeEmployees}
                  </strong>

                  <small>
                    Currently active
                  </small>

                </div>

              </div>

              <div className="department-summary-card">

                <div className="department-summary-icon purple">
                  <FaBriefcase />
                </div>

                <div>

                  <span>
                    Department Coverage
                  </span>

                  <strong>
                    {departmentCoverage}%
                  </strong>

                  <small>
                    Employees assigned to departments
                  </small>

                </div>

              </div>

            </div>

            {/* DEPARTMENT TABLE */}

            <div className="content-card department-management-card">

              <div className="card-header">

                <div>

                  <h3>
                    All Departments
                  </h3>

                  <p>
                    {totalDepartments} departments found
                  </p>

                </div>

              </div>

              {departments.length ===
              0 ? (

                <div className="empty-state">

                  <FaBuilding />

                  <h3>
                    No Departments Found
                  </h3>

                  <p>
                    Departments will appear automatically when employees are assigned to a department.
                  </p>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="admin-table department-management-table">

                    <thead>

                      <tr>

                        <th>
                          DEPARTMENT
                        </th>

                        <th>
                          TOTAL EMPLOYEES
                        </th>

                        <th>
                          ACTIVE
                        </th>

                        <th>
                          INACTIVE
                        </th>

                        <th>
                          STATUS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {departments.map(
                        (department) => (
                          <tr
                            key={
                              department.name
                            }
                          >

                            <td>

                              <div className="department-name-cell">

                                <div className="department-table-icon">
                                  <FaBuilding />
                                </div>

                                <div>

                                  <strong>
                                    {department.name}
                                  </strong>

                                  <span>
                                    Organization department
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="department-count total">
                                {department.total}
                              </span>

                            </td>

                            <td>

                              <span className="department-count active">
                                {department.active}
                              </span>

                            </td>

                            <td>

                              <span className="department-count inactive">
                                {department.inactive}
                              </span>

                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  department.active >
                                  0
                                    ? "active"
                                    : "inactive"
                                }`}
                              >

                                <span></span>

                                {department.active >
                                0
                                  ? "Active"
                                  : "Inactive"}

                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>
        )}

        {/* ====================================================
            ATTENDANCE
        ==================================================== */}

        {activeTab ===
          "attendance" && (
          <section className="admin-content full-component">

            <Attendance
              user={user}
              token={token}
              apiUrl={apiUrl}
              employees={employees}
            />

          </section>
        )}

        {/* ====================================================
            LEAVE REQUESTS
        ==================================================== */}

        {activeTab ===
          "leave" && (
          <section className="admin-content full-component">

            <LeaveRequests
              employees={employees}
              token={token}
            />

          </section>
        )}

        {/* ====================================================
            PAYROLL
        ==================================================== */}

        {activeTab ===
          "payroll" && (
          <section className="admin-content payroll-component-wrapper">

            <Payroll
              user={user}
              token={token}
              apiUrl={apiUrl}
              employees={employees}
            />

          </section>
        )}

      </main>

      {/* ======================================================
          ADD / EDIT EMPLOYEE MODAL
      ====================================================== */}

      {showEmployeeModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowEmployeeModal(
                false
              );
            }
          }}
        >

          <div className="employee-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add New Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update employee information."
                    : "Create a new employee account."}
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowEmployeeModal(
                    false
                  )
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="employee-form"
              onSubmit={
                handleSaveEmployee
              }
            >

              {/* PERSONAL INFORMATION */}

              <div className="form-section-title">

                <FaUserCircle />

                <span>
                  Personal Information
                </span>

              </div>

              <div className="form-grid">

                {/* FIRST NAME */}

                <div className="form-group">

                  <label>
                    First Name *
                  </label>

                  <div className="input-with-icon">

                    <FaUserCircle />

                    <input
                      type="text"
                      name="firstName"
                      value={
                        employeeForm.firstName
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter first name"
                      required
                    />

                  </div>

                </div>

                {/* LAST NAME */}

                <div className="form-group">

                  <label>
                    Last Name
                  </label>

                  <div className="input-with-icon">

                    <FaUserCircle />

                    <input
                      type="text"
                      name="lastName"
                      value={
                        employeeForm.lastName
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter last name"
                    />

                  </div>

                </div>

                {/* EMPLOYEE ID */}

                <div className="form-group">

                  <label>
                    Employee ID *
                  </label>

                  <div className="input-with-icon">

                    <FaIdBadge />

                    <input
                      type="text"
                      name="employeeId"
                      value={
                        employeeForm.employeeId
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="EMP001"
                      required
                      disabled={Boolean(
                        editingEmployee
                      )}
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email *
                  </label>

                  <div className="input-with-icon">

                    <FaEnvelope />

                    <input
                      type="email"
                      name="email"
                      value={
                        employeeForm.email
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="employee@example.com"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                {!editingEmployee && (
                  <div className="form-group">

                    <label>
                      Password *
                    </label>

                    <div className="input-with-icon">

                      <FaBriefcase />

                      <input
                        type="password"
                        name="password"
                        value={
                          employeeForm.password
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Create password"
                        required
                      />

                    </div>

                  </div>
                )}

                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <div className="input-with-icon">

                    <FaPhone />

                    <input
                      type="tel"
                      name="phone"
                      value={
                        employeeForm.phone
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter phone number"
                    />

                  </div>

                </div>

              </div>

              {/* EMPLOYMENT INFORMATION */}

              <div className="form-section-title">

                <FaBriefcase />

                <span>
                  Employment Information
                </span>

              </div>

              <div className="form-grid">

                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    Department *
                  </label>

                  <div className="input-with-icon">

                    <FaBuilding />

                    <input
                      type="text"
                      name="department"
                      value={
                        employeeForm.department
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="IT"
                      required
                    />

                  </div>

                </div>

                {/* POSITION */}

                <div className="form-group">

                  <label>
                    Position *
                  </label>

                  <div className="input-with-icon">

                    <FaBriefcase />

                    <input
                      type="text"
                      name="position"
                      value={
                        employeeForm.position
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Software Developer"
                      required
                    />

                  </div>

                </div>

                {/* SALARY */}

                <div className="form-group">

                  <label>
                    Salary
                  </label>

                  <div className="input-with-icon">

                    <span className="currency-symbol">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="salary"
                      value={
                        employeeForm.salary
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="50000"
                      min="0"
                    />

                  </div>

                </div>

                {/* JOINING DATE */}

                <div className="form-group">

                  <label>
                    Joining Date
                  </label>

                  <div className="input-with-icon">

                    <FaCalendarCheck />

                    <input
                      type="date"
                      name="joiningDate"
                      value={
                        employeeForm.joiningDate
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      employeeForm.status
                    }
                    onChange={
                      handleFormChange
                    }
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-section-title">

                <FaMapMarkerAlt />

                <span>
                  Address
                </span>

              </div>

              <div className="form-group">

                <textarea
                  name="address"
                  value={
                    employeeForm.address
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter employee address"
                  rows="3"
                />

              </div>

              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowEmployeeModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingEmployee
                  }
                >

                  {savingEmployee ? (

                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>

                  ) : (

                    <>
                      <FaSave />

                      {editingEmployee
                        ? "Update Employee"
                        : "Save Employee"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          DELETE EMPLOYEE MODAL
      ====================================================== */}

      {deleteEmployee && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteEmployee(null);
            }
          }}
        >

          <div className="delete-modal">

            <div className="delete-icon">
              <FaTrash />
            </div>

            <h2>
              Delete Employee?
            </h2>

            <p>

              Are you sure you want to
              delete{" "}

              <strong>
                {getEmployeeName(
                  deleteEmployee
                )}
              </strong>

              ? This action cannot be undone.

            </p>

            <div className="delete-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteEmployee(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={
                  handleDeleteEmployee
                }
                disabled={
                  deletingEmployee
                }
              >

                {deletingEmployee
                  ? "Deleting..."
                  : "Delete Employee"}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;