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
  FaCheckCircle,
  FaDatabase,
  FaServer,
  FaCode,
  FaBars,
} from "react-icons/fa";

import Attendance from "./Attendance/Attendance";

import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // ============================================================
  // STATE
  // ============================================================

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [activePage, setActivePage] = useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  const loadEmployees = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/employees`
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

      setEmployees([]);
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // ============================================================

  const loadDepartments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/departments`
      );

      const departmentData = response.data?.departments;

      if (Array.isArray(departmentData)) {
        setDepartments(departmentData);
      } else if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Department loading error:", error);

      setDepartments([]);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadEmployees(),
        loadDepartments(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ============================================================
  // FORM RESET
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

  // ============================================================
  // OPEN ADD FORM
  // ============================================================

  const openAddForm = () => {
    resetForm();

    setShowForm(true);
  };

  // ============================================================
  // OPEN EDIT FORM
  // ============================================================

  const openEditForm = (employee) => {
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

  // ============================================================
  // INPUT CHANGE
  // ============================================================

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

    try {
      const employeeData = {
        ...form,
        salary: Number(form.salary) || 0,
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/api/employees/${editingId}`,
          employeeData
        );

        alert("Employee updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/employees`,
          employeeData
        );

        alert("Employee added successfully.");
      }

      setShowForm(false);

      resetForm();

      await loadEmployees();
    } catch (error) {
      console.error("Employee save error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to save employee.";

      alert(message);
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

    try {
      await axios.delete(
        `${API_URL}/api/employees/${id}`
      );

      await loadEmployees();

      alert("Employee deleted successfully.");
    } catch (error) {
      console.error("Employee delete error:", error);

      alert("Unable to delete employee.");
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const changePage = (page) => {
    setActivePage(page);

    setSidebarOpen(false);
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
    const firstName =
      employee.firstName || "";

    const lastName =
      employee.lastName || "";

    return `${firstName} ${lastName}`.trim() ||
      "Unnamed Employee";
  };

  // ============================================================
  // EMPLOYEE INITIALS
  // ============================================================

  const getInitials = (employee) => {
    const first =
      employee.firstName?.charAt(0) || "";

    const last =
      employee.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "EM";
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
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

        {/* BRAND */}

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

        {/* ONLINE STATUS */}

        <div className="online-status">

          <span className="online-dot"></span>

          <span>
            System Online
          </span>

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            MAIN MENU
          </div>

          {/* DASHBOARD */}

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

          {/* EMPLOYEES */}

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

          {/* DEPARTMENTS */}

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

          {/* ATTENDANCE */}

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

          {/* LEAVE */}

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

        </div>

      </aside>

      {/* ======================================================
          MAIN AREA
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
            ATTENDANCE
        ==================================================== */}

        {activePage === "Attendance" ? (

          <Attendance />

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
                    : "Leave Requests"}
                </h1>

                <p>
                  {activePage === "Dashboard"
                    ? "Overview of your Human Resource Management System."
                    : activePage === "Employees"
                    ? "Manage employees in your organization."
                    : activePage === "Departments"
                    ? "Manage organization departments."
                    : "Manage employee leave requests."}
                </p>

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

                {/* STAT CARDS */}

                <section className="stats-grid">

                  {/* TOTAL */}

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

                  {/* ACTIVE */}

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

                  {/* DEPARTMENTS */}

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

                  {/* INACTIVE */}

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

                  ) : filteredEmployees.length ===
                    0 ? (

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

                            <th>
                              Employee
                            </th>

                            <th>
                              ID
                            </th>

                            <th>
                              Department
                            </th>

                            <th>
                              Position
                            </th>

                            <th>
                              Contact
                            </th>

                            <th>
                              Salary
                            </th>

                            <th>
                              Status
                            </th>

                            <th>
                              Actions
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredEmployees.map(
                            (employee) => (

                              <tr
                                key={
                                  employee._id
                                }
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

                ) : filteredEmployees.length ===
                  0 ? (

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

                          <th>
                            Employee
                          </th>

                          <th>
                            ID
                          </th>

                          <th>
                            Department
                          </th>

                          <th>
                            Position
                          </th>

                          <th>
                            Contact
                          </th>

                          <th>
                            Salary
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Actions
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredEmployees.map(
                          (employee) => (

                            <tr
                              key={
                                employee._id
                              }
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
                      Organization departments.
                    </p>

                  </div>

                </div>

                <div className="department-grid">

                  {departmentCount === 0 ? (

                    <div className="empty-state">

                      <FaBuilding />

                      <h3>
                        No departments found
                      </h3>

                    </div>

                  ) : (

                    [
                      ...new Set(
                        employees
                          .map(
                            (employee) =>
                              employee.department
                          )
                          .filter(Boolean)
                      ),
                    ].map(
                      (department) => {

                        const count =
                          employees.filter(
                            (employee) =>
                              employee.department ===
                              department
                          ).length;

                        return (
                          <div
                            className="department-card"
                            key={department}
                          >

                            <div className="department-card-icon">
                              <FaBuilding />
                            </div>

                            <div>
                              <h3>
                                {department}
                              </h3>

                              <p>
                                {count}{" "}
                                {count === 1
                                  ? "employee"
                                  : "employees"}
                              </p>
                            </div>

                          </div>
                        );
                      }
                    )

                  )}

                </div>

              </section>

            )}

            {/* =================================================
                LEAVE REQUESTS
            ================================================= */}

            {activePage === "Leave Requests" && (

              <section className="content-card">

                <div className="empty-state">

                  <FaClipboardList />

                  <h3>
                    Leave Requests
                  </h3>

                  <p>
                    Leave management will be available here.
                  </p>

                </div>

              </section>

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

            {/* MODAL HEADER */}

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

            {/* FORM */}

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

                    <option value="IT">
                      IT
                    </option>

                    <option value="HR">
                      HR
                    </option>

                    <option value="Finance">
                      Finance
                    </option>

                    <option value="Marketing">
                      Marketing
                    </option>

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

              {/* FORM BUTTONS */}

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

    </div>
  );
}

export default App;