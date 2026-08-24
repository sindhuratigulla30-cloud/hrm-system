import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FaUserTie,
  FaEnvelope,
  FaBriefcase,
  FaPhone,
  FaMapMarkerAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaClock,
  FaCalendarCheck,
  FaHistory,
  FaSyncAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaUserCircle,
  FaCalendarAlt,
  FaPowerOff,
} from "react-icons/fa";

import "./EmployeeDashboard.css";

function EmployeeDashboard({
  user,
  token,
  apiUrl,
  onLogout,
}) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ============================================================
     AUTH CONFIG
  ============================================================ */

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  /* ============================================================
     EMPLOYEE INFORMATION
  ============================================================ */

  const employeeName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Employee";

  const initials =
    `${user?.firstName?.charAt(0) || ""}${
      user?.lastName?.charAt(0) || ""
    }`.toUpperCase() || "EM";

  /* ============================================================
     LIVE CLOCK
  ============================================================ */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = (value) => {
    if (!value) return "--:--:--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--:--:--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

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

  /* ============================================================
     CHECK TODAY
  ============================================================ */

  const isToday = (value) => {
    if (!value) return false;

    const date = new Date(value);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /* ============================================================
     LOAD ATTENDANCE
  ============================================================ */

  const loadAttendance = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/api/attendance/my-attendance`,
        authConfig
      );

      const data =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        response.data ||
        [];

      const records = Array.isArray(data) ? data : [];

      setAttendanceHistory(records);

      const todayRecord =
        records.find((record) => isToday(record?.date)) || null;

      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error(
        "Employee attendance loading error:",
        error
      );

      setAttendanceHistory([]);
      setTodayAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadAttendance();
  }, [token]);

  /* ============================================================
     ATTENDANCE STATES
  ============================================================ */

  const hasCheckedIn = Boolean(
    todayAttendance?.loginTime
  );

  const hasCheckedOut = Boolean(
    todayAttendance?.logoutTime
  );

  /* ============================================================
     WORKING HOURS
  ============================================================ */

  const workingHours = () => {
    if (!todayAttendance?.loginTime) {
      return "0.00";
    }

    if (
      todayAttendance.workingHours !== undefined &&
      todayAttendance.workingHours !== null &&
      todayAttendance.logoutTime
    ) {
      return Number(
        todayAttendance.workingHours
      ).toFixed(2);
    }

    if (
      todayAttendance.loginTime &&
      !todayAttendance.logoutTime
    ) {
      const start = new Date(
        todayAttendance.loginTime
      ).getTime();

      const end = currentTime.getTime();

      const hours =
        Math.max(0, end - start) /
        (1000 * 60 * 60);

      return hours.toFixed(2);
    }

    return "0.00";
  };

  /* ============================================================
     ATTENDANCE STATUS
  ============================================================ */

  const attendanceStatus =
    todayAttendance?.status ||
    (hasCheckedOut
      ? "Present"
      : hasCheckedIn
      ? "In Progress"
      : "Not Marked");

  /* ============================================================
     STATUS CLASS
  ============================================================ */

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "status-present";

      case "Half Day":
        return "status-half";

      case "Absent":
        return "status-absent";

      case "In Progress":
        return "status-progress";

      default:
        return "status-neutral";
    }
  };

  /* ============================================================
     CHECK IN
  ============================================================ */

  const handleCheckIn = async () => {
    if (!token || hasCheckedIn) return;

    setActionLoading(true);

    try {
      await axios.post(
        `${apiUrl}/api/attendance/check-in`,
        {},
        authConfig
      );

      await loadAttendance();
    } catch (error) {
      console.error(
        "Employee check-in error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================================================
     CHECK OUT
  ============================================================ */

  const handleCheckOut = async () => {
    if (
      !token ||
      !hasCheckedIn ||
      hasCheckedOut
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await axios.post(
        `${apiUrl}/api/attendance/check-out`,
        {},
        authConfig
      );

      await loadAttendance();
    } catch (error) {
      console.error(
        "Employee check-out error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================================================
     TODAY DATE
  ============================================================ */

  const todayDate = currentTime.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="employee-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="employee-dashboard-header">

        <div className="employee-dashboard-brand">

          <div className="employee-dashboard-brand-icon">
            <FaUserTie />
          </div>

          <div className="employee-dashboard-brand-text">
            <strong>HR MANAGEMENT SYSTEM</strong>
            <span>EMPLOYEE PORTAL</span>
          </div>

        </div>

        <div className="employee-dashboard-header-right">

          <span className="employee-portal-label">
            EMPLOYEE PORTAL
          </span>

          <button
            type="button"
            className="employee-dashboard-logout"
            onClick={onLogout}
          >
            <FaPowerOff />
            Logout
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="employee-dashboard-main">

        {/* ====================================================
            WELCOME
        ==================================================== */}

        <section className="employee-welcome">

          <h1>
            Welcome, <span>{employeeName}</span> 👋
          </h1>

          <p>
            Manage your attendance and track your
            working hours.
          </p>

        </section>

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <section className="employee-profile-card">

          <div className="employee-profile-left">

            <div className="employee-profile-avatar">
              {initials}
            </div>

            <div className="employee-profile-info">

              <h2>{employeeName}</h2>

              <p>
                {user?.position || "Employee"}
              </p>

              <div className="employee-profile-meta">

                <span>
                  <FaEnvelope />
                  {user?.email || "Not available"}
                </span>

                <span>
                  <FaBriefcase />
                  {user?.department || "Not assigned"}
                </span>

                <span>
                  <FaPhone />
                  {user?.phone || "Not available"}
                </span>

                <span>
                  <FaMapMarkerAlt />
                  {user?.employeeId || "Not available"}
                </span>

              </div>

            </div>

          </div>

          <div className="employee-profile-status">

            <span className="employee-profile-status-dot" />

            {user?.status || "Active"}

          </div>

        </section>

        {/* ====================================================
            ATTENDANCE SECTION
        ==================================================== */}

        <section className="employee-section">

          <div className="employee-section-header">

            <div className="employee-section-title">

              <h2>
                Today's Attendance
              </h2>

              <p>
                Track your working time for today.
              </p>

            </div>

            <button
              type="button"
              className="employee-refresh-button"
              onClick={loadAttendance}
              disabled={loading}
            >
              <FaSyncAlt
                className={
                  loading ? "spinning" : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* ==================================================
              ATTENDANCE CARDS
          ================================================== */}

          <div className="employee-attendance-grid">

            {/* LOGIN */}

            <div className="employee-attendance-card">

              <div className="employee-attendance-icon login">
                <FaSignInAlt />
              </div>

              <span className="employee-attendance-label">
                Login Time
              </span>

              <strong className="employee-attendance-value">
                {formatTime(
                  todayAttendance?.loginTime
                )}
              </strong>

              <span className="employee-attendance-subtitle">
                {hasCheckedIn
                  ? "Workday started"
                  : "Not checked in"}
              </span>

            </div>

            {/* LOGOUT */}

            <div className="employee-attendance-card">

              <div className="employee-attendance-icon logout">
                <FaSignOutAlt />
              </div>

              <span className="employee-attendance-label">
                Logout Time
              </span>

              <strong className="employee-attendance-value">
                {formatTime(
                  todayAttendance?.logoutTime
                )}
              </strong>

              <span className="employee-attendance-subtitle">
                {hasCheckedOut
                  ? "Workday completed"
                  : "Not checked out"}
              </span>

            </div>

            {/* WORKING HOURS */}

            <div className="employee-attendance-card">

              <div className="employee-attendance-icon working">
                <FaClock />
              </div>

              <span className="employee-attendance-label">
                Working Hours
              </span>

              <strong className="employee-attendance-value">
                {workingHours()} hrs
              </strong>

              <span className="employee-attendance-subtitle">
                {hasCheckedIn &&
                !hasCheckedOut
                  ? "Live working time"
                  : "Total working time"}
              </span>

            </div>

          </div>

          {/* ==================================================
              TODAY STATUS
          ================================================== */}

          <div className="employee-today-status">

            <div className="employee-today-status-left">

              <div className="employee-status-icon">
                <FaCalendarCheck />
              </div>

              <div className="employee-status-info">

                <strong>
                  Today's Status
                </strong>

                <span>
                  {attendanceStatus === "Present"
                    ? "Attendance completed successfully"
                    : attendanceStatus === "In Progress"
                    ? "You are currently working"
                    : "Attendance has not been marked"}
                </span>

              </div>

            </div>

            <span className="employee-status-badge">
              {attendanceStatus}
            </span>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="employee-actions-section">

            <h3>
              Attendance Actions
            </h3>

            <p>
              Mark your attendance when you start
              and finish your work.
            </p>

            <div className="employee-action-buttons">

              <button
                type="button"
                className="employee-attendance-action check-in"
                onClick={handleCheckIn}
                disabled={
                  actionLoading ||
                  hasCheckedIn
                }
              >
                <FaSignInAlt />

                {actionLoading
                  ? "Processing..."
                  : hasCheckedIn
                  ? "Checked In"
                  : "Check In"}
              </button>

              <button
                type="button"
                className="employee-attendance-action check-out"
                onClick={handleCheckOut}
                disabled={
                  actionLoading ||
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

            {hasCheckedOut && (
              <div className="employee-completed-message">

                <FaCheckCircle />

                Today's attendance has been completed.

              </div>
            )}

          </div>

        </section>

        {/* ====================================================
            ATTENDANCE HISTORY
        ==================================================== */}

        <section className="employee-history-section">

          <div className="employee-history-header">

            <div className="employee-history-title">

              <h2>
                Attendance History
              </h2>

              <p>
                View your previous attendance records.
              </p>

            </div>

            <div className="employee-history-count">
              {attendanceHistory.length} Records
            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="employee-dashboard-loading-card">

              <FaSyncAlt className="spinning" />

              <p>
                Loading attendance history...
              </p>

            </div>
          ) : attendanceHistory.length === 0 ? (

            /* EMPTY */

            <div className="employee-dashboard-loading-card">

              <FaCalendarCheck />

              <p>
                No attendance records found.
              </p>

            </div>

          ) : (

            /* TABLE */

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
                    (record, index) => (

                      <tr
                        key={
                          record._id ||
                          `${record.date}-${record.loginTime}-${index}`
                        }
                      >

                        <td>
                          <span className="employee-history-date">
                            {formatDate(record.date)}
                          </span>
                        </td>

                        <td>

                          <span className="employee-history-time">

                            <FaSignInAlt />

                            {formatTime(
                              record.loginTime
                            )}

                          </span>

                        </td>

                        <td>

                          <span className="employee-history-time">

                            <FaSignOutAlt />

                            {formatTime(
                              record.logoutTime
                            )}

                          </span>

                        </td>

                        <td>

                          <span className="employee-history-hours">

                            {record.workingHours !==
                              undefined &&
                            record.workingHours !==
                              null
                              ? `${Number(
                                  record.workingHours
                                ).toFixed(2)} hrs`
                              : record.loginTime &&
                                !record.logoutTime
                              ? "In progress"
                              : "0.00 hrs"}

                          </span>

                        </td>

                        <td>

                          <span className="employee-history-status">

                            {record.status ||
                              "Not Marked"}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* ====================================================
            PORTAL INFORMATION
        ==================================================== */}

        <section className="employee-portal-info">

          <div className="employee-portal-info-icon">
            <FaUserCircle />
          </div>

          <div className="employee-portal-info-content">

            <strong>
              Your Employee Portal
            </strong>

            <p>
              You can access only your employee
              profile and attendance information.
              Administrator records, employee
              management, payroll management and
              other HR administration features are
              restricted to authorized administrators.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default EmployeeDashboard;