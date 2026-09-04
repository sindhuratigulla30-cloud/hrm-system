# Quick Start Guide

Get the HRM System running in 5 minutes!

## ⚡ 30-Second Overview

This is a professional **Human Resource Management System** with:
- Employee & Admin authentication
- Attendance tracking
- Leave management
- Payroll system
- Real-time dashboards

## 🎯 Quick Start

### 1. Prerequisites Check
```bash
# Check Node.js installation
node --version      # Should be v16 or higher
npm --version       # Should be v8 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 2. Clone Repository
```bash
git clone <repository-url>
cd hrm-system
```

### 3. Backend Setup (Terminal 1)
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the server
npm run dev
```

✅ Backend ready when you see: `Server running on port 5000`

### 4. Frontend Setup (Terminal 2)
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

✅ Frontend ready when you see: `Local: http://localhost:5173`

### 5. Open in Browser
```
http://localhost:5173
```

## 🔐 Test Login Credentials

### Create Admin Account (First Time)
```bash
cd backend

# Run admin creation script
node createAdmin.js
```
Follow prompts to create admin account.

### Employee Registration
On the app:
1. Click "Register as Employee"
2. Fill in details
3. Click "Register"
4. Use credentials to login

## 📚 Key Pages

### Employee Flow
```
Login → Employee Dashboard → Attendance → Leave Requests → Payroll
```

### Admin Flow
```
Admin Login → Admin Dashboard → View All Attendance → Manage Employees
```

## 🗂️ Project Structure

```
hrm-system/
├── backend/       # Node.js/Express API
├── frontend/      # React app
├── README.md      # Full documentation
├── DEPLOYMENT.md  # Deployment guide
└── CONTRIBUTING.md # Contributing guidelines
```

## 🛠️ Available Commands

### Backend
```bash
npm run dev    # Start with auto-reload
npm start      # Start production
npm run lint   # Check code quality
```

### Frontend
```bash
npm run dev    # Start development server
npm run build  # Create production build
npm run lint   # Check code quality
npm run preview # Preview production build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register employee
- `POST /api/auth/login` - Login user

### Employees
- `GET /api/employees` - List all (admin)
- `GET /api/employees/:id` - Get details
- `PUT /api/employees/:id` - Update

### Attendance
- `GET /api/attendance` - Get records
- `POST /api/attendance/login` - Check-in
- `POST /api/attendance/logout` - Check-out

### Leave Requests
- `GET /api/leave-requests` - List requests
- `POST /api/leave-requests` - Submit request
- `PUT /api/leave-requests/:id` - Update status

### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll

## ❌ Troubleshooting

### "Cannot find module"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Port 5000 already in use"
```bash
# Use different port
PORT=5001 npm run dev
```

### "MongoDB connection failed"
- Check MONGO_URI in .env
- Verify MongoDB is running or Atlas connection
- Check internet connectivity

### "API not responding"
- Check both servers are running
- Verify VITE_API_URL in frontend .env
- Check CORS configuration

## 📖 Full Documentation

- **[Main README](README.md)** - Complete project overview
- **[Backend Setup](backend/SETUP.md)** - Detailed backend guide
- **[Frontend Setup](frontend/SETUP.md)** - Detailed frontend guide
- **[Deployment](DEPLOYMENT.md)** - Production deployment
- **[Contributing](CONTRIBUTING.md)** - Code standards

## 🎓 Learning Path

1. **Understand Structure**: Read [README.md](README.md)
2. **Setup Environment**: Follow [Backend Setup](backend/SETUP.md)
3. **Run Application**: Use this Quick Start guide
4. **Explore Code**: Review [CONTRIBUTING.md](CONTRIBUTING.md)
5. **Deploy**: Check [DEPLOYMENT.md](DEPLOYMENT.md)

## 🚀 Next Steps

### Development
- Explore the codebase
- Make modifications
- Test your changes
- Create pull requests

### Deployment
- Follow [DEPLOYMENT.md](DEPLOYMENT.md)
- Deploy to Vercel, Heroku, or AWS
- Set up monitoring

### Enhancement
- Add new features
- Improve UI/UX
- Optimize performance
- Add testing

## 💡 Pro Tips

1. **Use VS Code** - Recommended editor
2. **Install Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Thunder Client or Postman (for API testing)
3. **Read Error Messages** - They tell you what's wrong
4. **Check Console** - F12 → Console tab in browser
5. **Use DevTools** - Great for debugging

## 🤝 Need Help?

1. Check **Troubleshooting** section above
2. Review documentation files
3. Check error messages carefully
4. Ask in project discussions

## 📋 Checklist Before Going Live

- [ ] All features tested
- [ ] Error handling verified
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] CORS properly configured
- [ ] Passwords meet security requirements
- [ ] README and docs are complete

## 🎉 Success!

Your HRM System is now running! You can:
- ✅ Register employees
- ✅ Track attendance
- ✅ Manage leave requests
- ✅ Process payroll
- ✅ View reports

---

**Ready to build? Start with `npm run dev` in both terminals!** 🚀

Questions? Check the full [README.md](README.md) or [CONTRIBUTING.md](CONTRIBUTING.md).
