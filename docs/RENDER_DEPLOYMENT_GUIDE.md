# SmartPlates - Render.com Deployment Guide

## 🚀 **Quick Deployment Checklist**

### **Phase 1: Pre-Deployment (10 minutes)**
- [ ] GitHub repository is up to date
- [ ] `render.yaml` is in root directory
- [ ] Environment variables are ready (see `.env.render.template`)
- [ ] MongoDB Atlas allows external connections

### **Phase 2: Render Setup (15 minutes)**
- [ ] Create Render.com account
- [ ] Connect GitHub repository
- [ ] Configure Web Service
- [ ] Set environment variables
- [ ] Deploy and test

### **Phase 3: Post-Deployment (10 minutes)**
- [ ] Test health endpoint
- [ ] Verify core functionality
- [ ] Monitor logs for errors
- [ ] Test image uploads

---

## 📋 **Detailed Deployment Steps**

### **Step 1: Prepare Repository**

1. **Ensure all files are committed:**
```bash
git add .
git commit -m "feat: add Render.com deployment configuration"
git push origin main
```

2. **Verify critical files exist:**
   - ✅ `render.yaml` (deployment config)
   - ✅ `src/config/storage.ts` (storage management)
   - ✅ `src/app/api/health/route.ts` (health checks)
   - ✅ `.env.render.template` (environment variables guide)

### **Step 2: MongoDB Atlas Setup**

1. **Update Network Access:**
   - Login to MongoDB Atlas
   - Go to Network Access → IP Access List
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Comment: "Render.com deployment access"

2. **Verify Connection String:**
   ```
   mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/smartplates
   ```

### **Step 3: Create Render Service**

1. **Navigate to Render.com Dashboard:**
   - Go to https://render.com
   - Sign up/Login with GitHub account

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `CommitCrush/smartplates`
   - Branch: `main` (or your deployment branch)

3. **Configure Build Settings:**
   ```
   Name: smartplates
   Region: Frankfurt (EU)
   Branch: main
   Build Command: bun install && bun run build
   Start Command: bun start
   ```

4. **Advanced Settings:**
   - Instance Type: `Free`
   - Auto-Deploy: `Yes`
   - Health Check Path: `/api/health`

### **Step 4: Environment Variables**

Copy ALL variables from `.env.render.template` to Render Environment Variables:

**Critical Variables (Must be set):**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/smartplates
NEXTAUTH_SECRET=iEN4ezuJi6EqAEgQ/xNx2v1pkSaJMfbvcN0nLxgIDxQ=
NEXTAUTH_URL=https://YOUR-SERVICE-NAME.onrender.com
JWT_SECRET=iEN4ezuJi6EqAEgQ/xNx2v1pkSaJMfbvcN0nLxgIDxQ=
```

**⚠️ Important:** Replace `YOUR-SERVICE-NAME` with your actual Render service name!

### **Step 5: Deploy and Monitor**

1. **Initial Deployment:**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Monitor build logs for errors

2. **Expected Build Process:**
   ```
   ✅ Installing dependencies (bun install)
   ✅ Building Next.js application (bun run build)
   ✅ Starting production server (bun start)
   ✅ Health check responding at /api/health
   ```

3. **Verify Deployment:**
   - Service URL: `https://YOUR-SERVICE-NAME.onrender.com`
   - Health Check: `https://YOUR-SERVICE-NAME.onrender.com/api/health`

### **Step 6: Post-Deployment Testing**

1. **Health Check:**
```bash
curl https://YOUR-SERVICE-NAME.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "connected" },
    "storage": { "status": "available" },
    "environment": { "status": "configured" }
  }
}
```

2. **Core Functionality Tests:**
   - [ ] Homepage loads correctly
   - [ ] User registration/login works
   - [ ] Recipe browsing functions
   - [ ] Image uploads work (Cloudinary)
   - [ ] Meal planning is accessible
   - [ ] AI features respond

---

## 🎯 **Expected Features Status**

### **✅ Fully Functional (Day 1):**
- User Authentication (NextAuth + Email)
- Recipe Management (MongoDB + Spoonacular API)
- AI Features (OpenAI integration)
- Image Uploads (Cloudinary)
- Meal Planning (Complete functionality)
- Email Notifications (SendGrid)
- PDF Generation (Server-side)
- File Storage (Render persistent disk)
- Comprehensive Logging
- Admin Dashboard

### **⚠️ Requires Additional Setup:**
- Google Calendar Integration (Google OAuth)
- Google Authentication (OAuth credentials)
- Google Cloud Vision AI (Service account)

### **🚀 Performance Benefits on Render:**
- Persistent file storage (1GB free)
- 30-minute request timeouts (vs 10s on Vercel)
- Traditional server architecture
- EU Frankfurt region (better for European users)
- No cold starts
- Persistent database connections

---

## 🛠️ **Troubleshooting Guide**

### **Common Issues & Solutions:**

#### **1. Build Fails - Dependency Issues**
```bash
Error: Failed to install dependencies
```
**Solution:**
- Check if `bun.lock` is committed
- Verify Node.js version compatibility
- Try deleting and regenerating lock file

#### **2. Database Connection Fails**
```bash
Error: MongoServerSelectionError
```
**Solution:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string includes database name
- Confirm credentials are correct

#### **3. Environment Variables Missing**
```bash
Error: Missing required environment variable
```
**Solution:**
- Verify all variables from `.env.render.template` are set
- Check for typos in variable names
- Ensure `NEXTAUTH_URL` matches your Render service URL

#### **4. Health Check Fails**
```bash
Health check timeout
```
**Solution:**
- Check if app is binding to correct PORT
- Verify `/api/health` route exists
- Monitor application logs for startup errors

#### **5. File Upload Issues**
```bash
Error: EACCES permission denied
```
**Solution:**
- Check storage directory permissions
- Verify persistent disk is mounted correctly
- Fallback to Cloudinary for all uploads

### **Monitoring & Maintenance:**

#### **Log Access:**
```bash
# View recent logs in Render Dashboard
# Or access via API:
curl https://YOUR-SERVICE-NAME.onrender.com/api/admin/logs
```

#### **Storage Monitoring:**
```bash
# Check storage usage:
curl https://YOUR-SERVICE-NAME.onrender.com/api/admin/storage-stats
```

#### **Performance Monitoring:**
- Use Render.com built-in metrics
- Monitor health endpoint regularly
- Set up uptime monitoring (UptimeRobot, etc.)

---

## 📊 **Expected Deployment Timeline**

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 15 min | Repository prep, Render account |
| **Configuration** | 20 min | Environment variables, service setup |
| **First Deploy** | 10 min | Build and initial deployment |
| **Testing** | 15 min | Functionality verification |
| **Optimization** | 30 min | Performance tuning (optional) |
| **Total** | **90 min** | **Complete deployment** |

---

## 🎉 **Success Criteria**

Your deployment is successful when:

- [ ] ✅ Health endpoint returns `status: "healthy"`
- [ ] ✅ Homepage loads without errors
- [ ] ✅ User registration/login works
- [ ] ✅ Recipe browsing functions correctly
- [ ] ✅ Image uploads work (via Cloudinary)
- [ ] ✅ AI features respond (OpenAI integration)
- [ ] ✅ Admin dashboard accessible
- [ ] ✅ Email notifications send successfully
- [ ] ✅ No critical errors in logs

**🚀 Congratulations! Your SmartPlates app is now live on Render.com!**

---

## 📞 **Support & Resources**

- **Render.com Documentation:** https://render.com/docs
- **MongoDB Atlas Support:** https://www.mongodb.com/docs/atlas/
- **Next.js Deployment Guide:** https://nextjs.org/docs/deployment
- **Project Health Check:** `https://YOUR-SERVICE-NAME.onrender.com/api/health`

**Need help?** Check the logs first, then review this guide step by step.