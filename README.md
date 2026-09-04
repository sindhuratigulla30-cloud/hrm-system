# Human Resource Management (HRM) System

A comprehensive, full-stack Human Resource Management system built with modern technologies for managing employees, attendance, leave requests, and payroll.

## 🎯 Features

### Employee Management
- ✅ Employee registration and authentication
- ✅ Employee information management (personal & job details)
- ✅ Role-based access control (Employee & Admin)
- ✅ Secure password management

### Attendance Management
- ✅ Daily attendance tracking (login/logout)
- ✅ Working hours calculation
- ✅ Attendance status (Present, Half Day, Absent, Leave)
- ✅ Attendance history and reports

### Leave Management
- ✅ Leave request submission
- ✅ Leave approval workflow
- ✅ Leave status tracking
- ✅ Leave balance management

### Payroll Management
- ✅ Salary calculations
- ✅ Payroll processing
- ✅ Payroll history
- ✅ Payroll reports

### Dashboard
- **Employee Dashboard**: View personal attendance, leave requests, payroll
- **Admin Dashboard**: Manage all employees, attendance monitoring, payroll administration

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Socket.io Client** - Real-time communication
- **ESLint** - Code quality

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Socket.io** - Real-time features
- **Nodemon** - Development tool

## 📁 Project Structure

```
hrm-system/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── AdminLogin/         # Admin login page
│   │   ├── EmployeeRegister/   # Employee registration
│   │   ├── EmployeeDashboard/  # Employee dashboard
│   │   ├── Attendance/         # Attendance tracking
│   │   ├── LeaveRequests/      # Leave management
│   │   ├── Payroll/            # Payroll display
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
└── backend/                     # Node.js/Express API
    ├── models/                 # Mongoose schemas
    │   ├── Employee.js
    │   ├── Attendance.js
    │   ├── LeaveRequest.js
    │   ├── Department.js
    │   └── payrollModel.js
    ├── routes/                 # API routes
    ├── controllers/            # Business logic
    ├── middleware/             # Custom middleware
    ├── config/                 # Configuration
    ├── server.js              # Express server
    ├── app.js                 # App setup
    ├── package.json
    ├── db.js                  # Database connection
    └── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET

# Start development server
npm run dev

# Or start production server
npm start
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# VITE_API_URL should point to your backend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

Frontend runs on `http://localhost:5173` (default Vite port)

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Employee and Admin roles
- **Protected Routes**: Authentication middleware on all protected endpoints
- **CORS Protection**: Configured for frontend-backend communication
- **Data Validation**: Input validation on all API endpoints

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Employee registration

### Employee Endpoints
- `GET /api/employees` - Get all employees (Admin only)
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee (Admin only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Attendance Endpoints
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/login` - Employee login (check-in)
- `POST /api/attendance/logout` - Employee logout (check-out)
- `PUT /api/attendance/:id` - Update attendance status (Admin only)

### Leave Request Endpoints
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Submit leave request
- `PUT /api/leave-requests/:id` - Update leave request
- `DELETE /api/leave-requests/:id` - Delete leave request

### Payroll Endpoints
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll record (Admin only)
- `PUT /api/payroll/:id` - Update payroll (Admin only)

### Department Endpoints
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (Admin only)
- `PUT /api/departments/:id` - Update department (Admin only)

## 🧪 Development

### Linting (Frontend)
```bash
cd frontend
npm run lint
```

### Running in Development Mode
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm install --production
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Authentication Flow

1. **Registration**: Employee registers through the registration form
2. **Login**: Employee/Admin logs in with email and password
3. **Token Generation**: Backend generates JWT token valid for 7 days
4. **Authorization**: Frontend stores token in localStorage
5. **Protected Requests**: All API requests include `Authorization: Bearer <token>` header
6. **Role Check**: Backend verifies user role for admin-only operations
7. **Dashboard**: User is redirected to appropriate dashboard based on role

## 📊 Database Models

### Employee
- Personal information (name, email, phone, address)
- Job information (department, position, salary)
- Authentication credentials
- Account status and role

### Attendance
- Employee reference
- Login/Logout timestamps
- Working hours calculation
- Attendance status

### LeaveRequest
- Employee reference
- Leave type and duration
- Reason for leave
- Approval status

### Department
- Department name
- Description
- Employee count

### Payroll
- Employee reference
- Salary information
- Deductions
- Net pay
- Payment status

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MONGO_URI in .env
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### CORS Errors
- Verify VITE_API_URL matches backend URL
- Check backend CORS configuration
- Ensure frontend is making requests to correct API

### Authentication Failures
- Clear browser localStorage
- Verify JWT_SECRET matches in backend
- Check token expiration (7 days)

## 📞 Support

For issues or feature requests, please create an issue in the repository.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💼 Professional Standards

This project follows:
- **REST API** principles for backend design
- **Component-based** architecture for frontend
- **Separation of Concerns** throughout the codebase
- **Security Best Practices** for authentication and data handling
- **Error Handling** and validation on all inputs
- **Responsive Design** for all devices

---

**Made with ❤️ for efficient HR Management**
