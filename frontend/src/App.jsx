import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaUserTimes,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTachometerAlt,
  FaUserTie,
  FaCalendarAlt,
  FaClipboardList,
  FaMoneyBillWave,
  FaCheckCircle,
  FaDatabase,
  FaServer,
  FaCode,
  FaBars,
} from "react-icons/fa";

import Attendance from "./Attendance/Attendance";
import Payroll from "./Payroll/Payroll";
import LeaveRequests from "./LeaveRequests/LeaveRequests";

import { API_URL } from "./config";

import "./App.css";

function App() {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [showLogin, setShowLogin] = useState(
    !localStorage.getItem("token")
  );

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // ============================================================
  // EMPLOYEE STATE
  // ============================================================

  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    status: "Active",
    address: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ============================================================
  // DEPARTMENT STATE
  // ============================================================

  const [departments, setDepartments] = useState([]);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const [showDepartmentForm, setShowDepartmentForm] =
    useState(false);

  const [editingDepartmentId, setEditingDepartmentId] =
    useState(null);

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ============================================================
  // AUTH CONFIG
  // ============================================================

  const getAuthConfig = () => {
    const currentToken = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    };
  };

  // ============================================================
  // AUTH ERROR HANDLER
  // ============================================================

  const handleAuthError = (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn("Authentication failed.");

      localStorage.removeItem("token");

      setToken(null);
      setShowLogin(true);

      setEmployees([]);
      setDepartments([]);

      alert(
        "Your session has expired or authentication failed. Please login again."
      );

      return true;
    }

    return false;
  };

  // ============================================================
  // LOGIN FORM CHANGE
  // ============================================================

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        loginForm
      );

      const newToken = response.data?.token;

      if (!newToken) {
        alert("Login failed: token was not received.");
        return;
      }

      localStorage.setItem("token", newToken);

      setToken(newToken);
      setShowLogin(false);

      setLoginForm({
        email: "",
        password: "",
      });

      alert("Login successful.");

      await loadEmployees(newToken);
      await loadDepartments(newToken);
    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to login. Please check your email and password."
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setShowLogin(true);

    setEmployees([]);
    setDepartments([]);

    setActivePage("Dashboard");

    setShowForm(false);
    setShowDepartmentForm(false);

    resetForm();
    resetDepartmentForm();
  };

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  const loadEmployees = async (loginToken = null) => {
    const currentToken =
      loginToken || localStorage.getItem("token");

    if (!currentToken) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/employees`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const employeeData = response.data?.employees;

      if (Array.isArray(employeeData)) {
        setEmployees(employeeData);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Employee loading error:", error);

      if (!handleAuthError(error)) {
        setEmployees([]);
      }
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // ============================================================

  const loadDepartments = async (loginToken = null) => {
    const currentToken =
      loginToken || localStorage.getItem("token");

    if (!currentToken) {
      setDepartments([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/departments`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const departmentData =
        response.data?.departments;

      if (Array.isArray(departmentData)) {
        setDepartments(departmentData);
      } else if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error(
        "Department loading error:",
        error
      );

      if (!handleAuthError(error)) {
        setDepartments([]);
      }
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      const currentToken =
        localStorage.getItem("token");

      if (!currentToken) {
        setLoading(false);
        return;
      }

      setLoading(true);

      await Promise.all([
        loadEmployees(currentToken),
        loadDepartments(currentToken),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ============================================================
  // EMPLOYEE FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      status: "Active",
      address: "",
    });

    setEditingId(null);
  };

  const openAddForm = () => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    resetForm();
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    setForm({
      employeeId: employee.employeeId || "",
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      position: employee.position || "",
      salary: employee.salary || "",
      status: employee.status || "Active",
      address: employee.address || "",
    });

    setEditingId(employee._id);
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD / UPDATE EMPLOYEE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      setShowLogin(true);

      alert(
        "Please login before adding or updating an employee."
      );

      return;
    }

    try {
      const employeeData = {
        ...form,
        salary: Number(form.salary) || 0,
      };

      const authConfig = getAuthConfig();

      if (editingId) {
        await axios.put(
          `${API_URL}/api/employees/${editingId}`,
          employeeData,
          authConfig
        );

        alert("Employee updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/employees`,
          employeeData,
          authConfig
        );

        alert("Employee added successfully.");
      }

      setShowForm(false);

      resetForm();

      await loadEmployees();
      await loadDepartments();
    } catch (error) {
      console.error(
        "Employee save error:",
        error
      );

      if (handleAuthError(error)) {
        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to save employee."
      );
    }
  };

  // ============================================================
  // DELETE EMPLOYEE
  // ============================================================

  const deleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    if (!localStorage.getItem("token")) {
      setShowLogin(true);
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/employees/${id}`,
        getAuthConfig()
      );

      await loadEmployees();
      await loadDepartments();

      alert("Employee deleted successfully.");
    } catch (error) {
      console.error(
        "Employee delete error:",
        error
      );

      if (handleAuthError(error)) {
        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to delete employee."
      );
    }
  };

  // ============================================================
  // DEPARTMENT FORM
  // ============================================================

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: "",
      description: "",
      status: "Active",
    });

    setEditingDepartmentId(null);
  };

  const openAddDepartmentForm = () => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    resetDepartmentForm();
    setShowDepartmentForm(true);
  };

  const openEditDepartmentForm = (department) => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    setDepartmentForm({
      name: department.name || "",
      description: department.description || "",
      status: department.status || "Active",
    });

    setEditingDepartmentId(department._id);

    setShowDepartmentForm(true);
  };

  const handleDepartmentChange = (event) => {
    const { name, value } = event.target;

    setDepartmentForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD / UPDATE DEPARTMENT
  // ============================================================

  const handleDepartmentSubmit = async (event) => {
    event.preventDefault();

    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      setShowLogin(true);

      alert("Please login first.");

      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      };

      if (editingDepartmentId) {
        await axios.put(
          `${API_URL}/api/departments/${editingDepartmentId}`,
          departmentForm,
          config
        );

        alert("Department updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/departments`,
          departmentForm,
          config
        );

        alert("Department added successfully.");
      }

      setShowDepartmentForm(false);

      resetDepartmentForm();

      await loadDepartments();
      await loadEmployees();
    } catch (error) {
      console.error(
        "Department save error:",
        error
      );

      if (handleAuthError(error)) {
        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to save department."
      );
    }
  };

  // ============================================================
  // DELETE DEPARTMENT
  // ============================================================

  const deleteDepartment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) {
      return;
    }

    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      setShowLogin(true);

      alert("Please login first.");

      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/departments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      await loadDepartments();
      await loadEmployees();

      alert("Department deleted successfully.");
    } catch (error) {
      console.error(
        "Department delete error:",
        error
      );

      if (handleAuthError(error)) {
        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to delete department."
      );
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const changePage = (page) => {
    setActivePage(page);

    setSidebarOpen(false);

    setSearch("");
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredEmployees = employees.filter(
    (employee) => {
      const searchText = `
        ${employee.firstName || ""}
        ${employee.lastName || ""}
        ${employee.employeeId || ""}
        ${employee.email || ""}
        ${employee.department || ""}
        ${employee.position || ""}
        ${employee.phone || ""}
      `.toLowerCase();

      return searchText.includes(
        search.toLowerCase()
      );
    }
  );

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) =>
      String(employee.status).toLowerCase() ===
      "active"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) =>
      String(employee.status).toLowerCase() ===
      "inactive"
  ).length;

  const departmentNames = employees
    .map((employee) => employee.department)
    .filter(Boolean);

  const departmentCount = new Set(
    departmentNames
  ).size;

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  const getEmployeeName = (employee) => {
    const firstName = employee.firstName || "";
    const lastName = employee.lastName || "";

    return (
      `${firstName} ${lastName}`.trim() ||
      "Unnamed Employee"
    );
  };

  // ============================================================
  // EMPLOYEE INITIALS
  // ============================================================

  const getInitials = (employee) => {
    const first =
      employee.firstName?.charAt(0) || "";

    const last =
      employee.lastName?.charAt(0) || "";

    const initials =
      `${first}${last}`.toUpperCase();

    return initials || "EM";
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          LOGIN MODAL
      ====================================================== */}

      {showLogin && (
        <div className="modal-overlay">
          <div
            className="employee-modal login-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Administrator Login</h2>

                <p>
                  Login to manage employees and HR data.
                </p>
              </div>

              {token && (
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() =>
                    setShowLogin(false)
                  }
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <form
              className="employee-form"
              onSubmit={handleLogin}
            >
              <div className="form-group">
                <label>Email *</label>

                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>

                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="form-actions">
                {token && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() =>
                      setShowLogin(false)
                    }
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="save-button"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">
            <FaUserTie />
          </div>

          <div className="brand-text">
            <h2>HR Management</h2>

            <span>
              Organization Dashboard
            </span>
          </div>
        </div>

        <div className="online-status">
          <span className="online-dot"></span>

          <span>
            System Online
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            MAIN MENU
          </div>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Dashboard")
            }
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Employees"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Employees")
            }
          >
            <FaUsers />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Departments"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Departments")
            }
          >
            <FaBuilding />
            <span>Departments</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Attendance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Attendance")
            }
          >
            <FaCalendarAlt />
            <span>Attendance</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Leave Requests"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Leave Requests")
            }
          >
            <FaClipboardList />
            <span>Leave Requests</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "Payroll"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("Payroll")
            }
          >
            <FaMoneyBillWave />
            <span>Payroll</span>
          </button>
        </nav>

        {/* SIDEBAR USER */}

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            HR
          </div>

          <div className="sidebar-user-info">
            <strong>
              HR Administrator
            </strong>

            <span>
              Administrator
            </span>
          </div>

          {token && (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-content">

        {/* MOBILE TOPBAR */}

        <div className="mobile-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <FaBars />
          </button>

          <strong>
            HR Management
          </strong>
        </div>

        {/* ====================================================
            ATTENDANCE / PAYROLL
        ==================================================== */}

        {activePage === "Attendance" ? (
          <Attendance />
        ) : activePage === "Payroll" ? (
          <Payroll />
        ) : (
          <>
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <header className="page-header">
              <div className="page-header-text">
                <h1>
                  {activePage === "Dashboard"
                    ? "HR Dashboard"
                    : activePage === "Employees"
                    ? "Employees"
                    : activePage === "Departments"
                    ? "Departments"
                    : activePage === "Leave Requests"
                    ? "Leave Requests"
                    : "HR Management"}
                </h1>
              </div>

              {(activePage === "Dashboard" ||
                activePage === "Employees") && (
                <button
                  type="button"
                  className="add-button"
                  onClick={openAddForm}
                >
                  <FaPlus />

                  <span>
                    Add Employee
                  </span>
                </button>
              )}
            </header>

            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activePage === "Dashboard" && (
              <>
                <section className="stats-grid">

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
                        All registered employees
                      </small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon green">
                      <FaUserCheck />
                    </div>

                    <div className="stat-content">
                      <span>
                        Active Employees
                      </span>

                      <strong>
                        {activeEmployees}
                      </strong>

                      <small>
                        Currently working
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
                        {departmentCount}
                      </strong>

                      <small>
                        Unique departments
                      </small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon red">
                      <FaUserTimes />
                    </div>

                    <div className="stat-content">
                      <span>
                        Inactive
                      </span>

                      <strong>
                        {inactiveEmployees}
                      </strong>

                      <small>
                        Inactive employees
                      </small>
                    </div>
                  </div>

                </section>

                {/* EMPLOYEE TABLE */}

                <section className="content-card">
                  <div className="section-header">
                    <div>
                      <h2>
                        Recent Employees
                      </h2>

                      <p>
                        Latest employees added to the system.
                      </p>
                    </div>

                    <div className="search-box">
                      <FaSearch />

                      <input
                        type="text"
                        value={search}
                        placeholder="Search employees..."
                        onChange={(event) =>
                          setSearch(
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading-state">
                      Loading employees...
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="empty-state">
                      <FaUsers />

                      <h3>
                        No employees found
                      </h3>

                      <p>
                        Add an employee to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="employee-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>ID</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Contact</th>
                            <th>Salary</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredEmployees.map(
                            (employee) => (
                              <tr
                                key={employee._id}
                              >
                                <td>
                                  <div className="employee-cell">
                                    <div className="employee-avatar">
                                      {getInitials(
                                        employee
                                      )}
                                    </div>

                                    <div className="employee-info">
                                      <strong>
                                        {getEmployeeName(
                                          employee
                                        )}
                                      </strong>

                                      <span>
                                        {employee.email ||
                                          "No email"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  {employee.employeeId ||
                                    "—"}
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
                                  ₹
                                  {Number(
                                    employee.salary || 0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </td>

                                <td>
                                  <span
                                    className={`status-badge ${
                                      String(
                                        employee.status
                                      ).toLowerCase() ===
                                      "active"
                                        ? "status-active"
                                        : "status-inactive"
                                    }`}
                                  >
                                    {employee.status ||
                                      "Unknown"}
                                  </span>
                                </td>

                                <td>
                                  <div className="action-buttons">
                                    <button
                                      type="button"
                                      className="edit-button"
                                      title="Edit employee"
                                      onClick={() =>
                                        openEditForm(
                                          employee
                                        )
                                      }
                                    >
                                      <FaEdit />
                                    </button>

                                    <button
                                      type="button"
                                      className="delete-button"
                                      title="Delete employee"
                                      onClick={() =>
                                        deleteEmployee(
                                          employee._id
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
                </section>

                {/* SYSTEM STATUS */}

                <section className="system-card">
                  <div className="system-header">
                    <div>
                      <h2>
                        System Status
                      </h2>

                      <p>
                        Current system connection status.
                      </p>
                    </div>

                    <span className="connected-status">
                      <FaCheckCircle />
                      Connected
                    </span>
                  </div>

                  <div className="system-grid">

                    <div className="system-item">
                      <div className="system-icon">
                        <FaCode />
                      </div>

                      <div className="system-info">
                        <strong>
                          Frontend
                        </strong>

                        <span>
                          http://localhost:5173
                        </span>
                      </div>

                      <b>
                        Running
                      </b>
                    </div>

                    <div className="system-item">
                      <div className="system-icon">
                        <FaServer />
                      </div>

                      <div className="system-info">
                        <strong>
                          Backend
                        </strong>

                        <span>
                          http://localhost:5000
                        </span>
                      </div>

                      <b>
                        Connected
                      </b>
                    </div>

                    <div className="system-item">
                      <div className="system-icon">
                        <FaDatabase />
                      </div>

                      <div className="system-info">
                        <strong>
                          Database
                        </strong>

                        <span>
                          MongoDB Atlas
                        </span>
                      </div>

                      <b>
                        Connected
                      </b>
                    </div>

                  </div>
                </section>
              </>
            )}

            {/* =================================================
                EMPLOYEES PAGE
            ================================================= */}

            {activePage === "Employees" && (
              <section className="content-card">

                <div className="section-header">
                  <div>
                    <h2>
                      Employee Management
                    </h2>

                    <p>
                      Manage all registered employees.
                    </p>
                  </div>

                  <div className="search-box">
                    <FaSearch />

                    <input
                      type="text"
                      value={search}
                      placeholder="Search employees..."
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    Loading employees...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="empty-state">
                    <FaUsers />

                    <h3>
                      No employees found
                    </h3>

                    <p>
                      Add an employee to get started.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="employee-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>ID</th>
                          <th>Department</th>
                          <th>Position</th>
                          <th>Contact</th>
                          <th>Salary</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredEmployees.map(
                          (employee) => (
                            <tr
                              key={employee._id}
                            >
                              <td>
                                <div className="employee-cell">
                                  <div className="employee-avatar">
                                    {getInitials(
                                      employee
                                    )}
                                  </div>

                                  <div className="employee-info">
                                    <strong>
                                      {getEmployeeName(
                                        employee
                                      )}
                                    </strong>

                                    <span>
                                      {employee.email ||
                                        "No email"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                {employee.employeeId ||
                                  "—"}
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
                                ₹
                                {Number(
                                  employee.salary || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td>
                                <span
                                  className={`status-badge ${
                                    String(
                                      employee.status
                                    ).toLowerCase() ===
                                    "active"
                                      ? "status-active"
                                      : "status-inactive"
                                  }`}
                                >
                                  {employee.status ||
                                    "Unknown"}
                                </span>
                              </td>

                              <td>
                                <div className="action-buttons">
                                  <button
                                    type="button"
                                    className="edit-button"
                                    title="Edit employee"
                                    onClick={() =>
                                      openEditForm(
                                        employee
                                      )
                                    }
                                  >
                                    <FaEdit />
                                  </button>

                                  <button
                                    type="button"
                                    className="delete-button"
                                    title="Delete employee"
                                    onClick={() =>
                                      deleteEmployee(
                                        employee._id
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
              </section>
            )}

            {/* =================================================
                DEPARTMENTS PAGE
            ================================================= */}

            {activePage === "Departments" && (
              <section className="content-card">

                <div className="section-header">
                  <div>
                    <h2>
                      Departments
                    </h2>

                    <p>
                      Manage organization departments.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="add-button"
                    onClick={
                      openAddDepartmentForm
                    }
                  >
                    <FaPlus />

                    <span>
                      Add Department
                    </span>
                  </button>
                </div>

                <div className="department-grid">

                  {departments.length === 0 ? (
                    <div className="empty-state">
                      <FaBuilding />

                      <h3>
                        No departments found
                      </h3>

                      <p>
                        Add a department to get started.
                      </p>
                    </div>
                  ) : (
                    departments.map(
                      (department) => (
                        <div
                          className="department-card"
                          key={department._id}
                        >
                          <div className="department-card-icon">
                            <FaBuilding />
                          </div>

                          <div className="department-card-content">
                            <h3>
                              {department.name}
                            </h3>

                            <p>
                              {department.description ||
                                "No description"}
                            </p>

                            <strong>
                              {department.employeeCount ||
                                0}{" "}
                              {department.employeeCount ===
                              1
                                ? "employee"
                                : "employees"}
                            </strong>

                            <span
                              className={
                                department.status ===
                                "Active"
                                  ? "status-badge status-active"
                                  : "status-badge status-inactive"
                              }
                            >
                              {department.status ||
                                "Unknown"}
                            </span>
                          </div>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="edit-button"
                              title="Edit department"
                              onClick={() =>
                                openEditDepartmentForm(
                                  department
                                )
                              }
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              title="Delete department"
                              onClick={() =>
                                deleteDepartment(
                                  department._id
                                )
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>
                        </div>
                      )
                    )
                  )}

                </div>
              </section>
            )}

            {/* =================================================
                LEAVE REQUESTS
            ================================================= */}

            {activePage === "Leave Requests" && (
              <LeaveRequests
                employees={employees}
                token={token}
              />
            )}
          </>
        )}
      </main>

      {/* ======================================================
          ADD / EDIT EMPLOYEE MODAL
      ====================================================== */}

      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div
            className="employee-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingId
                    ? "Update employee information."
                    : "Enter employee information."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Employee ID *
                  </label>

                  <input
                    type="text"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="EMP001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    First Name *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Last Name *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Department *
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={
                            department._id ||
                            department.name
                          }
                          value={
                            department.name
                          }
                        >
                          {department.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Position *
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Software Developer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Salary
                  </label>

                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="50000"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Employee address"
                    rows="3"
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingId
                    ? "Update Employee"
                    : "Save Employee"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          ADD / EDIT DEPARTMENT MODAL
      ====================================================== */}

      {showDepartmentForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDepartmentForm(false);
            resetDepartmentForm();
          }}
        >
          <div
            className="employee-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  {editingDepartmentId
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  {editingDepartmentId
                    ? "Update department information."
                    : "Enter department information."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => {
                  setShowDepartmentForm(false);
                  resetDepartmentForm();
                }}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="employee-form"
              onSubmit={handleDepartmentSubmit}
            >

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Department Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={departmentForm.name}
                    onChange={
                      handleDepartmentChange
                    }
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={departmentForm.status}
                    onChange={
                      handleDepartmentChange
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      departmentForm.description
                    }
                    onChange={
                      handleDepartmentChange
                    }
                    placeholder="Enter department description"
                    rows="4"
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowDepartmentForm(false);
                    resetDepartmentForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingDepartmentId
                    ? "Update Department"
                    : "Save Department"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;