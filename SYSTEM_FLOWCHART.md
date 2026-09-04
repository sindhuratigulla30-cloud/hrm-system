# HRM System - Application Flowchart & Architecture

## 🎯 System Flow Overview

```
                        ┌──────────────────┐
                        │   HRM SYSTEM     │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐        ┌──────▼──────────┐
            │  EMPLOYEE PATH │        │   ADMIN PATH    │
            └───────┬────────┘        └──────┬──────────┘
                    │                         │
         ┌──────────▼──────────┐    ┌────────▼────────────┐
         │ Employee Register   │    │  Admin/HR Login     │
         │  (Self Sign-up)     │    │  (Credentials)      │
         └──────────┬──────────┘    └────────┬────────────┘
                    │                         │
         ┌──────────▼──────────────────┬─────▼────────────┐
         │  Employee Dashboard         │  Admin Dashboard │
         │  (Personal Portal)          │  (Management)    │
         └──────────┬──────────────────┴─────┬────────────┘
                    │                         │
    ┌───────────────┼───────────────┐   ┌────┼────────────┐
    │               │               │   │    │            │
    ▼               ▼               ▼   ▼    ▼            ▼
 Clock In      Clock Out       My Activity View All  Manage Leave Manage
                               Report      Employees Requests  Payroll
    │               │               │   │    │            │
    ├───────────────┴───────────────┤   └────┴────────────┘
    │                               │
    ▼                               ▼
Working Hours               Download Report
Attendance Log              (PDF/Excel)
Leave Requests
Payroll Info
```

---

## 📋 Detailed User Flows

### A. EMPLOYEE REGISTRATION FLOW

```
┌─────────────────────┐
│  Landing Page       │
└────────┬────────────┘
         │
         ├─► [Employee Register Button]
         │
         ▼
┌─────────────────────────────────────────┐
│  Employee Registration Form             │
│  ├─ First Name                          │
│  ├─ Last Name                           │
│  ├─ Email                               │
│  ├─ Password (with strength indicator)  │
│  ├─ Confirm Password                    │
│  ├─ Phone                               │
│  ├─ Department (optional)               │
│  ├─ Position (optional)                 │
│  └─ Address (optional)                  │
└────────┬────────────────────────────────┘
         │
    ┌────▼─────┐
    │  VALIDATE │
    └────┬─────┘
         │
    ┌────▼────────────┐
    │ Success? (Yes)  │
    │ (No → Error)    │
    └────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│  Account Created         │
│  "Login with credentials"│
└────┬───────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Redirect to Login Page  │
└────┬───────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Employee Dashboard      │
└──────────────────────────┘
```

### B. ADMIN/HR LOGIN FLOW

```
┌──────────────────┐
│  Landing Page    │
└────────┬─────────┘
         │
         ├─► [HR Login Button]
         │
         ▼
┌──────────────────────┐
│  Admin Login Form    │
│  ├─ Email            │
│  └─ Password         │
└────────┬─────────────┘
         │
    ┌────▼──────────────┐
    │  VALIDATE & AUTH   │
    └────┬──────────────┘
         │
    ┌────▼────────────────┐
    │ Role Check: Admin?  │
    │ (Yes) (No→Error)    │
    └────┬───────────────┘
         │
         ▼
┌─────────────────────┐
│  Admin Dashboard    │
└─────────────────────┘
```

### C. EMPLOYEE DASHBOARD FLOW

```
┌──────────────────────────────────┐
│  EMPLOYEE DASHBOARD              │
│  Welcome: [Employee Name]        │
└────────────┬─────────────────────┘
             │
    ┌────────┼────────┬──────────────┬────────────┐
    │        │        │              │            │
    ▼        ▼        ▼              ▼            ▼
┌─────┐ ┌────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐
│Clock│ │Clock   │ │My        │ │My Leave │ │My      │
│In   │ │Out     │ │Activity  │ │Requests │ │Payroll │
│     │ │        │ │Report    │ │         │ │        │
└─────┘ └────────┘ └────┬─────┘ └─────────┘ └────────┘
  │        │            │
  └────┬───┴────────────┘
       │
       ▼
┌──────────────────────────┐
│  Activity Summary        │
│  ├─ Today's Hours        │
│  ├─ This Week Attendance │
│  ├─ Pending Leave        │
│  └─ Payroll Status       │
└──────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Download Report         │
│  ├─ Attendance Report    │
│  ├─ PDF Export           │
│  └─ Excel Export         │
└──────────────────────────┘
```

### D. ADMIN DASHBOARD FLOW

```
┌──────────────────────────────────────────┐
│  ADMIN/HR DASHBOARD                      │
│  Welcome: [Admin Name] | Logout          │
└────────────┬─────────────────────────────┘
             │
    ┌────────┼────────┬──────────────┬────────────┐
    │        │        │              │            │
    ▼        ▼        ▼              ▼            ▼
┌─────────────┐ ┌──────────────┐ ┌────────┐ ┌──────────┐
│View All     │ │Attendance    │ │Leave   │ │Payroll   │
│Employees    │ │Management    │ │Request │ │          │
│             │ │              │ │Approval│ │Management│
└────┬────────┘ └──────┬───────┘ └────┬───┘ └──────────┘
     │                 │              │
     ▼                 ▼              ▼
┌─────────────────────┐ ┌──────┐ ┌──────────────┐
│All Employees List   │ │Filter│ │Update Status │
│ ├─ Search           │ │By    │ │Mark Present/ │
│ ├─ Filter           │ │Status│ │Absent/HalfDay│
│ ├─ Sort             │ │      │ │              │
│ └─ Edit/Delete      │ └──────┘ └──────────────┘
└─────────────────────┘
```

---

## 🏗️ Component Architecture

```
App.jsx (Main Router)
│
├─── Landing Page
│    ├─── [Employee Register Button] → EmployeeRegister
│    └─── [Admin Login Button] → AdminLogin
│
├─── EmployeeRegister.jsx
│    └─── Form Validation
│         └─ Success → Employee Login
│
├─── Login.jsx (Employee Login)
│    └─── Authentication
│         └─ Success → EmployeeDashboard
│
├─── AdminLogin.jsx
│    └─── Admin Authentication
│         └─ Success → AdminDashboard
│
├─── EmployeeDashboard.jsx
│    ├─── Header (Name, Logout)
│    ├─── Navigation (Clock In/Out, My Activity, Leave, Payroll)
│    ├─── AttendanceCard
│    │    ├─ Clock In Button
│    │    ├─ Clock Out Button
│    │    └─ Today's Hours
│    ├─── ActivityReport
│    │    ├─ Working Hours
│    │    ├─ Attendance Log
│    │    └─ Download Report
│    ├─── LeaveRequests
│    │    ├─ Submit Request
│    │    └─ View Status
│    └─── PayrollInfo
│         └─ View Salary Details
│
└─── AdminDashboard (in App.jsx)
     ├─── Header (Name, Logout)
     ├─── Navigation (Employees, Attendance, Leave, Payroll)
     ├─── EmployeesList
     │    ├─ Search & Filter
     │    ├─ Sort
     │    └─ Edit/Delete
     ├─── AttendanceManagement
     │    ├─ View All Attendance
     │    ├─ Update Status
     │    └─ Generate Reports
     ├─── LeaveManagement
     │    ├─ View Requests
     │    └─ Approve/Reject
     └─── PayrollManagement
          ├─ Create Payroll
          ├─ View Records
          └─ Generate Reports
```

---

## 🔐 Authentication & Authorization

```
┌─────────────────────────┐
│  User Login             │
│  (Email + Password)     │
└────────┬────────────────┘
         │
    ┌────▼─────────────┐
    │  Authenticate    │
    │  (Backend JWT)   │
    └────┬─────────────┘
         │
    ┌────▼──────────────────┐
    │ Check User Role       │
    └────┬────────┬─────────┘
         │        │
    ┌────▼──┐  ┌──▼────────┐
    │Employee│  │Admin/HR   │
    └────┬───┘  └──┬────────┘
         │         │
    ┌────▼───────────▼────┐
    │ Store Token + Role  │
    │ in localStorage     │
    └────┬────────────────┘
         │
    ┌────▼──────────────────┐
    │ Redirect to           │
    │ Appropriate Dashboard │
    └──────────────────────┘
```

---

## 📊 Data Flow

### Attendance Tracking
```
Employee Click "Clock In"
        ↓
Send Timestamp to Backend
        ↓
Backend Records Login Time
        ↓
Employee Dashboard Shows "Checked In"
        ↓
Employee Sees Working Hours Updating
        ↓
Employee Click "Clock Out"
        ↓
Send Logout Timestamp
        ↓
Backend Calculates Working Hours
        ↓
Dashboard Shows Total Hours
        ↓
Can Download Report (PDF/Excel)
```

### Leave Request Flow
```
Employee Submit Leave Request
        ↓
Backend Stores Request (Pending Status)
        ↓
Admin Notified (in Admin Dashboard)
        ↓
Admin Reviews & Approves/Rejects
        ↓
Employee Notification (Approved/Rejected)
        ↓
Calendar Updated if Approved
        ↓
Attendance Marked as "Leave" on that date
```

### Payroll Processing
```
Admin Create Payroll Record
        ↓
Backend Calculates (Salary - Deductions)
        ↓
Admin Reviews & Confirms
        ↓
Employee Sees Payroll in Dashboard
        ↓
Employee Can Download Payslip (PDF)
        ↓
Record Stored in History
```

---

## 🎯 User Roles & Permissions

### EMPLOYEE
```
✅ Can:
  ├─ Register self
  ├─ Login
  ├─ View own dashboard
  ├─ Clock in/out
  ├─ View own attendance
  ├─ Submit leave requests
  ├─ View leave status
  ├─ View own payroll
  └─ Download own reports

❌ Cannot:
  ├─ View other employees
  ├─ Approve own leave
  ├─ Edit payroll
  ├─ Delete records
  └─ Access admin features
```

### ADMIN/HR
```
✅ Can:
  ├─ Login
  ├─ View all employees
  ├─ Search/filter employees
  ├─ View all attendance
  ├─ Update attendance status
  ├─ Review leave requests
  ├─ Approve/reject leaves
  ├─ Create payroll
  ├─ View payroll records
  ├─ Generate reports
  └─ Export data (PDF/Excel)

❌ Cannot:
  ├─ Delete employees (permanent)
  ├─ Modify system config
  └─ Access server logs
```

---

## 📱 UI/UX Structure

### Page Layout (Standard)
```
┌─────────────────────────────────────┐
│  HEADER                             │
│  Logo | Page Title | User Name | Logout
├─────────────────────────────────────┤
│  SIDEBAR (Optional)                 │
│  • Navigation Menu                  │
│  • Active Indicator                 │
├─────────────────────────────────────┤
│  MAIN CONTENT AREA                  │
│                                     │
│  • Cards                            │
│  • Tables                           │
│  • Forms                            │
│  • Charts                           │
│                                     │
├─────────────────────────────────────┤
│  FOOTER (Optional)                  │
│  © 2026 HRM System                  │
└─────────────────────────────────────┘
```

### Color Scheme
```
Primary Color:    #2563eb (Blue)
Secondary Color:  #1e40af (Dark Blue)
Success Color:    #10b981 (Green)
Warning Color:    #f59e0b (Orange)
Error Color:      #ef4444 (Red)
Background:       #f4f7fc (Light Gray)
Text:             #071a3d (Dark Blue)
Light Text:       #64748b (Gray)
```

---

## 🔄 State Management

```
App.jsx (Global State)
├─ token (JWT Token)
├─ user (User Object: name, email, role)
├─ loading (Loading State)
└─ loginType (employee/admin)

EmployeeDashboard (Local State)
├─ attendanceHistory
├─ todayAttendance
├─ leaveRequests
├─ payrollInfo
└─ currentTime

AdminDashboard (Local State)
├─ allEmployees
├─ attendanceRecords
├─ leaveRequests
├─ payrollRecords
└─ filters
```

---

## 🚀 Next Steps & Enhancement

### Phase 1 (Current)
- ✅ User Authentication
- ✅ Employee Registration
- ✅ Basic Dashboards
- ✅ Attendance Tracking

### Phase 2 (Recommended)
- 📱 Mobile Responsive Optimization
- 📊 Enhanced Charts & Analytics
- 🔔 Notifications (Email/In-app)
- 📁 Document Management

### Phase 3 (Future)
- 🤖 AI-based Analytics
- 🔗 Integration with Payroll Systems
- 📞 Video Call Features
- 🌍 Multi-language Support

---

**This architecture ensures a professional, scalable, and user-friendly HRM system!** 🎉
