import React, { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import "./Payroll.css";

const Payroll = ({
  user,
  token,
  apiUrl,
  employees = [],
}) => {
  // ============================================================
  // STATE
  // ============================================================

  const [payrollData, setPayrollData] = useState([]);

  const [search, setSearch] = useState("");

  const [editingPayroll, setEditingPayroll] =
    useState(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [deletePayroll, setDeletePayroll] =
    useState(null);

  const [editForm, setEditForm] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    bonus: "",
    status: "Pending",
  });

  // ============================================================
  // CREATE PAYROLL RECORDS FROM EMPLOYEES
  // ============================================================

  useEffect(() => {
    setPayrollData((previousPayroll) => {
      return employees.map((employee) => {
        const employeeKey =
          employee._id ||
          employee.employeeId;

        const existingRecord =
          previousPayroll.find(
            (record) =>
              record.employeeKey ===
              employeeKey
          );

        if (existingRecord) {
          return {
            ...existingRecord,

            employeeKey,

            employeeId:
              employee.employeeId ||
              existingRecord.employeeId,

            firstName:
              employee.firstName ||
              existingRecord.firstName,

            lastName:
              employee.lastName ||
              existingRecord.lastName,

            email:
              employee.email ||
              existingRecord.email,

            department:
              employee.department ||
              existingRecord.department,
          };
        }

        return {
          employeeKey,

          employeeId:
            employee.employeeId || "—",

          firstName:
            employee.firstName || "",

          lastName:
            employee.lastName || "",

          email:
            employee.email || "",

          department:
            employee.department || "—",

          position:
            employee.position || "—",

          basicSalary:
            Number(employee.salary || 0),

          allowances: 0,

          deductions: 0,

          bonus: 0,

          status: "Pending",
        };
      });
    });
  }, [employees]);

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  const getEmployeeName = (record) => {
    const name =
      `${record?.firstName || ""} ${
        record?.lastName || ""
      }`.trim();

    return name || "Unknown Employee";
  };

  // ============================================================
  // EMPLOYEE INITIALS
  // ============================================================

  const getInitials = (record) => {
    const first =
      record?.firstName?.charAt(0) || "";

    const last =
      record?.lastName?.charAt(0) || "";

    return (
      `${first}${last}`.toUpperCase() || "E"
    );
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // ============================================================
  // CALCULATE GROSS SALARY
  // ============================================================

  const getGrossSalary = (record) => {
    return (
      Number(record.basicSalary || 0) +
      Number(record.allowances || 0) +
      Number(record.bonus || 0)
    );
  };

  // ============================================================
  // CALCULATE NET SALARY
  // ============================================================

  const getNetSalary = (record) => {
    return (
      getGrossSalary(record) -
      Number(record.deductions || 0)
    );
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredPayroll = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    if (!searchValue) {
      return payrollData;
    }

    return payrollData.filter((record) => {
      const employeeName =
        getEmployeeName(record).toLowerCase();

      const employeeId =
        String(
          record.employeeId || ""
        ).toLowerCase();

      const email =
        String(
          record.email || ""
        ).toLowerCase();

      const department =
        String(
          record.department || ""
        ).toLowerCase();

      return (
        employeeName.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        email.includes(searchValue) ||
        department.includes(searchValue)
      );
    });
  }, [payrollData, search]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalPayrollEmployees =
    payrollData.length;

  const totalNetPayroll =
    payrollData.reduce(
      (total, record) =>
        total + getNetSalary(record),
      0
    );

  const processedPayroll =
    payrollData.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "processed"
    ).length;

  const pendingPayroll =
    payrollData.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "pending"
    ).length;

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleEdit = (record) => {
    setEditingPayroll(record);

    setEditForm({
      basicSalary:
        record.basicSalary ?? 0,

      allowances:
        record.allowances ?? 0,

      deductions:
        record.deductions ?? 0,

      bonus:
        record.bonus ?? 0,

      status:
        record.status || "Pending",
    });

    setShowEditModal(true);
  };

  // ============================================================
  // CLOSE EDIT MODAL
  // ============================================================

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPayroll(null);

    setEditForm({
      basicSalary: "",
      allowances: "",
      deductions: "",
      bonus: "",
      status: "Pending",
    });
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SAVE PAYROLL
  // ============================================================

  const handleSavePayroll = (event) => {
    event.preventDefault();

    if (!editingPayroll) {
      return;
    }

    setPayrollData((previous) =>
      previous.map((record) => {
        if (
          record.employeeKey !==
          editingPayroll.employeeKey
        ) {
          return record;
        }

        return {
          ...record,

          basicSalary:
            Number(
              editForm.basicSalary || 0
            ),

          allowances:
            Number(
              editForm.allowances || 0
            ),

          deductions:
            Number(
              editForm.deductions || 0
            ),

          bonus:
            Number(
              editForm.bonus || 0
            ),

          status:
            editForm.status,
        };
      })
    );

    closeEditModal();
  };

  // ============================================================
  // OPEN DELETE CONFIRMATION
  // ============================================================

  const handleDeleteClick = (record) => {
    setDeletePayroll(record);
  };

  // ============================================================
  // CLOSE DELETE CONFIRMATION
  // ============================================================

  const closeDeleteModal = () => {
    setDeletePayroll(null);
  };

  // ============================================================
  // DELETE PAYROLL RECORD
  // ============================================================

  const handleDeletePayroll = () => {
    if (!deletePayroll) {
      return;
    }

    setPayrollData((previous) =>
      previous.filter(
        (record) =>
          record.employeeKey !==
          deletePayroll.employeeKey
      )
    );

    setDeletePayroll(null);
  };

  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const clearSearch = () => {
    setSearch("");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="payroll-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="payroll-page-header">

        <div className="payroll-header-content">

          <div className="payroll-title-area">

            <div className="payroll-title-icon">
              <FaMoneyBillWave />
            </div>

            <div>
              <h1>
                Payroll Management
              </h1>

              <p>
                Manage employee salaries and compensation.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="payroll-stats-grid">

        {/* TOTAL EMPLOYEES */}

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon blue">
            <FaUsers />
          </div>

          <div className="payroll-stat-content">

            <span>
              Total Employees
            </span>

            <strong>
              {totalPayrollEmployees}
            </strong>

            <small>
              Employees in payroll
            </small>

          </div>

        </div>

        {/* TOTAL PAYROLL */}

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon green">
            <FaMoneyBillWave />
          </div>

          <div className="payroll-stat-content">

            <span>
              Total Payroll
            </span>

            <strong>
              {formatCurrency(
                totalNetPayroll
              )}
            </strong>

            <small>
              Current net payroll
            </small>

          </div>

        </div>

        {/* PROCESSED */}

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon purple">
            <FaCheckCircle />
          </div>

          <div className="payroll-stat-content">

            <span>
              Processed
            </span>

            <strong>
              {processedPayroll}
            </strong>

            <small>
              Payroll processed
            </small>

          </div>

        </div>

        {/* PENDING */}

        <div className="payroll-stat-card">

          <div className="payroll-stat-icon orange">
            <FaClock />
          </div>

          <div className="payroll-stat-content">

            <span>
              Pending
            </span>

            <strong>
              {pendingPayroll}
            </strong>

            <small>
              Awaiting processing
            </small>

          </div>

        </div>

      </div>

      {/* ======================================================
          PAYROLL CARD
      ====================================================== */}

      <div className="payroll-card">

        {/* CARD HEADER */}

        <div className="payroll-card-header">

          <div>

            <h2>
              Payroll Records
            </h2>

            <p>
              {filteredPayroll.length} payroll records found
            </p>

          </div>

          {/* SEARCH */}

          <div className="payroll-search-box">

            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search employees..."
            />

            {search && (
              <button
                type="button"
                className="payroll-clear-search"
                onClick={clearSearch}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}

          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        {filteredPayroll.length === 0 ? (

          <div className="payroll-empty-state">

            <div className="payroll-empty-icon">
              <FaMoneyBillWave />
            </div>

            <h3>
              No Payroll Records Found
            </h3>

            <p>
              {search
                ? "No payroll records match your search."
                : "Payroll records will appear when employees are available."}
            </p>

          </div>

        ) : (

          <div className="payroll-table-wrapper">

            <table className="payroll-table">

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
                    BASIC SALARY
                  </th>

                  <th>
                    ALLOWANCES
                  </th>

                  <th>
                    DEDUCTIONS
                  </th>

                  <th>
                    BONUS
                  </th>

                  <th>
                    NET SALARY
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

                {filteredPayroll.map(
                  (record) => (

                    <tr
                      key={
                        record.employeeKey
                      }
                    >

                      {/* EMPLOYEE */}

                      <td>

                        <div className="payroll-employee-cell">

                          <div className="payroll-avatar">
                            {getInitials(
                              record
                            )}
                          </div>

                          <div className="payroll-employee-details">

                            <strong>
                              {getEmployeeName(
                                record
                              )}
                            </strong>

                            <span>
                              {record.email ||
                                "—"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMPLOYEE ID */}

                      <td>

                        <span className="payroll-employee-id">
                          {record.employeeId ||
                            "—"}
                        </span>

                      </td>

                      {/* DEPARTMENT */}

                      <td>

                        <span className="payroll-department">
                          {record.department ||
                            "—"}
                        </span>

                      </td>

                      {/* BASIC SALARY */}

                      <td>

                        <strong className="payroll-money">
                          {formatCurrency(
                            record.basicSalary
                          )}
                        </strong>

                      </td>

                      {/* ALLOWANCES */}

                      <td>

                        <span className="payroll-positive">
                          +{formatCurrency(
                            record.allowances
                          )}
                        </span>

                      </td>

                      {/* DEDUCTIONS */}

                      <td>

                        <span className="payroll-negative">
                          -{formatCurrency(
                            record.deductions
                          )}
                        </span>

                      </td>

                      {/* BONUS */}

                      <td>

                        <span className="payroll-positive">
                          +{formatCurrency(
                            record.bonus
                          )}
                        </span>

                      </td>

                      {/* NET SALARY */}

                      <td>

                        <strong className="payroll-net-salary">
                          {formatCurrency(
                            getNetSalary(
                              record
                            )
                          )}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`payroll-status ${
                            String(
                              record.status ||
                                ""
                            ).toLowerCase() ===
                            "processed"
                              ? "processed"
                              : "pending"
                          }`}
                        >

                          <span className="payroll-status-dot"></span>

                          {record.status ||
                            "Pending"}

                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="payroll-actions">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="payroll-action-btn payroll-edit-btn"
                            title="Edit Payroll"
                            onClick={() =>
                              handleEdit(
                                record
                              )
                            }
                          >
                            <FaEdit />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="payroll-action-btn payroll-delete-btn"
                            title="Delete Payroll"
                            onClick={() =>
                              handleDeleteClick(
                                record
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

      {/* ======================================================
          EDIT PAYROLL MODAL
      ====================================================== */}

      {showEditModal &&
        editingPayroll && (

          <div
            className="payroll-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeEditModal();
              }
            }}
          >

            <div className="payroll-modal">

              {/* MODAL HEADER */}

              <div className="payroll-modal-header">

                <div>

                  <div className="payroll-modal-title-row">

                    <div className="payroll-modal-icon">
                      <FaMoneyBillWave />
                    </div>

                    <div>

                      <h2>
                        Edit Payroll
                      </h2>

                      <p>
                        Update salary and compensation details.
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  className="payroll-modal-close"
                  onClick={
                    closeEditModal
                  }
                  title="Close"
                >
                  <FaTimes />
                </button>

              </div>

              {/* EMPLOYEE */}

              <div className="payroll-modal-employee">

                <div className="payroll-modal-avatar">
                  {getInitials(
                    editingPayroll
                  )}
                </div>

                <div>

                  <strong>
                    {getEmployeeName(
                      editingPayroll
                    )}
                  </strong>

                  <span>
                    {editingPayroll.employeeId ||
                      "—"}
                    {" • "}
                    {editingPayroll.department ||
                      "—"}
                  </span>

                </div>

              </div>

              {/* FORM */}

              <form
                className="payroll-form"
                onSubmit={
                  handleSavePayroll
                }
              >

                <div className="payroll-form-grid">

                  {/* BASIC SALARY */}

                  <div className="payroll-form-group">

                    <label>
                      Basic Salary
                    </label>

                    <div className="payroll-input-wrapper">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="basicSalary"
                        value={
                          editForm.basicSalary
                        }
                        onChange={
                          handleFormChange
                        }
                        min="0"
                      />

                    </div>

                  </div>

                  {/* ALLOWANCES */}

                  <div className="payroll-form-group">

                    <label>
                      Allowances
                    </label>

                    <div className="payroll-input-wrapper">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="allowances"
                        value={
                          editForm.allowances
                        }
                        onChange={
                          handleFormChange
                        }
                        min="0"
                      />

                    </div>

                  </div>

                  {/* DEDUCTIONS */}

                  <div className="payroll-form-group">

                    <label>
                      Deductions
                    </label>

                    <div className="payroll-input-wrapper">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="deductions"
                        value={
                          editForm.deductions
                        }
                        onChange={
                          handleFormChange
                        }
                        min="0"
                      />

                    </div>

                  </div>

                  {/* BONUS */}

                  <div className="payroll-form-group">

                    <label>
                      Bonus
                    </label>

                    <div className="payroll-input-wrapper">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="bonus"
                        value={
                          editForm.bonus
                        }
                        onChange={
                          handleFormChange
                        }
                        min="0"
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="payroll-form-group full-width">

                    <label>
                      Payroll Status
                    </label>

                    <select
                      name="status"
                      value={
                        editForm.status
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Processed">
                        Processed
                      </option>

                    </select>

                  </div>

                </div>

                {/* CALCULATION */}

                <div className="payroll-calculation">

                  <div>

                    <span>
                      Gross Salary
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          editForm.basicSalary ||
                            0
                        ) +
                          Number(
                            editForm.allowances ||
                              0
                          ) +
                          Number(
                            editForm.bonus ||
                              0
                          )
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Deductions
                    </span>

                    <strong className="negative">
                      -{formatCurrency(
                        editForm.deductions
                      )}
                    </strong>

                  </div>

                  <div className="total">

                    <span>
                      Net Salary
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          editForm.basicSalary ||
                            0
                        ) +
                          Number(
                            editForm.allowances ||
                              0
                          ) +
                          Number(
                            editForm.bonus ||
                              0
                          ) -
                          Number(
                            editForm.deductions ||
                              0
                          )
                      )}
                    </strong>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="payroll-modal-actions">

                  <button
                    type="button"
                    className="payroll-cancel-button"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="payroll-save-button"
                  >
                    <FaSave />
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deletePayroll && (

        <div
          className="payroll-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >

          <div className="payroll-delete-modal">

            <div className="payroll-delete-icon">
              <FaTrash />
            </div>

            <h2>
              Delete Payroll Record?
            </h2>

            <p>
              Are you sure you want to delete the payroll record for{" "}
              <strong>
                {getEmployeeName(
                  deletePayroll
                )}
              </strong>
              ?
            </p>

            <span className="payroll-delete-warning">
              This removes only the payroll record. The employee account will not be deleted.
            </span>

            <div className="payroll-delete-actions">

              <button
                type="button"
                className="payroll-cancel-button"
                onClick={
                  closeDeleteModal
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="payroll-confirm-delete"
                onClick={
                  handleDeletePayroll
                }
              >
                <FaTrash />
                Delete Payroll
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Payroll;