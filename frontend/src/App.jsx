import React, { useEffect, useMemo, useState } from "react";
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
  FaServer,
  FaDatabase,
  FaCode,
  FaBars,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaHistory,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaCalendarCheck,
  FaArrowRight,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

import Login from "./Login/Login";
import Attendance from "./Attendance/Attendance";
import LeaveRequests from "./LeaveRequests/LeaveRequests";
import Payroll from "./Payroll/Payroll";

import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  /* ============================================================
     AUTH
  ============================================================ */

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [showEmployeeAuth, setShowEmployeeAuth] =
    useState(false);

  const normalizedRole = String(user?.role || "")
    .toLowerCase()
    .trim();

  const isAdmin = normalizedRole === "admin";
  const isEmployee = normalizedRole === "employee";

  /* ============================================================
     ADMIN STATE
  ============================================================ */

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  /* ============================================================
     EMPLOYEE FORM
  ============================================================ */

  const initialEmployeeForm = {
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    status: "active",
    address: "",
  };

  const [form, setForm] =
    useState(initialEmployeeForm);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  /* ============================================================
     DEPARTMENT FORM
  ============================================================ */

  const [departmentForm, setDepartmentForm] =
    useState({
      name: "",
      description: "",
      status: "Active",
    });

  const [
    showDepartmentForm,
    setShowDepartmentForm,
  ] = useState(false);

  const [
    editingDepartmentId,
    setEditingDepartmentId,
  ] = useState(null);

  /* ============================================================
     EMPLOYEE ATTENDANCE
  ============================================================ */

  const [attendanceHistory, setAttendanceHistory] =
    useState([]);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [attendanceLoading, setAttendanceLoading] =
    useState(false);

  const [
    attendanceActionLoading,
    setAttendanceActionLoading,
  ] = useState(false);

  /* ============================================================
     AUTH CONFIG
  ============================================================ */

  const authConfig = useMemo(() => {
    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getEmployeeName = (employee) => {
    const fullName =
      `${employee?.firstName || ""} ${
        employee?.lastName || ""
      }`.trim();

    return (
      fullName ||
      employee?.name ||
      "Employee"
    );
  };

  const getInitials = (employee) => {
    const first =
      employee?.firstName?.charAt(0) || "";

    const last =
      employee?.lastName?.charAt(0) || "";

    return (
      `${first}${last}`.toUpperCase() ||
      "EM"
    );
  };

  const formatTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const decodeTokenPayload = (jwtToken) => {
    try {
      if (!jwtToken) return null;

      const parts = jwtToken.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];

      const decoded = JSON.parse(
        atob(
          payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return decoded;
    } catch (error) {
      console.error(
        "Token decode error:",
        error
      );

      return null;
    }
  };

  /* ============================================================
     ADMIN LOGIN
  ============================================================ */

  const handleLoginChange = (event) => {
    setLoginForm((previous) => ({
      ...previous,
      [event.target.name]:
        event.target.value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        loginForm
      );

      const receivedToken =
        response.data?.token ||
        response.data?.data?.token;

      if (!receivedToken) {
        throw new Error(
          "Authentication token not received."
        );
      }

      const tokenPayload =
        decodeTokenPayload(receivedToken);

      const receivedUser =
        response.data?.user ||
        response.data?.employee ||
        response.data?.data?.user ||
        response.data?.data?.employee ||
        tokenPayload ||
        {};

      const normalizedUser = {
        ...receivedUser,
        role:
          receivedUser?.role ||
          tokenPayload?.role ||
          "admin",
      };

      const role = String(
        normalizedUser.role || ""
      )
        .toLowerCase()
        .trim();

      if (role !== "admin") {
        alert(
          "This login is not an administrator account."
        );

        return;
      }

      localStorage.setItem(
        "token",
        receivedToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(normalizedUser)
      );

      localStorage.setItem(
        "adminToken",
        receivedToken
      );

      localStorage.setItem(
        "adminUser",
        JSON.stringify(normalizedUser)
      );

      localStorage.removeItem(
        "employeeToken"
      );

      localStorage.removeItem(
        "employeeUser"
      );

      setToken(receivedToken);
      setUser(normalizedUser);

      setShowEmployeeAuth(false);
      setActivePage("Dashboard");
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    }
  };

  /* ============================================================
     EMPLOYEE LOGIN
  ============================================================ */

  const handleEmployeeLogin = async (
    receivedToken,
    receivedUser
  ) => {
    try {
      if (!receivedToken) {
        alert(
          "Employee login failed. Authentication token was not received."
        );
        return;
      }

      const tokenPayload =
        decodeTokenPayload(receivedToken);

      /* ========================================================
         GET THE LOGGED-IN EMPLOYEE FROM THE BACKEND

         We do not trust an employee ID supplied by the frontend.
         The backend uses the employee ID stored in the JWT and
         returns only that employee.
      ======================================================== */

      const meResponse = await axios.get(
        `${API_URL}/api/employees/me`,
        {
          headers: {
            Authorization: `Bearer ${receivedToken}`,
          },
        }
      );

      const backendEmployee =
        meResponse.data?.employee ||
        meResponse.data?.user ||
        meResponse.data?.data ||
        null;

      if (!backendEmployee) {
        throw new Error(
          "Logged-in employee information was not received."
        );
      }

      const employeeUser = {
        ...backendEmployee,
        role:
          backendEmployee?.role ||
          tokenPayload?.role ||
          receivedUser?.role ||
          "employee",
        employeeId:
          backendEmployee?.employeeId ||
          tokenPayload?.employeeId ||
          receivedUser?.employeeId ||
          "",
        email:
          backendEmployee?.email ||
          tokenPayload?.email ||
          receivedUser?.email ||
          "",
      };

      const role = String(
        employeeUser.role || ""
      )
        .toLowerCase()
        .trim();

      if (role !== "employee") {
        alert(
          "This account is not registered as an employee."
        );
        return;
      }

      /* ========================================================
         SAVE ONLY EMPLOYEE SESSION
      ======================================================== */

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      localStorage.setItem(
        "token",
        receivedToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(employeeUser)
      );

      localStorage.setItem(
        "employeeToken",
        receivedToken
      );

      localStorage.setItem(
        "employeeUser",
        JSON.stringify(employeeUser)
      );

      setToken(receivedToken);
      setUser(employeeUser);
      setShowEmployeeAuth(false);
      setActivePage("Dashboard");

      await loadEmployeeAttendance(
        receivedToken
      );
    } catch (error) {
      console.error(
        "Employee login processing error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Employee login failed."
      );
    }
  };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem(
      "employeeToken"
    );

    localStorage.removeItem(
      "employeeUser"
    );

    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUser"
    );

    setToken("");
    setUser(null);

    setShowEmployeeAuth(false);

    setEmployees([]);
    setDepartments([]);

    setAttendanceHistory([]);
    setTodayAttendance(null);

    setActivePage("Dashboard");
  };

  /* ============================================================
     LOAD EMPLOYEES
  ============================================================ */

  const loadEmployees = async () => {
    if (!token || !isAdmin) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/employees`,
        authConfig
      );

      const data =
        response.data?.employees ||
        response.data?.data ||
        response.data ||
        [];

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Employee loading error:",
        error
      );

      if (
        [401, 403].includes(
          error.response?.status
        )
      ) {
        console.error(
          "Admin authorization failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     LOAD DEPARTMENTS
  ============================================================ */

  const loadDepartments = async () => {
    if (!token || !isAdmin) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/departments`,
        authConfig
      );

      const data =
        response.data?.departments ||
        response.data?.data ||
        response.data ||
        [];

      setDepartments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Department loading error:",
        error
      );
    }
  };

  /* ============================================================
     LOAD EMPLOYEE ATTENDANCE
     
     IMPORTANT:
     Today's attendance now uses:
     
     GET /api/attendance/today
     
     with:
     
     Authorization: Bearer EMPLOYEE_TOKEN
     ============================================================ */

  const loadEmployeeAttendance = async (
    suppliedToken = null
  ) => {
    const currentToken =
      suppliedToken || token;

    if (!currentToken) {
      console.warn(
        "No employee token available for attendance."
      );

      return;
    }

    setAttendanceLoading(true);

    try {
      /* ========================================================
         GET TODAY'S ATTENDANCE
      ======================================================== */

      console.log(
        "Loading today's attendance..."
      );

      console.log(
        "Attendance URL:",
        `${API_URL}/api/attendance/today`
      );

      const todayResponse =
        await axios.get(
          `${API_URL}/api/attendance/today`,
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,
            },
          }
        );

      console.log(
        "Today's attendance response:",
        todayResponse.data
      );

      /*
       * Support different backend response structures.
       */

      const todayData =
        todayResponse.data?.attendance ||
        todayResponse.data?.record ||
        todayResponse.data?.data ||
        todayResponse.data ||
        null;

      /*
       * If backend returns an array,
       * use the first record.
       */

      const todayRecord =
        Array.isArray(todayData)
          ? todayData[0] || null
          : todayData;

      setTodayAttendance(
        todayRecord
      );

      /* ========================================================
         LOAD ATTENDANCE HISTORY
      ======================================================== */

      try {
        console.log(
          "Loading attendance history..."
        );

        const historyResponse =
          await axios.get(
            `${API_URL}/api/attendance/my`,
            {
              headers: {
                Authorization:
                  `Bearer ${currentToken}`,
              },
            }
          );

        console.log(
          "Attendance history response:",
          historyResponse.data
        );

        const historyData =
          historyResponse.data?.attendance ||
          historyResponse.data?.records ||
          historyResponse.data?.data ||
          historyResponse.data ||
          [];

        const records =
          Array.isArray(historyData)
            ? historyData
            : [];

        setAttendanceHistory(
          records
        );
      } catch (historyError) {
        console.warn(
          "Attendance history endpoint could not be loaded:",
          historyError.response?.status,
          historyError.response?.data
        );

        /*
         * If history endpoint does not exist,
         * still show today's attendance.
         */

        setAttendanceHistory(
          todayRecord
            ? [todayRecord]
            : []
        );
      }
    } catch (error) {
      console.error(
        "Employee attendance loading error:",
        error
      );

      console.error(
        "Attendance API status:",
        error.response?.status
      );

      console.error(
        "Attendance API response:",
        error.response?.data
      );

      setAttendanceHistory([]);
      setTodayAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  /* ============================================================
     CHECK IN
  ============================================================ */

  const handleEmployeeCheckIn =
    async () => {
      if (
        !token ||
        attendanceActionLoading
      ) {
        return;
      }

      setAttendanceActionLoading(
        true
      );

      try {
        console.log(
          "Checking in employee..."
        );

        const response =
          await axios.post(
            `${API_URL}/api/attendance/check-in`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "Check-in response:",
          response.data
        );

        await loadEmployeeAttendance(
          token
        );

        alert(
          "Attendance checked in successfully."
        );
      } catch (error) {
        console.error(
          "Check-in error:",
          error
        );

        console.error(
          "Check-in response:",
          error.response?.data
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to check in."
        );
      } finally {
        setAttendanceActionLoading(
          false
        );
      }
    };

  /* ============================================================
     CHECK OUT
  ============================================================ */

  const handleEmployeeCheckOut =
    async () => {
      if (
        !token ||
        attendanceActionLoading
      ) {
        return;
      }

      setAttendanceActionLoading(
        true
      );

      try {
        console.log(
          "Checking out employee..."
        );

        const response =
          await axios.post(
            `${API_URL}/api/attendance/check-out`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        console.log(
          "Check-out response:",
          response.data
        );

        await loadEmployeeAttendance(
          token
        );

        alert(
          "Attendance checked out successfully."
        );
      } catch (error) {
        console.error(
          "Check-out error:",
          error
        );

        console.error(
          "Check-out response:",
          error.response?.data
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to check out."
        );
      } finally {
        setAttendanceActionLoading(
          false
        );
      }
    };

  /* ============================================================
     ATTENDANCE CALCULATIONS
  ============================================================ */

  const hasCheckedIn = Boolean(
    todayAttendance?.loginTime
  );

  const hasCheckedOut = Boolean(
    todayAttendance?.logoutTime
  );

  const getWorkingHours = () => {
    if (!todayAttendance) {
      return "0.00 hrs";
    }

    if (
      todayAttendance.workingHours !==
        undefined &&
      todayAttendance.workingHours !==
        null
    ) {
      return `${Number(
        todayAttendance.workingHours
      ).toFixed(2)} hrs`;
    }

    if (
      todayAttendance.loginTime &&
      !todayAttendance.logoutTime
    ) {
      const start =
        new Date(
          todayAttendance.loginTime
        ).getTime();

      const hours =
        Math.max(
          0,
          Date.now() - start
        ) /
        (1000 * 60 * 60);

      return `${hours.toFixed(2)} hrs`;
    }

    return "0.00 hrs";
  };

  const attendanceStatus =
    todayAttendance?.status ||
    (hasCheckedOut
      ? "Present"
      : hasCheckedIn
      ? "In Progress"
      : "Not Marked");

  /* ============================================================
     EMPLOYEE CRUD
  ============================================================ */

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]:
        event.target.value,
    }));
  };

  const resetForm = () => {
    setForm(initialEmployeeForm);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (
    employee
  ) => {
    setEditingId(employee._id);

    setForm({
      employeeId:
        employee.employeeId || "",

      firstName:
        employee.firstName || "",

      lastName:
        employee.lastName || "",

      email:
        employee.email || "",

      phone:
        employee.phone || "",

      department:
        employee.department || "",

      position:
        employee.position || "",

      salary:
        employee.salary || "",

      status:
        employee.status || "Active",

      address:
        employee.address || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/employees/${editingId}`,
          form,
          authConfig
        );

        alert(
          "Employee updated successfully."
        );
      } else {
        await axios.post(
          `${API_URL}/api/employees`,
          form,
          authConfig
        );

        alert(
          "Employee created successfully."
        );
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

      alert(
        error.response?.data?.message ||
          "Unable to save employee."
      );
    }
  };

  const deleteEmployee =
    async (id) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this employee?"
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `${API_URL}/api/employees/${id}`,
          authConfig
        );

        await loadEmployees();

        alert(
          "Employee deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete employee error:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Unable to delete employee."
        );
      }
    };

  /* ============================================================
     DEPARTMENT CRUD
  ============================================================ */

  const handleDepartmentChange =
    (event) => {
      setDepartmentForm(
        (previous) => ({
          ...previous,
          [event.target.name]:
            event.target.value,
        })
      );
    };

  const resetDepartmentForm =
    () => {
      setDepartmentForm({
        name: "",
        description: "",
        status: "active",
      });

      setEditingDepartmentId(
        null
      );
    };

  const openAddDepartmentForm =
    () => {
      resetDepartmentForm();
      setShowDepartmentForm(true);
    };

  const openEditDepartmentForm =
    (department) => {
      setEditingDepartmentId(
        department._id
      );

      setDepartmentForm({
        name:
          department.name || "",

        description:
          department.description ||
          "",

        status:
          department.status ||
          "Active",
      });

      setShowDepartmentForm(
        true
      );
    };

  const handleDepartmentSubmit =
    async (event) => {
      event.preventDefault();

      try {
        if (
          editingDepartmentId
        ) {
          await axios.put(
            `${API_URL}/api/departments/${editingDepartmentId}`,
            departmentForm,
            authConfig
          );

          alert(
            "Department updated successfully."
          );
        } else {
          await axios.post(
            `${API_URL}/api/departments`,
            departmentForm,
            authConfig
          );

          alert(
            "Department created successfully."
          );
        }

        setShowDepartmentForm(
          false
        );

        resetDepartmentForm();

        await loadDepartments();
        await loadEmployees();
      } catch (error) {
        console.error(
          "Department save error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to save department."
        );
      }
    };

  const deleteDepartment =
    async (id) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this department?"
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `${API_URL}/api/departments/${id}`,
          authConfig
        );

        await loadDepartments();

        alert(
          "Department deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete department error:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Unable to delete department."
        );
      }
    };

  /* ============================================================
     PAGE
  ============================================================ */

  const changePage = (
    page
  ) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  /* ============================================================
     LOAD AFTER LOGIN
  ============================================================ */

  useEffect(() => {
    if (!token) return;

    if (isAdmin) {
      loadEmployees();
      loadDepartments();
    }

    if (isEmployee) {
      loadEmployeeAttendance(token);
    }
  }, [
    token,
    isAdmin,
    isEmployee,
  ]);

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredEmployees =
    employees.filter(
      (employee) => {
        const query =
          search
            .toLowerCase()
            .trim();

        if (!query) {
          return true;
        }

        return (
          getEmployeeName(
            employee
          )
            .toLowerCase()
            .includes(query) ||

          String(
            employee.employeeId ||
              ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            employee.email || ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            employee.department ||
              ""
          )
            .toLowerCase()
            .includes(query) ||

          String(
            employee.position ||
              ""
          )
            .toLowerCase()
            .includes(query)
        );
      }
    );

  /* ============================================================
     ADMIN STATS
  ============================================================ */

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        String(
          employee.status || ""
        )
          .toLowerCase() ===
        "active"
    ).length;

  const inactiveEmployees =
    totalEmployees -
    activeEmployees;

  const departmentCount =
    departments.length;

  /* ============================================================
     EMPLOYEE DASHBOARD
  ============================================================ */

  if (isEmployee && token) {
    const employeeName =
      getEmployeeName(user);

    return (
      <EmployeeDashboard
        user={user}
        employeeName={employeeName}
        token={token}
        attendanceHistory={
          attendanceHistory
        }
        todayAttendance={
          todayAttendance
        }
        attendanceLoading={
          attendanceLoading
        }
        attendanceActionLoading={
          attendanceActionLoading
        }
        hasCheckedIn={
          hasCheckedIn
        }
        hasCheckedOut={
          hasCheckedOut
        }
        attendanceStatus={
          attendanceStatus
        }
        getWorkingHours={
          getWorkingHours
        }
        formatTime={
          formatTime
        }
        formatDate={
          formatDate
        }
        getInitials={
          getInitials
        }
        handleEmployeeCheckIn={
          handleEmployeeCheckIn
        }
        handleEmployeeCheckOut={
          handleEmployeeCheckOut
        }
        loadEmployeeAttendance={
          loadEmployeeAttendance
        }
        handleLogout={
          handleLogout
        }
      />
    );
  }

  /* ============================================================
     EMPLOYEE LOGIN
  ============================================================ */

  if (
    !token &&
    showEmployeeAuth
  ) {
    return (
      <Login
        apiUrl={API_URL}
        onLoginSuccess={
          handleEmployeeLogin
        }
        onBack={() => {
          setShowEmployeeAuth(
            false
          );
        }}
      />
    );
  }

  /* ============================================================
     ADMIN LOGIN
  ============================================================ */

  if (
    !token ||
    !isAdmin
  ) {
    return (
      <AdminLogin
        loginForm={loginForm}
        showPassword={
          showPassword
        }
        handleLoginChange={
          handleLoginChange
        }
        handleLogin={
          handleLogin
        }
        setShowPassword={
          setShowPassword
        }
        onEmployeeLogin={() => {
          setShowEmployeeAuth(
            true
          );
        }}
      />
    );
  }

  /* ============================================================
     ADMIN APPLICATION
  ============================================================ */

  return (
    <div className="app">

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            <FaUserTie />
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

        <div className="online-status">
          <span className="online-dot" />
          <span>
            System Online
          </span>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            MAIN MENU
          </div>

          {[
            [
              "Dashboard",
              FaTachometerAlt,
            ],
            [
              "Employees",
              FaUsers,
            ],
            [
              "Departments",
              FaBuilding,
            ],
            [
              "Attendance",
              FaCalendarAlt,
            ],
            [
              "Leave Requests",
              FaClipboardList,
            ],
            [
              "Payroll",
              FaMoneyBillWave,
            ],
          ].map(
            ([page, Icon]) => (
              <button
                key={page}
                type="button"
                className={`nav-item ${
                  activePage === page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  changePage(page)
                }
              >
                <Icon />
                <span>
                  {page}
                </span>
              </button>
            )
          )}

        </nav>

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

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="sidebar-logout"
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        <div className="mobile-topbar">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(
                true
              )
            }
          >
            <FaBars />
          </button>

          <strong>
            HR Management
          </strong>

        </div>

        <header className="page-header">

          <div>
            <h1>
              {activePage ===
              "Dashboard"
                ? "HR Dashboard"
                : activePage}
            </h1>
          </div>

          {(
            activePage ===
              "Dashboard" ||
            activePage ===
              "Employees"
          ) && (
            <button
              type="button"
              className="add-button"
              onClick={
                openAddForm
              }
            >
              <FaPlus />
              Add Employee
            </button>
          )}

        </header>

        {activePage ===
        "Attendance" ? (
          <Attendance />
        ) : activePage ===
          "Payroll" ? (
          <Payroll />
        ) : (
          <>

            {activePage ===
              "Dashboard" && (
              <>

                <section className="stats-grid">

                  <StatCard
                    icon={
                      <FaUsers />
                    }
                    title="Total Employees"
                    value={
                      totalEmployees
                    }
                    text="All registered employees"
                    color="blue"
                  />

                  <StatCard
                    icon={
                      <FaUserCheck />
                    }
                    title="Active Employees"
                    value={
                      activeEmployees
                    }
                    text="Currently active"
                    color="green"
                  />

                  <StatCard
                    icon={
                      <FaBuilding />
                    }
                    title="Departments"
                    value={
                      departmentCount
                    }
                    text="Organization departments"
                    color="purple"
                  />

                  <StatCard
                    icon={
                      <FaUserTimes />
                    }
                    title="Inactive"
                    value={
                      inactiveEmployees
                    }
                    text="Inactive employees"
                    color="red"
                  />

                </section>

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
                        value={
                          search
                        }
                        placeholder="Search employees..."
                        onChange={(
                          event
                        ) =>
                          setSearch(
                            event
                              .target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>

                  {loading ? (
                    <div className="loading-state">
                      Loading employees...
                    </div>
                  ) : (
                    <EmployeeTable
                      employees={
                        filteredEmployees
                      }
                      getInitials={
                        getInitials
                      }
                      getEmployeeName={
                        getEmployeeName
                      }
                      openEditForm={
                        openEditForm
                      }
                      deleteEmployee={
                        deleteEmployee
                      }
                    />
                  )}

                </section>

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

                    <SystemItem
                      icon={
                        <FaCode />
                      }
                      title="Frontend"
                      value="Vite / React"
                    />

                    <SystemItem
                      icon={
                        <FaServer />
                      }
                      title="Backend"
                      value={
                        API_URL
                      }
                    />

                    <SystemItem
                      icon={
                        <FaDatabase />
                      }
                      title="Database"
                      value="MongoDB Atlas"
                    />

                  </div>

                </section>

              </>
            )}

            {activePage ===
              "Employees" && (
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
                      value={
                        search
                      }
                      placeholder="Search employees..."
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event
                            .target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

                {loading ? (
                  <div className="loading-state">
                    Loading employees...
                  </div>
                ) : (
                  <EmployeeTable
                    employees={
                      filteredEmployees
                    }
                    getInitials={
                      getInitials
                    }
                    getEmployeeName={
                      getEmployeeName
                    }
                    openEditForm={
                      openEditForm
                    }
                    deleteEmployee={
                      deleteEmployee
                    }
                  />
                )}

              </section>
            )}

            {activePage ===
              "Departments" && (
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
                    Add Department
                  </button>

                </div>

                <div className="department-grid">

                  {departments.length ===
                  0 ? (
                    <div className="empty-state">

                      <FaBuilding />

                      <h3>
                        No departments found
                      </h3>

                    </div>
                  ) : (
                    departments.map(
                      (
                        department
                      ) => (
                        <div
                          className="department-card"
                          key={
                            department._id
                          }
                        >

                          <div className="department-card-icon">
                            <FaBuilding />
                          </div>

                          <div className="department-card-content">

                            <h3>
                              {
                                department.name
                              }
                            </h3>

                            <p>
                              {department.description ||
                                "No description"}
                            </p>

                            <strong>
                              {department.employeeCount ||
                                0}{" "}
                              employees
                            </strong>

                            <span className="status-badge status-active">
                              {department.status ||
                                "Active"}
                            </span>

                          </div>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="edit-button"
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

            {activePage ===
              "Leave Requests" && (
              <LeaveRequests
                employees={
                  employees
                }
                token={token}
              />
            )}

          </>
        )}

      </main>

      {showForm && (
        <EmployeeModal
          form={form}
          setShowForm={
            setShowForm
          }
          resetForm={
            resetForm
          }
          editingId={
            editingId
          }
          handleChange={
            handleChange
          }
          handleSubmit={
            handleSubmit
          }
          departments={
            departments
          }
        />
      )}

      {showDepartmentForm && (
        <DepartmentModal
          departmentForm={
            departmentForm
          }
          setShowDepartmentForm={
            setShowDepartmentForm
          }
          resetDepartmentForm={
            resetDepartmentForm
          }
          editingDepartmentId={
            editingDepartmentId
          }
          handleDepartmentChange={
            handleDepartmentChange
          }
          handleDepartmentSubmit={
            handleDepartmentSubmit
          }
        />
      )}

    </div>
  );
}

/* ================================================================
   ADMIN LOGIN
================================================================ */

function AdminLogin({
  loginForm,
  showPassword,
  handleLoginChange,
  handleLogin,
  setShowPassword,
  onEmployeeLogin,
}) {
  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          <FaUserTie />
        </div>

        <h2>
          Administrator Login
        </h2>

        <p>
          Login to manage your HR system.
        </p>

        <form
          onSubmit={
            handleLogin
          }
        >

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={
              loginForm.email
            }
            onChange={
              handleLoginChange
            }
            placeholder="admin@example.com"
            required
          />

          <label>
            Password
          </label>

          <div className="password-input">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              value={
                loginForm.password
              }
              onChange={
                handleLoginChange
              }
              placeholder="Enter password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) =>
                    !value
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

        </form>

        <div className="employee-login-link">

          <span>
            Are you an employee?
          </span>

          <button
            type="button"
            onClick={
              onEmployeeLogin
            }
          >
            Employee Login /
            Registration
            <FaArrowRight />
          </button>

        </div>

      </div>

    </div>
  );
}

/* ================================================================
   EMPLOYEE DASHBOARD
================================================================ */

function EmployeeDashboard({
  user,
  employeeName,
  attendanceHistory,
  todayAttendance,
  attendanceLoading,
  attendanceActionLoading,
  hasCheckedIn,
  hasCheckedOut,
  attendanceStatus,
  getWorkingHours,
  formatTime,
  formatDate,
  getInitials,
  handleEmployeeCheckIn,
  handleEmployeeCheckOut,
  loadEmployeeAttendance,
  handleLogout,
}) {
  const statusLower =
    String(
      attendanceStatus || ""
    ).toLowerCase();

  return (
    <div className="employee-dashboard">

      <header className="employee-header">

        <div className="employee-header-content">

          <div className="employee-header-title">

            <div className="employee-header-icon">
              <FaUserTie />
            </div>

            <div>

              <span>
                EMPLOYEE PORTAL
              </span>

              <h1>
                Welcome,{" "}
                {employeeName} 👋
              </h1>

              <p>
                Manage your attendance and track your working hours.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="employee-logout"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </header>

      <main className="employee-main">

        <section className="employee-profile-card">

          <div className="employee-profile-avatar">
            {getInitials(user)}
          </div>

          <div className="employee-profile-details">

            <div className="employee-profile-heading">

              <div>

                <h2>
                  {employeeName}
                </h2>

                <p>
                  {user?.position ||
                    "Employee"}
                </p>

              </div>

              <span className="employee-active-badge">
                <span />
                {user?.status ||
                  "Active"}
              </span>

            </div>

            <div className="employee-profile-info">

              <span>
                <FaEnvelope />
                {user?.email ||
                  "No email"}
              </span>

              <span>
                <FaBriefcase />
                {user?.department ||
                  "No department"}
              </span>

              {user?.phone && (
                <span>
                  <FaPhone />
                  {user.phone}
                </span>
              )}

              {user?.address && (
                <span>
                  <FaMapMarkerAlt />
                  {user.address}
                </span>
              )}

            </div>

          </div>

        </section>

        <section className="employee-attendance-section">

          <div className="employee-section-heading">

            <div>

              <div className="section-icon">
                <FaCalendarCheck />
              </div>

              <div>

                <h2>
                  Today's Attendance
                </h2>

                <p>
                  Track your working time for today.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="refresh-attendance"
              onClick={() =>
                loadEmployeeAttendance()
              }
              disabled={
                attendanceLoading
              }
            >

              <FaSyncAlt
                className={
                  attendanceLoading
                    ? "spin-icon"
                    : ""
                }
              />

              {attendanceLoading
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

          <div className="employee-attendance-grid">

            <AttendanceCard
              title="Login Time"
              value={formatTime(
                todayAttendance?.loginTime
              )}
              icon={
                <FaSignInAlt />
              }
              className="login-card"
            />

            <AttendanceCard
              title="Logout Time"
              value={formatTime(
                todayAttendance?.logoutTime
              )}
              icon={
                <FaSignOutAlt />
              }
              className="logout-card"
            />

            <AttendanceCard
              title="Working Hours"
              value={
                getWorkingHours()
              }
              icon={
                <FaClock />
              }
              className="hours-card"
            />

            <AttendanceCard
              title="Today's Status"
              value={
                attendanceStatus
              }
              icon={
                <FaChartLine />
              }
              className={
                statusLower ===
                "present"
                  ? "present-card"
                  : statusLower ===
                    "half day"
                  ? "halfday-card"
                  : "status-card"
              }
            />

          </div>

          <div className="attendance-action-area">

            <div>

              <h3>
                Attendance Actions
              </h3>

              <p>
                Mark your attendance when you start and finish your work.
              </p>

            </div>

            <div className="attendance-buttons">

              <button
                type="button"
                className="check-in-button"
                onClick={
                  handleEmployeeCheckIn
                }
                disabled={
                  attendanceActionLoading ||
                  hasCheckedIn
                }
              >

                <FaSignInAlt />

                {hasCheckedIn
                  ? "Checked In"
                  : attendanceActionLoading
                  ? "Processing..."
                  : "Check In"}

              </button>

              <button
                type="button"
                className="check-out-button"
                onClick={
                  handleEmployeeCheckOut
                }
                disabled={
                  attendanceActionLoading ||
                  !hasCheckedIn ||
                  hasCheckedOut
                }
              >

                <FaSignOutAlt />

                {hasCheckedOut
                  ? "Checked Out"
                  : "Check Out"}

              </button>

            </div>

          </div>

          {!hasCheckedIn && (
            <div className="attendance-message neutral-message">
              <FaClock />
              Please check in when you start working.
            </div>
          )}

          {hasCheckedIn &&
            !hasCheckedOut && (
              <div className="attendance-message success-message">
                <FaCheckCircle />
                You are currently checked in. Check out when you finish working.
              </div>
            )}

          {hasCheckedOut && (
            <div className="attendance-message completed-message">
              <FaCheckCircle />
              Today's attendance has been completed.
            </div>
          )}

        </section>

        <section className="employee-history-section">

          <div className="employee-section-heading">

            <div>

              <div className="section-icon">
                <FaHistory />
              </div>

              <div>

                <h2>
                  Attendance History
                </h2>

                <p>
                  View your previous attendance records.
                </p>

              </div>

            </div>

            <span className="record-count">
              {
                attendanceHistory.length
              }{" "}
              Records
            </span>

          </div>

          {attendanceLoading ? (
            <div className="employee-loading">

              <FaSyncAlt className="spin-icon" />

              <p>
                Loading attendance history...
              </p>

            </div>
          ) : attendanceHistory.length ===
            0 ? (
            <div className="employee-empty">

              <FaCalendarCheck />

              <h3>
                No attendance records
              </h3>

              <p>
                Your attendance history will appear here.
              </p>

            </div>
          ) : (
            <div className="employee-history-table-wrapper">

              <table className="employee-history-table">

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Login</th>
                    <th>Logout</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {attendanceHistory.map(
                    (
                      record,
                      index
                    ) => (
                      <tr
                        key={
                          record._id ||
                          `${record.date}-${index}`
                        }
                      >

                        <td>
                          <strong>
                            {formatDate(
                              record.date
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="time-value">

                            <FaSignInAlt />

                            {formatTime(
                              record.loginTime
                            )}

                          </span>
                        </td>

                        <td>
                          <span className="time-value">

                            <FaSignOutAlt />

                            {formatTime(
                              record.logoutTime
                            )}

                          </span>
                        </td>

                        <td>

                          {record.workingHours !==
                            undefined &&
                          record.workingHours !==
                            null
                            ? `${Number(
                                record.workingHours
                              ).toFixed(
                                2
                              )} hrs`
                            : "In progress"}

                        </td>

                        <td>

                          <AttendanceStatus
                            status={
                              record.status ||
                              "N/A"
                            }
                          />

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="employee-info-banner">

          <div className="info-banner-icon">
            <FaShieldAlt />
          </div>

          <div>

            <h3>
              Your Employee Portal
            </h3>

            <p>
              You can access only your employee profile and attendance
              information. Administrator records, employee management,
              payroll management and other HR administration features
              are restricted to authorized administrators.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

/* ================================================================
   ATTENDANCE CARD
================================================================ */

function AttendanceCard({
  title,
  value,
  icon,
  className,
}) {
  return (
    <div
      className={`attendance-card ${className}`}
    >

      <div className="attendance-card-top">

        <span>
          {title}
        </span>

        <div className="attendance-card-icon">
          {icon}
        </div>

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}

/* ================================================================
   ATTENDANCE STATUS
================================================================ */

function AttendanceStatus({
  status,
}) {
  const normalized =
    String(status)
      .toLowerCase();

  let className =
    "history-status neutral";

  if (
    normalized ===
    "present"
  ) {
    className =
      "history-status present";
  } else if (
    normalized ===
    "half day"
  ) {
    className =
      "history-status half-day";
  } else if (
    normalized ===
    "absent"
  ) {
    className =
      "history-status absent";
  }

  return (
    <span className={className}>
      {status}
    </span>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  icon,
  title,
  value,
  text,
  color,
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${color}`}
      >
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {text}
        </small>

      </div>

    </div>
  );
}

/* ================================================================
   SYSTEM ITEM
================================================================ */

function SystemItem({
  icon,
  title,
  value,
}) {
  return (
    <div className="system-item">

      {icon}

      <div className="system-info">

        <strong>
          {title}
        </strong>

        <span>
          {value}
        </span>

      </div>

      <b>
        Connected
      </b>

    </div>
  );
}

/* ================================================================
   EMPLOYEE MODAL
================================================================ */

function EmployeeModal({
  form,
  setShowForm,
  resetForm,
  editingId,
  handleChange,
  handleSubmit,
  departments,
}) {
  const close = () => {
    setShowForm(false);
    resetForm();
  };

  const fields = [
    [
      "employeeId",
      "Employee ID",
      "EMP001",
    ],
    [
      "firstName",
      "First Name",
      "First name",
    ],
    [
      "lastName",
      "Last Name",
      "Last name",
    ],
    [
      "email",
      "Email",
      "employee@example.com",
    ],
    [
      "phone",
      "Phone",
      "9876543210",
    ],
    [
      "position",
      "Position",
      "Software Developer",
    ],
    [
      "salary",
      "Salary",
      "50000",
    ],
  ];

  return (
    <div
      className="modal-overlay"
      onClick={close}
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
              Enter employee information.
            </p>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={close}
          >
            <FaTimes />
          </button>

        </div>

        <form
          className="employee-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-grid">

            {fields.map(
              ([
                name,
                label,
                placeholder,
              ]) => (
                <div
                  className="form-group"
                  key={name}
                >

                  <label>
                    {label}

                    {[
                      "employeeId",
                      "firstName",
                      "lastName",
                      "email",
                      "position",
                    ].includes(
                      name
                    ) &&
                      " *"}
                  </label>

                  <input
                    type={
                      name ===
                      "email"
                        ? "email"
                        : name ===
                          "salary"
                        ? "number"
                        : "text"
                    }
                    name={name}
                    value={
                      form[name]
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      placeholder
                    }
                    required={[
                      "employeeId",
                      "firstName",
                      "lastName",
                      "email",
                      "position",
                    ].includes(
                      name
                    )}
                  />

                </div>
              )
            )}

            <div className="form-group">

              <label>
                Department *
              </label>

              <select
                name="department"
                value={
                  form.department
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select department
                </option>

                {departments.map(
                  (
                    department
                  ) => (
                    <option
                      key={
                        department._id
                      }
                      value={
                        department.name
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
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

            <div className="form-group form-group-full">

              <label>
                Address
              </label>

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                rows="3"
                placeholder="Employee address"
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={close}
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
  );
}

/* ================================================================
   DEPARTMENT MODAL
================================================================ */

function DepartmentModal({
  departmentForm,
  setShowDepartmentForm,
  resetDepartmentForm,
  editingDepartmentId,
  handleDepartmentChange,
  handleDepartmentSubmit,
}) {
  const close = () => {
    setShowDepartmentForm(
      false
    );

    resetDepartmentForm();
  };

  return (
    <div
      className="modal-overlay"
      onClick={close}
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
              Manage department information.
            </p>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={close}
          >
            <FaTimes />
          </button>

        </div>

        <form
          className="employee-form"
          onSubmit={
            handleDepartmentSubmit
          }
        >

          <div className="form-grid">

            <div className="form-group">

              <label>
                Department Name *
              </label>

              <input
                type="text"
                name="name"
                value={
                  departmentForm.name
                }
                onChange={
                  handleDepartmentChange
                }
                placeholder="Engineering"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  departmentForm.status
                }
                onChange={
                  handleDepartmentChange
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
                rows="4"
                placeholder="Department description"
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={close}
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
  );
}

/* ================================================================
   EMPLOYEE TABLE
================================================================ */

function EmployeeTable({
  employees,
  getInitials,
  getEmployeeName,
  openEditForm,
  deleteEmployee,
}) {
  if (!employees.length) {
    return (
      <div className="empty-state">

        <FaUsers />

        <h3>
          No employees found
        </h3>

        <p>
          Add an employee to get started.
        </p>

      </div>
    );
  }

  return (
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

          {employees.map(
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
                  {
                    employee.employeeId
                  }
                </td>

                <td>

                  <span className="department-badge">
                    {
                      employee.department ||
                      "—"
                    }
                  </span>

                </td>

                <td>
                  {
                    employee.position ||
                    "—"
                  }
                </td>

                <td>
                  {
                    employee.phone ||
                    "—"
                  }
                </td>

                <td>
                  ₹
                  {Number(
                    employee.salary ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td>

                  <span
                    className={`status-badge ${
                      String(
                        employee.status ||
                          ""
                      ).toLowerCase() ===
                      "active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {
                      employee.status ||
                      "Inactive"
                    }
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
  );
}

export default App;