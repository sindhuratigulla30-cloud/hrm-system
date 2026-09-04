# Frontend Setup Guide

## 📋 Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- npm v8+ (comes with Node.js)
- Git
- A code editor (VS Code recommended)

## 🚀 Local Development Setup

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables
Edit `.env` file:

```bash
# Windows
notepad .env

# macOS/Linux
nano .env
```

**Default Configuration:**
```
VITE_API_URL=http://localhost:5000
```

Make sure the API URL matches your backend server.

### Step 5: Start Development Server
```bash
npm run dev
```

Frontend will open at: `http://localhost:5173`

## 📝 Available Scripts

### Development
```bash
npm run dev        # Start development server with hot reload
```

### Production Build
```bash
npm run build      # Build optimized production bundle
npm run preview    # Preview production build locally
```

### Code Quality
```bash
npm run lint       # Run ESLint to check code quality
```

## 🎯 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── AdminLogin/         # Admin login page
│   ├── EmployeeRegister/   # Employee registration
│   ├── EmployeeDashboard/  # Employee dashboard
│   ├── Attendance/         # Attendance tracking
│   ├── LeaveRequests/      # Leave management
│   ├── Payroll/            # Payroll display
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   ├── App.css             # Global styles
│   └── index.css           # Global styles
├── public/                 # Static files
├── package.json
├── vite.config.js         # Vite configuration
└── .env.example           # Environment template
```

## 🎨 Component Organization

### Login Components
- `Login/Login.jsx` - Employee login
- `AdminLogin/AdminLogin.jsx` - Admin login

### Registration
- `Register/Register.jsx` - Employee self-registration
- `EmployeeRegister/EmployeeRegister.jsx` - Employee registration form

### Dashboards
- `EmployeeDashboard/EmployeeDashboard.jsx` - Employee dashboard
- `AdminDashboard` component in App.jsx

### Features
- `Attendance/Attendance.jsx` - Attendance tracking
- `LeaveRequests/LeaveRequests.jsx` - Leave management
- `Payroll/Payroll.jsx` - Payroll information

## 🔄 Authentication Flow

1. User lands on app
2. Check localStorage for token and user data
3. If token exists, verify with backend
4. If valid, redirect to dashboard
5. If invalid/expired, show login page
6. After login, store token and user in localStorage
7. Include token in all API requests

## 🌐 API Communication

### Base Configuration
- API URL from environment variable: `VITE_API_URL`
- Uses Axios for HTTP requests
- JWT token included in Authorization header

### Request Example
```javascript
const authConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

axios.get(`${API_URL}/api/employees`, authConfig);
```

## 🎯 Key Features

### Employee Dashboard
- Personal information display
- Attendance tracking (login/logout)
- Leave request submission
- Payroll information
- Working hours calculation

### Admin Dashboard
- Employee management
- Attendance monitoring
- Leave request approval
- Payroll administration
- Statistics and reports

## 🚀 Building for Production

### Step 1: Create Production Build
```bash
npm run build
```

This creates an optimized `dist/` folder.

### Step 2: Preview Build (Optional)
```bash
npm run preview
```

### Step 3: Deploy
Upload the `dist/` folder to your hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static file hosting

## 🌐 Environment Configuration

### Development
```
VITE_API_URL=http://localhost:5000
```

### Production
```
VITE_API_URL=https://your-api-domain.com
```

## 🐛 Troubleshooting

### Port Already in Use
```
Error: Port 5173 is already in use
```
**Solution:**
```bash
# Use different port
npm run dev -- --port 3000
```

### API Connection Error
```
Error: Cannot connect to API
```
**Solution:**
- Verify backend is running
- Check VITE_API_URL in .env
- Verify CORS is enabled on backend
- Check browser console for exact error

### Blank Page After Login
```
Issue: Dashboard doesn't display
```
**Solution:**
- Check browser console for errors
- Verify token is stored in localStorage
- Check if API calls are successful
- Clear localStorage and try again

### Module Not Found
```
Error: Cannot find module 'react-icons'
```
**Solution:**
```bash
npm install
```

## 🎨 Styling

### CSS Framework
- Custom CSS with Flexbox and Grid
- Consistent color scheme (blue primary)
- Responsive design mobile-first approach

### Color Palette
- Primary: #2563eb (Blue)
- Background: #f4f7fc (Light gray)
- Text: #071a3d (Dark blue)
- Accent: #dc2626 (Red)

## ⚡ Performance Tips

1. **Lazy Load Routes**: Use React.lazy for large components
2. **Memoization**: Use useMemo for expensive calculations
3. **Code Splitting**: Vite automatically splits code
4. **Image Optimization**: Compress images before use

## 🔐 Security

- Tokens stored in localStorage (consider sessionStorage for higher security)
- Clear sensitive data on logout
- Validate user input before API calls
- HTTPS required for production
- Keep dependencies updated

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly buttons and inputs
- Readable fonts on all devices

## 🔗 Related Documentation

- [Backend Setup](../backend/SETUP.md)
- [Main README](../README.md)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)

---

**Ready to develop?** Start with `npm run dev` and begin building!
