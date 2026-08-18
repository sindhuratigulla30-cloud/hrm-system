import { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import "./Payroll.css";
import { API_URL } from "../config";


const emptyForm = {
  employeeId: "",
  salary: "",
  bonus: 0,
  deductions: 0,
  status: "Pending",
  month: new Date().toISOString().slice(0, 7),
};

function Payroll() {
  // ============================================================
  // STATE
  // ============================================================

  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingPayroll, setEditingPayroll] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert(
      "Your session has expired. Please login again."
    );

    window.location.href = "/login";
  };

  // ============================================================
  // AUTHENTICATED REQUEST
  // ============================================================

  const apiRequest = async (url, options = {}) => {
    const currentToken = getToken();

    if (!currentToken) {
      logoutUser();
      return null;
    }

    const headers = {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...(options.headers || {}),
      Authorization: `Bearer ${currentToken}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logoutUser();
      return null;
    }

    return response;
  };

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);

      const response = await apiRequest(
        `${API_URL}/api/employees`,
        {
          method: "GET",
        }
      );

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load employees."
        );
      }

      const employeeList = Array.isArray(data)
        ? data
        : Array.isArray(data.employees)
        ? data.employees
        : [];

      setEmployees(employeeList);
    } catch (error) {
      console.error(
        "Employee loading error:",
        error
      );

      setEmployees([]);

      alert(
        error.message ||
          "Unable to load employees."
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  // ============================================================
  // LOAD PAYROLL
  // ============================================================

  const loadPayroll = async () => {
    try {
      setLoading(true);

      const response = await apiRequest(
        `${API_URL}/api/payroll`,
        {
          method: "GET",
        }
      );

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load payroll records."
        );
      }

      setPayrollData(
        Array.isArray(data.payroll)
          ? data.payroll
          : []
      );
    } catch (error) {
      console.error(
        "Payroll loading error:",
        error
      );

      setPayrollData([]);

      alert(
        error.message ||
          "Unable to load payroll records."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setEmployeesLoading(false);
      return;
    }

    loadPayroll();
    loadEmployees();
  }, []);

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // ============================================================
  // CALCULATE NET SALARY
  // ============================================================

  const calculateNetSalary = (employee) => {
    return (
      Number(employee.salary || 0) +
      Number(employee.bonus || 0) -
      Number(employee.deductions || 0)
    );
  };

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const openAddModal = () => {
    if (!getToken()) {
      alert(
        "Authentication required. Please login again."
      );
      return;
    }

    if (!employees.length) {
      alert(
        "No employees are available. Please add an employee first."
      );
      return;
    }

    setEditingPayroll(null);

    setForm({
      ...emptyForm,
      employeeId: "",
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (payroll) => {
    setEditingPayroll(payroll);

    setForm({
      employeeId:
        payroll.employeeId?._id ||
        payroll.employeeId ||
        "",
      salary: payroll.salary || "",
      bonus: payroll.bonus || 0,
      deductions: payroll.deductions || 0,
      status:
        payroll.status || "Pending",
      month:
        payroll.month ||
        new Date().toISOString().slice(0, 7),
    });

    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingPayroll(null);
    setForm(emptyForm);
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // EMPLOYEE CHANGE
  // ============================================================

  const handleEmployeeChange = (event) => {
    const employeeId = event.target.value;

    const selectedEmployee = employees.find(
      (employee) =>
        String(
          employee._id ||
            employee.id ||
            ""
        ) === String(employeeId)
    );

    if (!selectedEmployee) {
      setForm((previous) => ({
        ...previous,
        employeeId,
        salary: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      employeeId,
      salary:
        selectedEmployee.salary ||
        selectedEmployee.annualSalary ||
        "",
    }));
  };

  // ============================================================
  // SAVE / UPDATE PAYROLL
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId) {
      alert("Please select an employee.");
      return;
    }

    if (
      form.salary === "" ||
      Number(form.salary) < 0
    ) {
      alert("Please enter a valid salary.");
      return;
    }

    if (Number(form.bonus) < 0) {
      alert("Bonus cannot be negative.");
      return;
    }

    if (Number(form.deductions) < 0) {
      alert(
        "Deductions cannot be negative."
      );
      return;
    }

    const salary = Number(form.salary);
    const bonus = Number(form.bonus) || 0;
    const deductions =
      Number(form.deductions) || 0;

    const netSalary =
      salary + bonus - deductions;

    if (netSalary < 0) {
      alert("Net salary cannot be negative.");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) =>
        String(
          employee._id ||
            employee.id ||
            ""
        ) === String(form.employeeId)
    );

    if (!selectedEmployee) {
      alert(
        "Selected employee was not found."
      );
      return;
    }

    try {
      setSaving(true);

      const firstName =
        selectedEmployee.firstName || "";

      const lastName =
        selectedEmployee.lastName || "";

      const employeeName =
        selectedEmployee.employeeName ||
        selectedEmployee.name ||
        `${firstName} ${lastName}`.trim();

      const department =
        selectedEmployee.department || "";

      const position =
        selectedEmployee.position || "";

      const payload = {
        employeeId:
          selectedEmployee._id ||
          selectedEmployee.id,

        employeeName,

        department,

        position,

        salary,

        bonus,

        deductions,

        status: form.status,

        month: form.month,
      };

      let response;

      // ========================================================
      // UPDATE
      // ========================================================

      if (editingPayroll) {
        response = await apiRequest(
          `${API_URL}/api/payroll/${editingPayroll._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      }

      // ========================================================
      // CREATE
      // ========================================================

      else {
        response = await apiRequest(
          `${API_URL}/api/payroll`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingPayroll
              ? "Unable to update payroll."
              : "Unable to generate payroll.")
        );
      }

      alert(
        editingPayroll
          ? "Payroll updated successfully."
          : "Payroll generated successfully."
      );

      closeModal();

      await loadPayroll();
    } catch (error) {
      console.error(
        "Payroll save error:",
        error
      );

      alert(
        error.message ||
          "Unable to save payroll."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE PAYROLL
  // ============================================================

  const deletePayroll = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiRequest(
        `${API_URL}/api/payroll/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete payroll."
        );
      }

      alert(
        "Payroll deleted successfully."
      );

      await loadPayroll();
    } catch (error) {
      console.error(
        "Payroll delete error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete payroll."
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredPayroll = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return payrollData;
    }

    return payrollData.filter(
      (employee) => {
        const employeeName =
          employee.employeeName || "";

        const department =
          employee.department || "";

        const position =
          employee.position || "";

        const status =
          employee.status || "";

        const searchText = `
          ${employeeName}
          ${department}
          ${position}
          ${status}
        `.toLowerCase();

        return searchText.includes(text);
      }
    );
  }, [payrollData, search]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalEmployees =
    payrollData.length;

  const paidEmployees =
    payrollData.filter(
      (employee) =>
        employee.status === "Paid"
    ).length;

  const pendingEmployees =
    payrollData.filter(
      (employee) =>
        employee.status === "Pending"
    ).length;

  const totalPayroll =
    payrollData.reduce(
      (total, employee) =>
        total +
        calculateNetSalary(employee),
      0
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="payroll-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="payroll-header">

        <div className="payroll-header-content">

          <div>

            <h1>
              Payroll
            </h1>

            <p>
              Manage employee salaries and payroll information.
            </p>

          </div>

          <button
            type="button"
            onClick={openAddModal}
            disabled={
              employeesLoading ||
              !employees.length
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              cursor:
                employeesLoading ||
                !employees.length
                  ? "not-allowed"
                  : "pointer",
              opacity:
                employeesLoading ||
                !employees.length
                  ? 0.6
                  : 1,
              fontWeight: 600,
            }}
          >
            <FaPlus />

            {employeesLoading
              ? "Loading Employees..."
              : "Generate Payroll"}
          </button>

        </div>

      </div>

      {/* ======================================================
          STATISTICS
          ====================================================== */}

      <section className="payroll-stats">

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon blue">
            <FaUsers />
          </div>

          <div className="payroll-stat-content">

            <span>
              Total Employees
            </span>

            <strong>
              {totalEmployees}
            </strong>

            <small>
              Employees in payroll
            </small>

          </div>

        </div>

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon green">
            <FaCheckCircle />
          </div>

          <div className="payroll-stat-content">

            <span>
              Paid
            </span>

            <strong>
              {paidEmployees}
            </strong>

            <small>
              Payroll processed
            </small>

          </div>

        </div>

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon orange">
            <FaClock />
          </div>

          <div className="payroll-stat-content">

            <span>
              Pending
            </span>

            <strong>
              {pendingEmployees}
            </strong>

            <small>
              Awaiting processing
            </small>

          </div>

        </div>

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon purple">
            <FaMoneyBillWave />
          </div>

          <div className="payroll-stat-content">

            <span>
              Total Payroll
            </span>

            <strong>
              {formatCurrency(
                totalPayroll
              )}
            </strong>

            <small>
              Annual salary total
            </small>

          </div>

        </div>

      </section>

      {/* ======================================================
          PAYROLL CARD
          ====================================================== */}

      <section className="payroll-card">

        <div className="payroll-toolbar">

          <div>

            <h2>
              Employee Payroll
            </h2>

            <p>
              Salary and payment information.
            </p>

          </div>

          <div className="payroll-search">

            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search employee..."
            />

          </div>

        </div>

        {/* ====================================================
            TABLE
            ==================================================== */}

        <div className="payroll-table-wrapper">

          <table className="payroll-table">

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Department
                </th>

                <th>
                  Position
                </th>

                <th>
                  Annual Salary
                </th>

                <th>
                  Bonus
                </th>

                <th>
                  Deductions
                </th>

                <th>
                  Net Salary
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

              {loading ? (

                <tr>

                  <td
                    colSpan="9"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px",
                    }}
                  >
                    Loading payroll records...
                  </td>

                </tr>

              ) : filteredPayroll.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px",
                    }}
                  >

                    <FaMoneyBillWave />

                    <div>
                      No payroll records found.
                    </div>

                  </td>

                </tr>

              ) : (

                filteredPayroll.map(
                  (employee) => (

                    <tr
                      key={
                        employee._id
                      }
                    >

                      <td>

                        <strong>
                          {employee.employeeName ||
                            "Unknown Employee"}
                        </strong>

                      </td>

                      <td>

                        <span className="department-badge">

                          {employee.department ||
                            "-"}

                        </span>

                      </td>

                      <td>
                        {employee.position ||
                          "-"}
                      </td>

                      <td>
                        {formatCurrency(
                          employee.salary
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          employee.bonus
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          employee.deductions
                        )}
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            calculateNetSalary(
                              employee
                            )
                          )}
                        </strong>

                      </td>

                      <td>

                        <span
                          className={`payroll-status ${
                            String(
                              employee.status ||
                                "Pending"
                            ).toLowerCase()
                          }`}
                        >
                          {employee.status ||
                            "Pending"}
                        </span>

                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            gap: "8px",
                          }}
                        >

                          <button
                            type="button"
                            title="Edit Payroll"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                            style={{
                              width:
                                "34px",
                              height:
                                "34px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "none",
                              borderRadius:
                                "7px",
                              cursor:
                                "pointer",
                              background:
                                "#eff6ff",
                              color:
                                "#2563eb",
                            }}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            title="Delete Payroll"
                            onClick={() =>
                              deletePayroll(
                                employee._id
                              )
                            }
                            style={{
                              width:
                                "34px",
                              height:
                                "34px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "none",
                              borderRadius:
                                "7px",
                              cursor:
                                "pointer",
                              background:
                                "#fef2f2",
                              color:
                                "#dc2626",
                            }}
                          >
                            <FaTrash />
                          </button>

                        </div>

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
          ADD / EDIT PAYROLL MODAL
          ====================================================== */}

      {showModal && (

        <div
          className="leave-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="leave-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="leave-modal-header">

              <div>

                <h2>
                  {editingPayroll
                    ? "Edit Payroll"
                    : "Generate Payroll"}
                </h2>

                <p>
                  {editingPayroll
                    ? "Update payroll information."
                    : "Create payroll for an employee."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            {/* ==================================================
                FORM
                ================================================== */}

            <form
              className="leave-form"
              onSubmit={handleSubmit}
            >

              {/* EMPLOYEE */}

              <div className="leave-form-group">

                <label>
                  Employee
                </label>

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={
                    handleEmployeeChange
                  }
                  required
                >

                  <option value="">
                    Select employee
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
                          employee.employeeName ||
                          ""}{" "}

                        {employee.lastName ||
                          ""}

                        {employee.employeeId
                          ? ` (${employee.employeeId})`
                          : ""}

                      </option>

                    )
                  )}

                </select>

              </div>

              {/* SALARY */}

              <div className="leave-form-group">

                <label>
                  Annual Salary
                </label>

                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  min="0"
                  required
                />

              </div>

              {/* BONUS */}

              <div className="leave-form-group">

                <label>
                  Bonus
                </label>

                <input
                  type="number"
                  name="bonus"
                  value={form.bonus}
                  onChange={handleChange}
                  min="0"
                />

              </div>

              {/* DEDUCTIONS */}

              <div className="leave-form-group">

                <label>
                  Deductions
                </label>

                <input
                  type="number"
                  name="deductions"
                  value={
                    form.deductions
                  }
                  onChange={handleChange}
                  min="0"
                />

              </div>

              {/* MONTH */}

              <div className="leave-form-group">

                <label>
                  Payroll Month
                </label>

                <input
                  type="month"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* STATUS */}

              <div className="leave-form-group">

                <label>
                  Payment Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                </select>

              </div>

              {/* NET SALARY */}

              <div
                style={{
                  padding:
                    "14px 16px",
                  borderRadius:
                    "10px",
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  color:
                    "#1e3a8a",
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                }}
              >

                Net Salary:{" "}

                {formatCurrency(
                  Number(
                    form.salary || 0
                  ) +
                    Number(
                      form.bonus || 0
                    ) -
                    Number(
                      form.deductions ||
                        0
                    )
                )}

              </div>

              {/* BUTTONS */}

              <div className="leave-form-actions">

                <button
                  type="button"
                  className="leave-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPayroll
                    ? "Update Payroll"
                    : "Generate Payroll"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Payroll;