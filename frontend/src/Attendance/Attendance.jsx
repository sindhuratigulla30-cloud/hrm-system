import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaPlus,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import { API_URL } from "../config";
import "./Attendance.css";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyForm = {
  employeeId: "",
  date: getToday(),
  status: "Present",
  checkIn: "09:00",
  checkOut: "18:00",
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

const getInitials = (name = "") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "E";

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const normalizeStatus = (status) => {
  if (!status) return "Present";

  const value = String(status).trim().toLowerCase();

  if (value === "present") return "Present";
  if (value === "absent") return "Absent";
  if (value === "late") return "Late";
  if (value === "half day" || value === "half-day") return "Half Day";
  if (value === "leave") return "Leave";

  return status;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseTimeToMinutes = (time) => {
  if (!time || time === "-") return null;

  const value = String(time).trim();

  const match = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[4];

  if (meridiem) {
    const upper = meridiem.toUpperCase();

    if (upper === "PM" && hours !== 12) {
      hours += 12;
    }

    if (upper === "AM" && hours === 12) {
      hours = 0;
    }
  }

  return hours * 60 + minutes;
};

const calculateWorkingHours = (checkIn, checkOut) => {
  const start = parseTimeToMinutes(checkIn);
  const end = parseTimeToMinutes(checkOut);

  if (start === null || end === null) {
    return "-";
  }

  let difference = end - start;

  // Handles overnight shifts.
  if (difference < 0) {
    difference += 24 * 60;
  }

  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

const getResponseArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.employees)) {
    return data.employees;
  }

  if (Array.isArray(data?.attendance)) {
    return data.attendance;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [deletingAttendanceId, setDeletingAttendanceId] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);

  /* ============================================================
     LOAD EMPLOYEES
     ============================================================ */

  const loadEmployees = async () => {
    setLoadingEmployees(true);

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load employees."
        );
      }

      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (Array.isArray(data?.employees)) {
        setEmployees(data.employees);
      } else if (Array.isArray(data?.data)) {
        setEmployees(data.data);
      } else if (Array.isArray(data?.data?.employees)) {
        setEmployees(data.data.employees);
      } else if (Array.isArray(data?.results)) {
        setEmployees(data.results);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("EMPLOYEE LOAD ERROR:", err);
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  /* ============================================================
     LOAD ATTENDANCE
     ============================================================ */

  const loadAttendance = async () => {
    setLoadingAttendance(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load attendance records."
        );
      }

      if (Array.isArray(data)) {
        setAttendance(data);
      } else if (Array.isArray(data?.attendance)) {
        setAttendance(data.attendance);
      } else if (Array.isArray(data?.data)) {
        setAttendance(data.data);
      } else if (Array.isArray(data?.data?.attendance)) {
        setAttendance(data.data.attendance);
      } else if (Array.isArray(data?.results)) {
        setAttendance(data.results);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error("ATTENDANCE LOAD ERROR:", err);
      setError(err.message || "Unable to load attendance.");
    } finally {
      setLoadingAttendance(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    loadEmployees();
    loadAttendance();
  }, []);

  /* ============================================================
     FIND EMPLOYEE
     ============================================================ */

  const findEmployeeForRecord = (record) => {
    if (!record) return null;

    const employeeValue =
      record.employee ||
      record.employeeId ||
      record.employee_id;

    if (
      employeeValue &&
      typeof employeeValue === "object" &&
      !Array.isArray(employeeValue)
    ) {
      return employeeValue;
    }

    const employeeString = String(employeeValue || "");

    return (
      employees.find((employee) => {
        const mongoId =
          employee._id ||
          employee.id ||
          employee.employee;

        const businessId =
          employee.employeeId ||
          employee.empId;

        return (
          String(mongoId || "") === employeeString ||
          String(businessId || "") === employeeString
        );
      }) || null
    );
  };

  /* ============================================================
     EMPLOYEE NAME
     ============================================================ */

  const getEmployeeName = (record) => {
    const employee = findEmployeeForRecord(record);

    if (employee) {
      const fullName = [
        employee.firstName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) return fullName;

      if (employee.name) return employee.name;
      if (employee.fullName) return employee.fullName;
      if (employee.employeeName) return employee.employeeName;
    }

    if (record?.employeeName) {
      return record.employeeName;
    }

    if (record?.name) {
      return record.name;
    }

    return "Employee";
  };

  /* ============================================================
     EMPLOYEE ID
     ============================================================ */

  const getEmployeeId = (record) => {
    const employee = findEmployeeForRecord(record);

    if (employee) {
      if (employee.employeeId) return employee.employeeId;
      if (employee.empId) return employee.empId;
    }

    if (record?.employeeId) {
      if (typeof record.employeeId === "string") {
        return record.employeeId;
      }

      if (typeof record.employeeId === "object") {
        if (record.employeeId.employeeId) {
          return record.employeeId.employeeId;
        }
      }
    }

    if (
      record?.employee &&
      typeof record.employee === "object" &&
      record.employee.employeeId
    ) {
      return record.employee.employeeId;
    }

    return "N/A";
  };

  /* ============================================================
     WORKING HOURS
     ============================================================ */

  const getWorkingHours = (record) => {
    if (!record) return "-";

    if (
      record.workingHours !== undefined &&
      record.workingHours !== null &&
      record.workingHours !== ""
    ) {
      const value = record.workingHours;

      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "number") {
        return `${value}h`;
      }

      if (typeof value === "object") {
        if (value.formatted) return value.formatted;

        if (
          value.hours !== undefined &&
          value.minutes !== undefined
        ) {
          return `${value.hours}h ${String(
            value.minutes
          ).padStart(2, "0")}m`;
        }

        if (value.hours !== undefined) {
          return `${value.hours}h`;
        }
      }
    }

    if (
      record.status &&
      String(record.status).toLowerCase() === "absent"
    ) {
      return "-";
    }

    return calculateWorkingHours(
      record.checkIn,
      record.checkOut
    );
  };

  /* ============================================================
     FORM
     ============================================================ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openModal = () => {
    setError("");

    setForm({
      ...emptyForm,
      date: getToday(),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (savingAttendance) return;

    setShowModal(false);
    setForm(emptyForm);
  };

  /* ============================================================
     SAVE ATTENDANCE
     ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    setSavingAttendance(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employee: form.employeeId,
          date: form.date,
          status: form.status,
          checkIn:
            form.status === "Absent"
              ? "-"
              : form.checkIn,
          checkOut:
            form.status === "Absent"
              ? "-"
              : form.checkOut,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to save attendance."
        );
      }

      const createdRecord =
        data?.attendance ||
        data?.data ||
        data?.record ||
        data;

      const selectedEmployee =
        employees.find(
          (employee) =>
            String(
              employee.employeeId ||
                employee._id ||
                employee.id
            ) === String(form.employeeId)
        ) || null;

      const localRecord = {
        ...createdRecord,
        employee:
          createdRecord?.employee || selectedEmployee,
        employeeId:
          createdRecord?.employeeId || form.employeeId,
        date: createdRecord?.date || form.date,
        status: createdRecord?.status || form.status,
        checkIn:
          createdRecord?.checkIn ||
          (form.status === "Absent"
            ? "-"
            : form.checkIn),
        checkOut:
          createdRecord?.checkOut ||
          (form.status === "Absent"
            ? "-"
            : form.checkOut),
      };

      setAttendance((previous) => [
        localRecord,
        ...previous,
      ]);

      setShowModal(false);
      setForm(emptyForm);

      // Refresh from backend so the table stays accurate.
      await loadAttendance();
    } catch (err) {
      console.error("SAVE ATTENDANCE ERROR:", err);

      setError(
        err.message || "Unable to save attendance."
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  /* ============================================================
     DELETE ATTENDANCE
     ============================================================ */

  const deleteAttendance = async (record) => {
    const recordId =
      record?._id ||
      record?.id ||
      record?.attendanceId;

    if (!recordId) {
      setError("Attendance record ID is missing.");
      return;
    }

    const employeeName = getEmployeeName(record);

    const confirmed = window.confirm(
      `Delete attendance record for ${employeeName}?`
    );

    if (!confirmed) return;

    setDeletingAttendanceId(recordId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/attendance/${recordId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete attendance record."
        );
      }

      setAttendance((previous) =>
        previous.filter(
          (item) =>
            String(
              item._id || item.id || item.attendanceId
            ) !== String(recordId)
        )
      );
    } catch (err) {
      console.error("DELETE ATTENDANCE ERROR:", err);

      setError(
        err.message ||
          "Unable to delete attendance record."
      );
    } finally {
      setDeletingAttendanceId(null);
    }
  };

  /* ============================================================
     FILTER
     ============================================================ */

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return attendance;
    }

    return attendance.filter((record) => {
      const employeeName = getEmployeeName(record);
      const employeeId = getEmployeeId(record);
      const status = normalizeStatus(record.status);

      return [
        employeeName,
        employeeId,
        record.date,
        status,
        record.checkIn,
        record.checkOut,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [attendance, search, employees]);

  /* ============================================================
     STATISTICS
     ============================================================ */

  const totalRecords = attendance.length;

  const presentCount = attendance.filter(
    (record) =>
      String(record.status || "").toLowerCase() ===
      "present"
  ).length;

  const absentCount = attendance.filter(
    (record) =>
      String(record.status || "").toLowerCase() ===
      "absent"
  ).length;

  const lateCount = attendance.filter(
    (record) =>
      String(record.status || "").toLowerCase() ===
      "late"
  ).length;

  /* ============================================================
     STATUS CLASS
     ============================================================ */

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status)
      .toLowerCase()
      .replace(/\s+/g, "-");

    return normalized;
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="attendance-page">

      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="attendance-header">
        <div>
          <h1>Attendance Management</h1>

          <p>
            Track employee attendance, check-in and
            check-out records.
          </p>
        </div>

        <button
          type="button"
          className="add-attendance-button"
          onClick={openModal}
        >
          <FaPlus />
          Mark Attendance
        </button>
      </div>


      {/* ========================================================
          ERROR
          ======================================================== */}

      {error && (
        <div className="attendance-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              loadEmployees();
              loadAttendance();
            }}
          >
            Retry
          </button>
        </div>
      )}


      {/* ========================================================
          STATISTICS
          ======================================================== */}

      <div className="attendance-stats">

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{totalRecords}</strong>
          </div>
        </div>


        <div className="attendance-stat-card">
          <div className="attendance-stat-icon present-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>Present</span>
            <strong>{presentCount}</strong>
          </div>
        </div>


        <div className="attendance-stat-card">
          <div className="attendance-stat-icon absent-icon">
            <FaTimesCircle />
          </div>

          <div>
            <span>Absent</span>
            <strong>{absentCount}</strong>
          </div>
        </div>


        <div className="attendance-stat-card">
          <div className="attendance-stat-icon late-icon">
            <FaClock />
          </div>

          <div>
            <span>Late</span>
            <strong>{lateCount}</strong>
          </div>
        </div>

      </div>


      {/* ========================================================
          ATTENDANCE CARD
          ======================================================== */}

      <div className="attendance-card">

        {/* Toolbar */}

        <div className="attendance-toolbar">

          <div>
            <h2>Attendance Records</h2>

            <p>
              View and manage employee attendance
              records.
            </p>
          </div>

          <div className="attendance-search">
            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search attendance..."
            />
          </div>

        </div>


        {/* Table */}

        <div className="attendance-table-wrapper">

          {loadingAttendance ? (
            <div className="attendance-loading">
              <div className="attendance-spinner"></div>

              <span>
                Loading attendance records...
              </span>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="attendance-empty">
              <FaCalendarCheck />

              <strong>
                No attendance records found
              </strong>

              <span>
                {search
                  ? "Try changing your search."
                  : "Mark attendance to create the first record."}
              </span>
            </div>
          ) : (
            <table className="attendance-table">

              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>EMPLOYEE ID</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>CHECK IN</th>
                  <th>CHECK OUT</th>
                  <th>WORKING HOURS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map(
                  (record, index) => {
                    const employeeName =
                      getEmployeeName(record);

                    const employeeId =
                      getEmployeeId(record);

                    const status =
                      normalizeStatus(
                        record.status
                      );

                    const statusClass =
                      getStatusClass(status);

                    const recordId =
                      record._id ||
                      record.id ||
                      record.attendanceId ||
                      `attendance-${index}`;

                    return (
                      <tr key={recordId}>

                        {/* Employee */}

                        <td>
                          <div className="attendance-employee-cell">

                            <div className="attendance-employee-avatar">
                              {getInitials(
                                employeeName
                              )}
                            </div>

                            <strong
                              title={employeeName}
                            >
                              {employeeName}
                            </strong>

                          </div>
                        </td>


                        {/* Employee ID */}

                        <td>
                          <span className="attendance-employee-id">
                            {employeeId}
                          </span>
                        </td>


                        {/* Date */}

                        <td>
                          {formatDate(record.date)}
                        </td>


                        {/* Status */}

                        <td>
                          <span
                            className={`attendance-status ${statusClass}`}
                          >
                            {status}
                          </span>
                        </td>


                        {/* Check In */}

                        <td>
                          <span className="attendance-time check-in-time">
                            <FaClock />

                            {record.checkIn || "-"}
                          </span>
                        </td>


                        {/* Check Out */}

                        <td>
                          <span className="attendance-time check-out-time">
                            <FaClock />

                            {record.checkOut || "-"}
                          </span>
                        </td>


                        {/* Working Hours */}

                        <td>
                          <span className="attendance-working-hours">
                            {getWorkingHours(record)}
                          </span>
                        </td>


                        {/* Actions */}

                        <td>
                          <div className="attendance-actions">

                            <button
                              type="button"
                              className="attendance-delete-button"
                              title="Delete attendance"
                              disabled={
                                deletingAttendanceId ===
                                recordId
                              }
                              onClick={() =>
                                deleteAttendance(
                                  record
                                )
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>
          )}

        </div>

      </div>


      {/* ========================================================
          MODAL
          ======================================================== */}

      {showModal && (
        <div className="attendance-modal-overlay">

          <div className="attendance-modal">

            {/* Modal Header */}

            <div className="attendance-modal-header">

              <div>
                <h2>Mark Attendance</h2>

                <p>
                  Add attendance details for an
                  employee.
                </p>
              </div>

              <button
                type="button"
                className="attendance-close-button"
                onClick={closeModal}
                disabled={savingAttendance}
              >
                <FaTimes />
              </button>

            </div>


            {/* Form */}

            <form
              className="attendance-form"
              onSubmit={handleSubmit}
            >

              {/* Employee */}

              <div className="attendance-form-group">

                <label htmlFor="attendance-employee">
                  Employee
                </label>

                <select
                  id="attendance-employee"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  disabled={
                    savingAttendance ||
                    loadingEmployees
                  }
                  required
                >
                  <option value="">
                    {loadingEmployees
                      ? "Loading employees..."
                      : "Select employee"}
                  </option>

                  {employees.map((employee) => {
                    const fullName = [
                      employee.firstName,
                      employee.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .trim();

                    const name =
                      fullName ||
                      employee.name ||
                      employee.fullName ||
                      employee.employeeName ||
                      "Employee";

                    const id =
                      employee.employeeId ||
                      employee._id ||
                      employee.id;

                    return (
                      <option
                        key={id}
                        value={employee.employeeId || id}
                      >
                        {name}
                        {employee.employeeId
                          ? ` (${employee.employeeId})`
                          : ""}
                      </option>
                    );
                  })}
                </select>

                {employees.length === 0 &&
                  !loadingEmployees && (
                    <span className="attendance-warning">
                      No employees available.
                    </span>
                  )}

              </div>


              {/* Date */}

              <div className="attendance-form-row">

                <div className="attendance-form-group">

                  <label htmlFor="attendance-date">
                    Date
                  </label>

                  <input
                    id="attendance-date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    disabled={savingAttendance}
                    required
                  />

                </div>


                {/* Status */}

                <div className="attendance-form-group">

                  <label htmlFor="attendance-status">
                    Status
                  </label>

                  <select
                    id="attendance-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={savingAttendance}
                    required
                  >
                    <option value="Present">
                      Present
                    </option>

                    <option value="Late">
                      Late
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Half Day">
                      Half Day
                    </option>

                    <option value="Leave">
                      Leave
                    </option>
                  </select>

                </div>

              </div>


              {/* Check In / Check Out */}

              <div className="attendance-form-row">

                <div className="attendance-form-group">

                  <label htmlFor="attendance-check-in">
                    Check In
                  </label>

                  <input
                    id="attendance-check-in"
                    type="time"
                    name="checkIn"
                    value={form.checkIn}
                    onChange={handleChange}
                    disabled={
                      savingAttendance ||
                      form.status === "Absent"
                    }
                  />

                </div>


                <div className="attendance-form-group">

                  <label htmlFor="attendance-check-out">
                    Check Out
                  </label>

                  <input
                    id="attendance-check-out"
                    type="time"
                    name="checkOut"
                    value={form.checkOut}
                    onChange={handleChange}
                    disabled={
                      savingAttendance ||
                      form.status === "Absent"
                    }
                  />

                </div>

              </div>


              {/* Warning */}

              {form.status === "Absent" && (
                <div className="attendance-warning">
                  Check-in and check-out are disabled
                  for absent employees.
                </div>
              )}


              {/* Actions */}

              <div className="attendance-form-actions">

                <button
                  type="button"
                  className="attendance-cancel-button"
                  onClick={closeModal}
                  disabled={savingAttendance}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attendance-save-button"
                  disabled={
                    savingAttendance ||
                    loadingEmployees ||
                    employees.length === 0
                  }
                >
                  {savingAttendance
                    ? "Saving..."
                    : "Save Attendance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}