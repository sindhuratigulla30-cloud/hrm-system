import { useEffect, useMemo, useState } from "react";
import {
  FaClipboardList,
  FaPlus,
  FaSearch,
  FaCheck,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import "./LeaveRequests.css";

import { API_URL } from "../config";

const emptyForm = {
  employeeId: "",
  leaveType: "Casual Leave",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  reason: "",
};

function LeaveRequests({ employees = [], token }) {
  // ============================================================
  // STATE
  // ============================================================

  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // ============================================================
  // GET CURRENT AUTH TOKEN
  // ============================================================

  const getToken = () => {
    return token || localStorage.getItem("token");
  };

  // ============================================================
  // LOGOUT WHEN TOKEN IS INVALID / EXPIRED
  // ============================================================

  const logoutUser = () => {
    localStorage.removeItem("token");

    // Remove other common auth values if they exist
    localStorage.removeItem("user");

    alert("Your session has expired. Please login again.");

    // Redirect to login page if your application has one.
    // If there is no /login route, reload keeps the existing
    // App.jsx structure unchanged.
    window.location.href = "/login";
  };

  // ============================================================
  // AUTHENTICATED API REQUEST
  // ============================================================

  const apiRequest = async (url, options = {}) => {
    const currentToken = getToken();

    if (!currentToken) {
      logoutUser();
      return null;
    }

    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
      Authorization: `Bearer ${currentToken}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Token expired / invalid
    if (response.status === 401) {
      logoutUser();
      return null;
    }

    return response;
  };

  // ============================================================
  // LOAD LEAVE REQUESTS - GET
  // ============================================================

  const loadRequests = async () => {
    const currentToken = getToken();

    if (!currentToken) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(
        `${API_URL}/api/leave-requests`,
        {
          method: "GET",
        }
      );

      // User was logged out because token was invalid
      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load leave requests."
        );
      }

      setRequests(
        Array.isArray(data.leaveRequests)
          ? data.leaveRequests
          : []
      );
    } catch (error) {
      console.error("Leave request loading error:", error);

      setRequests([]);

      alert(
        error.message || "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD REQUESTS WHEN TOKEN IS AVAILABLE
  // ============================================================

  useEffect(() => {
    if (getToken()) {
      loadRequests();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ============================================================
  // OPEN NEW LEAVE REQUEST MODAL
  // ============================================================

  const openModal = () => {
    if (!getToken()) {
      alert("Please login before creating a leave request.");
      return;
    }

    setForm({
      ...emptyForm,
      employeeId: employees.length
        ? String(
            employees[0]._id ||
              employees[0].id ||
              ""
          )
        : "",
    });

    setShowModal(true);
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
  // SUBMIT LEAVE REQUEST - POST
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentToken = getToken();

    if (!currentToken) {
      alert("Authentication required. Please login again.");
      return;
    }

    if (!form.employeeId) {
      alert("Please select an employee.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      alert("Please select start and end dates.");
      return;
    }

    if (
      new Date(form.endDate) <
      new Date(form.startDate)
    ) {
      alert("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const response = await apiRequest(
        `${API_URL}/api/leave-requests`,
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );

      // Token expired / invalid
      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit leave request."
        );
      }

      setShowModal(false);

      setForm({
        ...emptyForm,
        employeeId: "",
      });

      await loadRequests();

      alert(
        "Leave request submitted successfully."
      );
    } catch (error) {
      console.error(
        "Leave request save error:",
        error
      );

      alert(
        error.message ||
          "Unable to submit leave request."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // UPDATE LEAVE REQUEST STATUS - PUT
  // ============================================================

  const updateStatus = async (id, status) => {
    const currentToken = getToken();

    if (!currentToken) {
      alert(
        "Authentication required. Please login again."
      );
      return;
    }

    try {
      const response = await apiRequest(
        `${API_URL}/api/leave-requests/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        }
      );

      // Token expired / invalid
      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update request."
        );
      }

      await loadRequests();

      alert(
        `Leave request ${status.toLowerCase()} successfully.`
      );
    } catch (error) {
      console.error(
        "Leave status error:",
        error
      );

      alert(
        error.message ||
          "Unable to update request."
      );
    }
  };

  // ============================================================
  // DELETE LEAVE REQUEST - DELETE
  // ============================================================

  const deleteRequest = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    const currentToken = getToken();

    if (!currentToken) {
      alert(
        "Authentication required. Please login again."
      );
      return;
    }

    try {
      const response = await apiRequest(
        `${API_URL}/api/leave-requests/${id}`,
        {
          method: "DELETE",
        }
      );

      // Token expired / invalid
      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete request."
        );
      }

      await loadRequests();

      alert(
        "Leave request deleted successfully."
      );
    } catch (error) {
      console.error(
        "Leave delete error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete request."
      );
    }
  };

  // ============================================================
  // FILTER REQUESTS
  // ============================================================

  const filteredRequests = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return requests;
    }

    return requests.filter((request) => {
      const searchText = `
        ${request.employeeName || ""}
        ${request.leaveType || ""}
        ${request.status || ""}
        ${request.reason || ""}
      `.toLowerCase();

      return searchText.includes(text);
    });
  }, [requests, search]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="leave-page">

      {/* PAGE HEADER */}

      <header className="leave-header">
        <div>
          <h1>Leave Requests</h1>

          <p>
            Manage employee leave requests.
          </p>
        </div>

        <button
          type="button"
          className="leave-add-button"
          onClick={openModal}
          disabled={!employees.length}
        >
          <FaPlus />

          <span>
            New Leave Request
          </span>
        </button>
      </header>

      {/* STATISTICS */}

      <section className="leave-stats">

        <div className="leave-stat">
          <span>Total Requests</span>

          <strong>
            {requests.length}
          </strong>
        </div>

        <div className="leave-stat pending">
          <span>Pending</span>

          <strong>
            {
              requests.filter(
                (request) =>
                  request.status === "Pending"
              ).length
            }
          </strong>
        </div>

        <div className="leave-stat approved">
          <span>Approved</span>

          <strong>
            {
              requests.filter(
                (request) =>
                  request.status === "Approved"
              ).length
            }
          </strong>
        </div>

        <div className="leave-stat rejected">
          <span>Rejected</span>

          <strong>
            {
              requests.filter(
                (request) =>
                  request.status === "Rejected"
              ).length
            }
          </strong>
        </div>

      </section>

      {/* LEAVE REQUEST TABLE */}

      <section className="leave-card">

        <div className="leave-toolbar">

          <div>
            <h2>
              Leave Requests
            </h2>

            <p>
              Employee leave history and approvals.
            </p>
          </div>

          <div className="leave-search">
            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search leave requests..."
            />
          </div>

        </div>

        <div className="leave-table-wrapper">

          <table className="leave-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="leave-empty"
                  >
                    Loading leave requests...
                  </td>
                </tr>

              ) : filteredRequests.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="leave-empty"
                  >
                    <FaClipboardList />

                    <strong>
                      No leave requests
                    </strong>

                    <span>
                      Click "New Leave Request" to add one.
                    </span>
                  </td>
                </tr>

              ) : (

                filteredRequests.map(
                  (request) => (

                    <tr
                      key={request._id}
                    >

                      <td>
                        <strong>
                          {request.employeeName ||
                            "Unknown Employee"}
                        </strong>
                      </td>

                      <td>
                        {request.leaveType}
                      </td>

                      <td>
                        {formatDate(
                          request.startDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          request.endDate
                        )}
                      </td>

                      <td className="leave-reason">
                        {request.reason || "-"}
                      </td>

                      <td>
                        <span
                          className={`leave-status ${
                            String(
                              request.status || ""
                            ).toLowerCase()
                          }`}
                        >
                          {request.status ||
                            "Pending"}
                        </span>
                      </td>

                      <td>

                        <div className="leave-actions">

                          {request.status ===
                            "Pending" && (
                            <>
                              <button
                                type="button"
                                className="leave-action approve"
                                title="Approve"
                                onClick={() =>
                                  updateStatus(
                                    request._id,
                                    "Approved"
                                  )
                                }
                              >
                                <FaCheck />
                              </button>

                              <button
                                type="button"
                                className="leave-action reject"
                                title="Reject"
                                onClick={() =>
                                  updateStatus(
                                    request._id,
                                    "Rejected"
                                  )
                                }
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="leave-action delete"
                            title="Delete"
                            onClick={() =>
                              deleteRequest(
                                request._id
                              )
                            }
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

      {/* NEW LEAVE REQUEST MODAL */}

      {showModal && (

        <div
          className="leave-modal-overlay"
          onClick={() =>
            !saving &&
            setShowModal(false)
          }
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
                  New Leave Request
                </h2>

                <p>
                  Submit a leave request for an employee.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  !saving &&
                  setShowModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

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
                  onChange={handleChange}
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
                        {employee.firstName}{" "}
                        {employee.lastName}{" "}
                        (
                        {employee.employeeId}
                        )
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* LEAVE TYPE */}

              <div className="leave-form-group">

                <label>
                  Leave Type
                </label>

                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                >

                  <option value="Casual Leave">
                    Casual Leave
                  </option>

                  <option value="Sick Leave">
                    Sick Leave
                  </option>

                  <option value="Earned Leave">
                    Earned Leave
                  </option>

                  <option value="Unpaid Leave">
                    Unpaid Leave
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* DATES */}

              <div className="leave-form-row">

                <div className="leave-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="leave-form-group">

                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* REASON */}

              <div className="leave-form-group">

                <label>
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave..."
                  rows="4"
                />

              </div>

              {/* BUTTONS */}

              <div className="leave-form-actions">

                <button
                  type="button"
                  className="leave-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
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
                    ? "Submitting..."
                    : "Submit Request"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default LeaveRequests;