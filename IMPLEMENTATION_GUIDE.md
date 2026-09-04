# HRM System - Implementation Guide

## 🎯 How to Implement the Flow in Code

### Current Structure vs Desired Structure

#### Current Implementation
```
App.jsx
├── Shows Login OR Dashboard based on token
├── Admin features in App.jsx (inline)
└── Employee features scattered across components
```

#### Desired Implementation
```
App.jsx (Router)
├── Landing/Home Page
├── Employee Register
├── Employee Login → Employee Dashboard
├── Admin Login → Admin Dashboard
└── Protected Routes (Auth Check)
```

---

## 📁 Recommended File Structure

```
frontend/src/
├── components/
│   ├── Common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── LoadingScreen.jsx
│   │
│   ├── Cards/
│   │   ├── StatCard.jsx
│   │   ├── AttendanceCard.jsx
│   │   └── EmployeeCard.jsx
│   │
│   └── UI/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── Alert.jsx
│
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── AdminLogin.jsx
│   ├── Register.jsx
│   ├── EmployeeDashboard.jsx
│   └── AdminDashboard.jsx
│
├── features/
│   ├── Attendance/
│   │   ├── AttendanceView.jsx
│   │   ├── AttendanceReport.jsx
│   │   └── attendanceAPI.js
│   │
│   ├── LeaveRequests/
│   │   ├── LeaveForm.jsx
│   │   ├── LeaveList.jsx
│   │   └── leaveAPI.js
│   │
│   ├── Payroll/
│   │   ├── PayrollView.jsx
│   │   ├── PayrollReport.jsx
│   │   └── payrollAPI.js
│   │
│   └── Employees/
│       ├── EmployeeList.jsx
│       ├── EmployeeDetail.jsx
│       └── employeeAPI.js
│
├── utils/
│   ├── apiService.js
│   ├── validation.js
│   ├── auth.js
│   └── formatters.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
│
├── context/
│   ├── AuthContext.js
│   └── NotificationContext.js
│
├── App.jsx (Main Router)
├── main.jsx
└── index.css
```

---

## 🔧 Implementation Steps

### Step 1: Create Landing Page Component

**Create: `frontend/src/pages/Landing.jsx`**
```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1>HRM System</h1>
        <p>Human Resource Management Platform</p>
        
        <div className="button-group">
          <button 
            onClick={() => navigate('/register')}
            className="btn-primary"
          >
            Employee Register
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="btn-secondary"
          >
            Employee Login
          </button>
          
          <button 
            onClick={() => navigate('/admin-login')}
            className="btn-admin"
          >
            HR/Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
```

### Step 2: Create Protected Route Component

**Create: `frontend/src/components/ProtectedRoute.jsx`**
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // No token - redirect to landing
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role check if required
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

### Step 3: Reorganize App.jsx with React Router

**Update: `frontend/src/App.jsx`**
```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token && user) {
        try {
          const response = await axios.get(`${API_URL}/api/employees/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.data);
        } catch (error) {
          console.error('Session verification failed');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token, user]);

  const handleLoginSuccess = (receivedToken, receivedUser) => {
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        <Route 
          path="/register" 
          element={<Register apiUrl={API_URL} onSuccess={handleLoginSuccess} />} 
        />
        
        <Route 
          path="/login" 
          element={<Login apiUrl={API_URL} onLoginSuccess={handleLoginSuccess} />} 
        />
        
        <Route 
          path="/admin-login" 
          element={<AdminLogin apiUrl={API_URL} onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* Protected Employee Route */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard 
                user={user}
                token={token}
                apiUrl={API_URL}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard 
                user={user}
                token={token}
                apiUrl={API_URL}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎨 Navigation Structure

### Employee Dashboard Navigation
```
┌──────────────────────────────────────┐
│ Header: HRM System | Welcome [Name]  │
├──────────────────────────────────────┤
│ Tabs/Menu:                           │
│  ├─ Dashboard (Overview)             │
│  ├─ Attendance (Clock In/Out)        │
│  ├─ My Activity (Work Report)        │
│  ├─ Leave Requests                   │
│  ├─ Payroll                          │
│  └─ [Logout Button]                  │
├──────────────────────────────────────┤
│ Main Content Area                    │
│ (Changes based on selected tab)      │
└──────────────────────────────────────┘
```

### Admin Dashboard Navigation
```
┌──────────────────────────────────────┐
│ Header: HR Portal | [Admin Name]     │
├──────────────────────────────────────┤
│ Sidebar/Tabs:                        │
│  ├─ Dashboard (Overview)             │
│  ├─ Employees (Management)           │
│  ├─ Attendance (Monitoring)          │
│  ├─ Leave Requests (Approval)        │
│  ├─ Payroll (Processing)             │
│  └─ Reports (Analytics)              │
│  └─ [Logout Button]                  │
├──────────────────────────────────────┤
│ Main Content Area                    │
│ (Changes based on selected section)  │
└──────────────────────────────────────┘
```

---

## 🛣️ Route Map

```
/                          → Landing Page
/register                  → Employee Registration
/login                     → Employee Login
/admin-login              → Admin Login
/employee-dashboard       → Employee Dashboard (Protected)
/admin-dashboard          → Admin Dashboard (Protected)
```

---

## 📊 Component Communication

```
App.jsx (Main Router & State)
  │
  ├─ Passes: token, user, apiUrl, onLogout
  ├─ Handles: loginSuccess, logout
  │
  ├─► Landing.jsx
  │    └─ Routes to register/login
  │
  ├─► Login.jsx
  │    └─ Calls onLoginSuccess() after auth
  │
  ├─► EmployeeDashboard.jsx
  │    ├─ AttendanceCard (Clock In/Out)
  │    ├─ ActivityReport (Working Hours)
  │    ├─ LeaveRequests (Submit/View)
  │    └─ PayrollInfo (View Salary)
  │
  └─► AdminDashboard.jsx
       ├─ EmployeesList (Manage)
       ├─ AttendanceReport (View/Update)
       ├─ LeaveApproval (Approve/Reject)
       └─ PayrollManagement (Create/View)
```

---

## ✨ Features Implementation

### Clock In/Out System
```
Employee Page: Attendance Tab
    ↓
Shows current status
    ↓
[Clock In Button] (if not clocked in)
    ↓
POST /api/attendance/login
    ↓
Backend records timestamp
    ↓
Frontend updates to show [Clock Out Button]
    ↓
[Clock Out Button]
    ↓
POST /api/attendance/logout
    ↓
Backend calculates hours
    ↓
Display "8.5 hours worked today"
```

### Activity Report
```
Employee Page: My Activity Tab
    ↓
Shows:
  - Today's working hours
  - This week attendance
  - Pending leave requests
  - Upcoming payroll date
    ↓
[Download Report] Button
    ↓
Generates PDF with:
  - Attendance history
  - Working hours summary
  - Leave balance
```

### Leave Request Process
```
Employee Page: Leave Requests Tab
    ↓
[Submit New Request] Button
    ↓
Form:
  - Start Date
  - End Date
  - Leave Type
  - Reason
    ↓
POST /api/leave-requests
    ↓
Status: PENDING
    ↓
Admin Dashboard: Sees new request
    ↓
Admin Approves/Rejects
    ↓
Employee notified
```

---

## 🎯 Implementation Priority

### Priority 1 (Essential)
- ✅ Landing page with 3 buttons
- ✅ Route protection based on role
- ✅ Redirect after login to correct dashboard
- ✅ Clean navigation structure

### Priority 2 (Enhancement)
- ⏳ Tab-based navigation in dashboards
- ⏳ Activity report generation
- ⏳ Download PDF/Excel functionality

### Priority 3 (Polish)
- ⏳ Animations & transitions
- ⏳ Advanced filtering & search
- ⏳ Analytics charts & graphs

---

## 💡 Code Examples

### Using Protected Routes
```javascript
<Route
  path="/employee-dashboard"
  element={
    <ProtectedRoute requiredRole="employee">
      <EmployeeDashboard {...props} />
    </ProtectedRoute>
  }
/>
```

### Redirecting After Login
```javascript
function Login({ onLoginSuccess }) {
  const handleLoginSuccess = (token, user) => {
    onLoginSuccess(token, user);
    
    // Auto redirect based on role
    if (user.role === 'admin') {
      window.location.href = '/admin-dashboard';
    } else {
      window.location.href = '/employee-dashboard';
    }
  };
}
```

### Getting User from Context
```javascript
function EmployeeDashboard({ user, token }) {
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Create Landing Page** - Start with landing.jsx
2. **Update App.jsx** - Implement routing structure
3. **Create Protected Routes** - Add role-based access control
4. **Enhance Dashboards** - Add tab navigation
5. **Add Activity Tracking** - Implement report generation
6. **Polish UI** - Add animations & styling

**Start with the files in Priority 1 for quick implementation!** ⚡
