# Deployment Guide

A comprehensive guide for deploying the HRM System to production.

## 📋 Pre-Deployment Checklist

### Code Review
- [ ] All code has been reviewed
- [ ] No hardcoded credentials
- [ ] No console.log statements in production code
- [ ] Error handling is proper
- [ ] CORS configuration is correct
- [ ] Input validation is implemented
- [ ] Passwords meet security requirements

### Testing
- [ ] All features tested manually
- [ ] Edge cases handled
- [ ] API endpoints tested with different payloads
- [ ] Frontend responsive design tested
- [ ] Error scenarios tested
- [ ] Database queries optimized

### Documentation
- [ ] README.md is complete
- [ ] API endpoints documented
- [ ] Setup instructions clear
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

### Security
- [ ] JWT_SECRET is strong and changed
- [ ] MongoDB credentials are secure
- [ ] CORS is configured properly
- [ ] Rate limiting considered
- [ ] HTTPS will be used
- [ ] Sensitive data is not logged

## 🚀 Deployment Platforms

### Option 1: Vercel (Recommended for Full Stack)

#### Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- GitHub account with repository
- GitHub connected to Vercel

#### Backend Deployment

1. **Prepare Backend**
```bash
# Ensure vercel.json exists in backend/
# It should contain serverless function configuration
```

2. **Deploy to Vercel**
```bash
cd backend
vercel --prod
```

3. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from .env:
     - MONGO_URI
     - JWT_SECRET
     - NODE_ENV=production

4. **Update Frontend API URL**
   - Copy Vercel deployment URL
   - Update frontend VITE_API_URL to this URL

#### Frontend Deployment

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

3. **Verify Deployment**
   - Visit deployment URL
   - Test login functionality
   - Check API calls in browser console

### Option 2: Heroku (Traditional Node.js Hosting)

#### Prerequisites
- Heroku account ([heroku.com](https://www.heroku.com))
- Heroku CLI installed
- Git repository

#### Backend Deployment

1. **Prepare Backend**
```bash
cd backend
# Ensure package.json has correct start script
# "start": "node server.js"

# Create Procfile
echo "web: node server.js" > Procfile

# Add Procfile to git
git add Procfile
git commit -m "Add Procfile for Heroku"
```

2. **Create Heroku App**
```bash
heroku login
heroku create your-hrm-api
```

3. **Set Environment Variables**
```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git push heroku main
```

5. **View Logs**
```bash
heroku logs --tail
```

#### Frontend Deployment (with Heroku)

1. **Create New Heroku App**
```bash
heroku create your-hrm-frontend
```

2. **Configure Frontend**
```bash
cd frontend
# Create static.json for static hosting
cat > static.json << 'EOF'
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
EOF

# Add static buildpack
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static

# Set environment variables
heroku config:set VITE_API_URL=https://your-hrm-api.herokuapp.com
```

3. **Deploy Frontend**
```bash
git push heroku main
```

### Option 3: AWS (EC2)

#### Backend on AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.micro (free tier eligible)
   - Security group allowing ports 22, 80, 443

2. **Connect to Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB CLI tools
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get install -y mongodb-org-tools

# Install Git
sudo apt install -y git
```

4. **Clone Repository**
```bash
git clone https://github.com/your-username/hrm-system.git
cd hrm-system/backend
npm install
```

5. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

6. **Use PM2 for Process Management**
```bash
sudo npm install -g pm2
pm2 start server.js --name "hrm-api"
pm2 startup
pm2 save
```

7. **Set Up Nginx Reverse Proxy**
```bash
sudo apt install -y nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl restart nginx
```

8. **Set Up SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Frontend on AWS S3 + CloudFront

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://your-hrm-frontend
```

3. **Upload Files**
```bash
aws s3 sync dist/ s3://your-hrm-frontend
```

4. **Create CloudFront Distribution**
   - AWS Console → CloudFront
   - Create distribution
   - Point to S3 bucket
   - Add SSL certificate

### Option 4: DigitalOcean (VPS)

#### Similar to AWS EC2

1. **Create Droplet** (Ubuntu 22.04)
2. **SSH into Droplet**
3. **Install Node.js and dependencies**
4. **Clone and deploy code**
5. **Use PM2 and Nginx** (same as AWS)
6. **Set up SSL with Let's Encrypt**

## 🔒 Production Configuration

### Backend Security

```javascript
// server.js - Production configuration
const cors = require('cors');

// Restrict CORS to frontend domain only
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
}));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting (consider using express-rate-limit)
```

### Environment Variables (Production)

**Backend (.env)**
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://prod_user:secure_password@cluster.mongodb.net/hrm
JWT_SECRET=very_long_random_secret_key_here_minimum_32_characters
```

**Frontend (.env)**
```
VITE_API_URL=https://api.your-domain.com
```

## 📊 Monitoring and Maintenance

### Logging
```bash
# On Heroku
heroku logs --tail

# On EC2/DigitalOcean with PM2
pm2 logs hrm-api
```

### Database Backups
```bash
# MongoDB Atlas
# Automatic backups enabled in dashboard

# Or manual backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/hrm" --out ./backup
```

### Performance Monitoring
- Set up application monitoring (New Relic, DataDog)
- Monitor database query performance
- Track API response times
- Monitor error rates

## 🚨 Troubleshooting Production Issues

### API Not Responding
```bash
# Check if service is running
# On Heroku
heroku ps

# On EC2/DigitalOcean
pm2 status
systemctl status nginx
```

### Database Connection Issues
- Verify connection string
- Check IP whitelist on MongoDB Atlas
- Verify credentials
- Check network connectivity

### High Server Load
- Check database query performance
- Implement caching
- Add indexes to frequently queried fields
- Consider load balancing

### CORS Errors in Production
- Verify VITE_API_URL points to correct domain
- Check backend CORS configuration
- Ensure HTTPS is used consistently

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Backend
      run: |
        cd backend
        npm install
        # Deploy command
    
    - name: Deploy Frontend
      run: |
        cd frontend
        npm install
        npm run build
        # Deploy command
```

## 📝 Post-Deployment

1. **Verify All Features**
   - Test user registration
   - Test login for both roles
   - Test attendance tracking
   - Test leave requests
   - Test payroll access

2. **Monitor Performance**
   - Check page load times
   - Monitor API response times
   - Track error rates

3. **Set Up Notifications**
   - Alert on high error rates
   - Alert on downtime
   - Alert on performance degradation

4. **Document Issues**
   - Keep deployment log
   - Document configuration
   - Note any special considerations

## 📞 Support & Rollback

### Quick Rollback
```bash
# On Heroku
heroku releases
heroku rollback v123

# On EC2 with Git
git log --oneline
git revert <commit-hash>
pm2 restart hrm-api
```

### Emergency Hotline
Keep contact information for:
- Database administrator
- DevOps engineer
- System administrator

---

**Deployment is complete!** Monitor your application and ensure everything is running smoothly.
