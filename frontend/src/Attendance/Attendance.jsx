import React, { useEffect, useState } from "react";

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


function Attendance() {

  // ============================================================
  // STATE
  // ============================================================

  const [employees, setEmployees] = useState([]);

  const [attendance, setAttendance] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    status: "Present",
    checkIn: "09:00",
    checkOut: "18:00",
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {

    loadEmployees();

    const savedAttendance =
      localStorage.getItem(
        "hrmAttendance"
      );

    if (savedAttendance) {

      try {

        const parsedData =
          JSON.parse(savedAttendance);

        if (Array.isArray(parsedData)) {
          setAttendance(parsedData);
        }

      } catch (error) {

        console.error(
          "Attendance localStorage error:",
          error
        );

        setAttendance([]);
      }
    }

  }, []);

  // ============================================================
  // LOAD EMPLOYEES FROM MONGODB API
  // ============================================================

  const loadEmployees = async () => {

    try {

      setLoadingEmployees(true);

      const response = await fetch(
        `${API_URL}/api/employees`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load employees"
        );
      }

      const data = await response.json();

      if (Array.isArray(data?.employees)) {

        setEmployees(
          data.employees
        );

      } else if (Array.isArray(data)) {

        setEmployees(data);

      } else {

        setEmployees([]);

      }

    } catch (error) {

      console.error(
        "Attendance employee loading error:",
        error
      );

      setEmployees([]);

    } finally {

      setLoadingEmployees(false);

    }
  };

  // ============================================================
  // SAVE ATTENDANCE
  // ============================================================

  const saveAttendance = (records) => {

    setAttendance(records);

    localStorage.setItem(
      "hrmAttendance",
      JSON.stringify(records)
    );

  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

  };

  // ============================================================
  // OPEN MODAL
  // ============================================================

  const openModal = () => {

    setForm({
      employeeId: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      status: "Present",
      checkIn: "09:00",
      checkOut: "18:00",
    });

    setShowModal(true);

  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {

    setShowModal(false);

  };

  // ============================================================
  // SUBMIT ATTENDANCE
  // ============================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    const employee =
      employees.find(
        (item) =>
          String(item._id) ===
            String(form.employeeId) ||
          String(item.id) ===
            String(form.employeeId)
      );

    if (!employee) {

      alert(
        "Please select an employee."
      );

      return;

    }

    const employeeName =

      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim() ||

      employee.name ||

      employee.fullName ||

      "Employee";

    const newRecord = {

      id: Date.now(),

      employeeId:
        form.employeeId,

      employeeName:
        employeeName,

      date:
        form.date,

      status:
        form.status,

      checkIn:
        form.status === "Absent"
          ? "-"
          : form.checkIn,

      checkOut:
        form.status === "Absent"
          ? "-"
          : form.checkOut,

    };

    const updatedRecords = [
      newRecord,
      ...attendance,
    ];

    saveAttendance(
      updatedRecords
    );

    closeModal();

  };

  // ============================================================
  // DELETE ATTENDANCE
  // ============================================================

  const deleteAttendance = (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this attendance record?"
      );

    if (!confirmed) {
      return;
    }

    const updatedRecords =
      attendance.filter(
        (record) =>
          record.id !== id
      );

    saveAttendance(
      updatedRecords
    );

  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAttendance =
    attendance.filter(
      (record) => {

        const text = `
          ${record.employeeName || ""}
          ${record.date || ""}
          ${record.status || ""}
        `.toLowerCase();

        return text.includes(
          search.toLowerCase()
        );

      }
    );

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRecords =
    attendance.length;

  const totalPresent =
    attendance.filter(
      (record) =>
        record.status ===
        "Present"
    ).length;

  const totalAbsent =
    attendance.filter(
      (record) =>
        record.status ===
        "Absent"
    ).length;

  const totalLate =
    attendance.filter(
      (record) =>
        record.status ===
        "Late"
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="attendance-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="attendance-header">

        <div>

          <h1>
            Attendance
          </h1>

          <p>
            Track and manage employee attendance.
          </p>

        </div>

        <button
          type="button"
          className="add-attendance-button"
          onClick={openModal}
        >

          <FaPlus />

          <span>
            Mark Attendance
          </span>

        </button>

      </header>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <section className="attendance-stats">

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon">
            <FaCalendarCheck />
          </div>

          <div>

            <span>
              Total Records
            </span>

            <strong>
              {totalRecords}
            </strong>

          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon present-icon">
            <FaCheckCircle />
          </div>

          <div>

            <span>
              Present
            </span>

            <strong>
              {totalPresent}
            </strong>

          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon absent-icon">
            <FaTimesCircle />
          </div>

          <div>

            <span>
              Absent
            </span>

            <strong>
              {totalAbsent}
            </strong>

          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon late-icon">
            <FaClock />
          </div>

          <div>

            <span>
              Late
            </span>

            <strong>
              {totalLate}
            </strong>

          </div>

        </div>

      </section>

      {/* ======================================================
          RECORDS
      ====================================================== */}

      <section className="attendance-card">

        <div className="attendance-toolbar">

          <div>

            <h2>
              Attendance Records
            </h2>

            <p>
              Employee attendance history.
            </p>

          </div>

          <div className="attendance-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search attendance..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="attendance-table-wrapper">

          <table className="attendance-table">

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>

                <th>
                  Check In
                </th>

                <th>
                  Check Out
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredAttendance.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="attendance-empty"
                  >

                    <FaCalendarCheck />

                    <strong>
                      No attendance records
                    </strong>

                    <span>
                      Click "Mark Attendance" to add a record.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredAttendance.map(
                  (record) => (

                    <tr
                      key={record.id}
                    >

                      <td>

                        <strong>
                          {record.employeeName}
                        </strong>

                      </td>

                      <td>
                        {record.date}
                      </td>

                      <td>

                        <span
                          className={`attendance-status ${
                            record.status.toLowerCase()
                          }`}
                        >
                          {record.status}
                        </span>

                      </td>

                      <td>
                        {record.checkIn}
                      </td>

                      <td>
                        {record.checkOut}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="attendance-delete-button"
                          title="Delete"
                          onClick={() =>
                            deleteAttendance(
                              record.id
                            )
                          }
                        >

                          <FaTrash />

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {showModal && (

        <div
          className="attendance-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="attendance-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="attendance-modal-header">

              <div>

                <h2>
                  Mark Attendance
                </h2>

                <p>
                  Record employee attendance.
                </p>

              </div>

              <button
                type="button"
                className="attendance-close-button"
                onClick={closeModal}
              >

                <FaTimes />

              </button>

            </div>

            {/* FORM */}

            <form
              className="attendance-form"
              onSubmit={handleSubmit}
            >

              {/* EMPLOYEE */}

              <div className="attendance-form-group">

                <label>
                  Employee *
                </label>

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  disabled={
                    loadingEmployees
                  }
                >

                  <option value="">

                    {loadingEmployees
                      ? "Loading employees..."
                      : "Select employee"}

                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={
                          employee._id ||
                          employee.id
                        }
                        value={
                          employee._id ||
                          employee.id
                        }
                      >

                        {employee.firstName ||
                          employee.name ||
                          employee.fullName ||
                          "Employee"}

                        {employee.lastName
                          ? ` ${employee.lastName}`
                          : ""}

                      </option>

                    )
                  )}

                </select>

                {!loadingEmployees &&
                  employees.length === 0 && (

                    <small className="attendance-warning">
                      No employees found. Make sure the backend is running.
                    </small>

                  )}

              </div>

              {/* DATE + STATUS */}

              <div className="attendance-form-row">

                <div className="attendance-form-group">

                  <label>
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="attendance-form-group">

                  <label>
                    Status *
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
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

                  </select>

                </div>

              </div>

              {/* CHECK IN / OUT */}

              <div className="attendance-form-row">

                <div className="attendance-form-group">

                  <label>
                    Check In
                  </label>

                  <input
                    type="time"
                    name="checkIn"
                    value={form.checkIn}
                    disabled={
                      form.status ===
                      "Absent"
                    }
                    onChange={handleChange}
                  />

                </div>

                <div className="attendance-form-group">

                  <label>
                    Check Out
                  </label>

                  <input
                    type="time"
                    name="checkOut"
                    value={form.checkOut}
                    disabled={
                      form.status ===
                      "Absent"
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="attendance-form-actions">

                <button
                  type="button"
                  className="attendance-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attendance-save-button"
                >
                  Save Attendance
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default Attendance;