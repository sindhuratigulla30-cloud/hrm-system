# Backend Setup and Deployment Guide

## 📋 Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- npm v8+ (comes with Node.js)
- MongoDB (Local or Atlas)
- Git
- Terminal/Command Prompt

## 🚀 Local Development Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
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
Edit `.env` file with your values:

```bash
# Open .env in your editor
# Windows
notepad .env

# macOS/Linux
nano .env
```

**Required Configuration:**
- `PORT`: Server port (default 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secure random key for JWT

**Get MongoDB Connection String:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Create a user with credentials
4. Copy connection string and replace in .env

**Generate Secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Start Development Server
```bash
npm run dev
```

Expected output:
```
MongoDB connected successfully
Server running on port 5000
HRM Backend API is running
```

## 📝 Available Scripts

### Development
```bash
npm run dev      # Start with auto-reload (requires nodemon)
```

### Production
```bash
npm start        # Start server
```

### Testing API
```bash
# Check if server is running
curl http://localhost:5000/

# Check database connection
curl http://localhost:5000/api/health
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (Free tier available)
3. Add IP address to whitelist (0.0.0.0/0 for development)
4. Create database user
5. Copy connection string to `.env`

### Option 2: MongoDB Local
```bash
# Install MongoDB Community
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Connection string: `mongodb://localhost:27017/hrm`

## 🔐 Security Checklist

- [ ] Changed JWT_SECRET to a strong random value
- [ ] MongoDB connection string is secure
- [ ] .env file is added to .gitignore
- [ ] CORS is configured correctly
- [ ] Authentication middleware is applied
- [ ] Input validation is enabled
- [ ] Error messages don't leak sensitive info

## 📊 API Endpoints Quick Reference

### Health Check
```bash
GET /api/health
```

### Authentication
```bash
POST /api/auth/register   # Register employee
POST /api/auth/login      # Login (both admin and employee)
```

### Testing with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Verify MongoDB is running
- Check MONGO_URI in .env
- Ensure correct port (usually 27017)

### Cannot connect to Atlas
```
Error: getaddrinfo ENOTFOUND cluster.mongodb.net
```
**Solution:**
- Verify connection string in .env
- Check internet connectivity
- Add your IP to MongoDB Atlas whitelist
- Verify credentials in connection string

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### JWT_SECRET not configured
```
Error: JWT_SECRET is not configured
```
**Solution:**
- Add JWT_SECRET to .env file
- Restart server with `npm run dev`

## 🚀 Deployment

### Deploy to Vercel
1. Create Vercel account
2. Connect GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy (see vercel.json in root)

### Deploy to Heroku
```bash
# Create app
heroku create hrm-api

# Add environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGO_URI=your_mongo_uri

# Deploy
git push heroku main
```

### Deploy to AWS
See AWS documentation for EC2 deployment with Node.js

## 📚 Project Structure

```
backend/
├── models/              # Database schemas
├── controllers/         # Business logic
├── routes/              # API routes
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── server.js            # Entry point
├── app.js               # Express setup
├── package.json
└── .env.example
```

## 🔗 Related Documentation

- [Frontend Setup](../frontend/README.md)
- [Main README](../README.md)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Guide](https://jwt.io/introduction)

---

**Need Help?** Check the main README.md for common issues and support information.
