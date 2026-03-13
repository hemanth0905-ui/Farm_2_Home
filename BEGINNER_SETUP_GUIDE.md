# 🌾 The Modern Harvest - Beginner Setup Guide

## Complete Step-by-Step Guide to Run This Project on Your Laptop

Welcome! This guide will help you run the **Local Vendor / Farmer Direct Sell Platform** on your laptop using VSCode. Don't worry if you're a beginner - we'll go through every step together! 😊

---

## 📋 Table of Contents
1. [What You'll Need](#what-youll-need)
2. [Installing Required Software](#installing-required-software)
3. [Downloading the Project](#downloading-the-project)
4. [Setting Up the Backend (Python/FastAPI)](#setting-up-the-backend)
5. [Setting Up the Frontend (React)](#setting-up-the-frontend)
6. [Running the Application](#running-the-application)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Project Structure](#project-structure)

---

## 🛠️ What You'll Need

Before we start, you'll need to install these on your laptop:

1. **VSCode** (Code Editor) - Where you'll view and edit the code
2. **Python 3.11+** - For running the backend server
3. **Node.js 18+** - For running the frontend
4. **MongoDB** - Database for storing data
5. **Git** (Optional) - For downloading code from repositories

**System Requirements:**
- Windows 10/11, macOS, or Linux
- At least 4GB RAM (8GB recommended)
- 2GB free disk space

---

## 💻 Installing Required Software

### Step 1: Install VSCode

1. Go to https://code.visualstudio.com/
2. Click **"Download"** for your operating system (Windows/Mac/Linux)
3. Run the installer and follow the instructions
4. After installation, open VSCode

**Recommended VSCode Extensions:**
- Python (by Microsoft)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

To install extensions:
- Click the Extensions icon (4 squares) on the left sidebar in VSCode
- Search for each extension name
- Click "Install"

---

### Step 2: Install Python

**For Windows:**
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or later
3. **IMPORTANT**: Check the box "Add Python to PATH" during installation
4. Click "Install Now"
5. Verify installation:
   ```
   Open Command Prompt (search "cmd" in Windows)
   Type: python --version
   You should see: Python 3.11.x
   ```

**For Mac:**
1. Open Terminal (search "Terminal" in Spotlight)
2. Install Homebrew first (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Install Python:
   ```bash
   brew install python@3.11
   ```
4. Verify: `python3 --version`

**For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3-pip
python3 --version
```

---

### Step 3: Install Node.js

**For All Operating Systems:**
1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Run the installer
4. Follow the installation wizard (keep default settings)
5. Verify installation:
   ```
   Open Terminal/Command Prompt
   Type: node --version
   Should show: v18.x.x or higher
   Type: npm --version
   Should show: 9.x.x or higher
   ```

---

### Step 4: Install MongoDB

**Option A: MongoDB Community Edition (Recommended for Beginners)**

**For Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Run the installer
4. Choose "Complete" installation
5. Install as a Service (check the box)
6. MongoDB Compass will be installed (GUI tool for viewing database)

**For Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**For Linux:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud - Easier but requires internet)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free cluster
4. Get connection string (we'll use this later)

**Verify MongoDB is Running:**
```bash
# Open a new terminal/command prompt
mongo --version
# Or check if MongoDB service is running in your system services
```

---

## 📥 Downloading the Project

### Method 1: Download from Emergent (Current Project)

If you're reading this from the Emergent platform:

1. Click the **"Download Code"** button in your Emergent dashboard
2. Extract the ZIP file to a location like:
   - Windows: `C:\Users\YourName\Desktop\modern-harvest`
   - Mac/Linux: `~/Desktop/modern-harvest`

### Method 2: From GitHub (If uploaded)

```bash
# Open Terminal/Command Prompt
cd Desktop
git clone https://github.com/your-username/modern-harvest.git
cd modern-harvest
```

---

## 🐍 Setting Up the Backend

### Step 1: Open Project in VSCode

1. Open VSCode
2. Click **File → Open Folder**
3. Navigate to your project folder (`modern-harvest`)
4. Click **Select Folder**

### Step 2: Open Terminal in VSCode

1. In VSCode, click **Terminal → New Terminal** (or press `` Ctrl+` ``)
2. You should see a terminal at the bottom of the screen

### Step 3: Navigate to Backend Folder

```bash
# In the VSCode terminal, type:
cd backend
```

### Step 4: Create Virtual Environment

A virtual environment keeps your project dependencies separate from other Python projects.

**For Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**For Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` appear at the start of your terminal line. This means the virtual environment is active.

### Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all necessary Python packages (FastAPI, MongoDB driver, etc.). It may take 2-3 minutes.

### Step 6: Configure Environment Variables

1. In VSCode, open the file `backend/.env`
2. You should see something like:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="modern_harvest_db"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production-xyz123"
RAZORPAY_KEY_ID="rzp_test_demo"
RAZORPAY_KEY_SECRET="demo_secret"
```

**If using MongoDB Atlas (Cloud):**
- Replace `MONGO_URL` with your Atlas connection string
- Example: `mongodb+srv://username:password@cluster.mongodb.net/`

**If using local MongoDB:**
- Keep it as is: `mongodb://localhost:27017`

### Step 7: Seed the Database with Sample Data

This will create test users and products so you can test the app immediately:

```bash
python seed_data.py
```

You should see:
```
Created 5 users
Created 8 products

Test Credentials:
Admin: admin@modernharvest.com / admin123
Farmer 1: farmer1@example.com / farmer123
Consumer 1: consumer1@example.com / consumer123
```

### Step 8: Start the Backend Server

```bash
# Make sure you're still in the backend folder
# and virtual environment is active (you see (venv))
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

**🎉 Backend is now running!** 

Keep this terminal open. The backend server must keep running.

---

## ⚛️ Setting Up the Frontend

### Step 1: Open a New Terminal

Since the backend terminal is busy running the server, we need a new terminal for the frontend:

1. In VSCode, click the **"+"** button in the terminal panel to open a new terminal
2. Or click **Terminal → New Terminal**

### Step 2: Navigate to Frontend Folder

```bash
cd frontend
# If you're in the backend folder, type:
# cd ../frontend
```

### Step 3: Install Node.js Dependencies

```bash
npm install
# Or if you prefer yarn:
# yarn install
```

This will install React and all frontend libraries. It may take 3-5 minutes and download ~200MB of packages.

### Step 4: Configure Frontend Environment

1. Open the file `frontend/.env`
2. You should see:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

**Important:** Change the `REACT_APP_BACKEND_URL` to match where your backend is running:
- If backend is on localhost: `http://localhost:8001`
- If backend is on a different port, change accordingly

### Step 5: Start the Frontend Development Server

```bash
npm start
# Or with yarn:
# yarn start
```

You should see:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should automatically open to `http://localhost:3000` with the application running! 🎉

---

## 🚀 Running the Application

### Quick Start (After Initial Setup)

Once you've done the setup above, here's how to run the app every time:

1. **Start MongoDB** (if not running as a service)
   - Windows: Should start automatically
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

2. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate  # Mac/Linux
   # OR
   venv\Scripts\activate  # Windows
   
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

4. **Open Browser:**
   - Go to `http://localhost:3000`

---

## 🧪 Testing the Application

### Test Accounts (Already created by seed script)

**Admin Account:**
- Email: `admin@modernharvest.com`
- Password: `admin123`
- Can approve farmers, view all analytics, manage users

**Farmer Account:**
- Email: `farmer1@example.com`
- Password: `farmer123`
- Can add/edit products, view sales analytics

**Consumer Account:**
- Email: `consumer1@example.com`
- Password: `consumer123`
- Can browse products, add to cart, place orders

### Test Flow:

1. **Register a New Account:**
   - Click "Get Started" in the top right
   - Fill in the form
   - Choose role (Consumer/Farmer)
   - Click "Create Account"

2. **Login as Consumer:**
   - Login with consumer1@example.com / consumer123
   - Browse products
   - Add items to cart
   - Go to checkout
   - Place an order

3. **Login as Farmer:**
   - Login with farmer1@example.com / farmer123
   - Go to Dashboard
   - Click "Manage Products"
   - Add a new product
   - View sales analytics

4. **Login as Admin:**
   - Login with admin@modernharvest.com / admin123
   - View platform analytics
   - Go to "Manage Farmers"
   - Approve/block farmers

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Python is not recognized"
**Solution:** 
- Reinstall Python and check "Add Python to PATH"
- Or manually add Python to PATH in system environment variables

### Issue 2: "MongoDB connection failed"
**Solution:**
- Check if MongoDB is running: 
  - Windows: Open Services, look for "MongoDB"
  - Mac: `brew services list`
  - Linux: `sudo systemctl status mongod`
- Start MongoDB if it's stopped
- Check if port 27017 is available

### Issue 3: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue 4: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
# OR manually delete these folders/files in Windows

# Reinstall
npm install
```

### Issue 5: Backend errors about missing packages
**Solution:**
```bash
# Make sure virtual environment is active
cd backend
source venv/bin/activate  # Mac/Linux
# OR venv\Scripts\activate for Windows

# Reinstall requirements
pip install -r requirements.txt
```

### Issue 6: "Module not found" errors in React
**Solution:**
```bash
cd frontend
npm install
# If still failing, try:
rm -rf node_modules package-lock.json
npm install
```

### Issue 7: Can't see products on the home page
**Solution:**
```bash
# Re-run the seed script
cd backend
python seed_data.py
```

### Issue 8: CORS errors in browser console
**Solution:**
- Check that `REACT_APP_BACKEND_URL` in frontend/.env matches your backend URL
- Make sure backend is running on the same URL you configured

---

## 📁 Project Structure

```
modern-harvest/
│
├── backend/                    # FastAPI Backend
│   ├── server.py              # Main API server
│   ├── seed_data.py           # Script to populate database
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend configuration
│   └── venv/                  # Python virtual environment
│
├── frontend/                   # React Frontend
│   ├── public/                # Static files
│   │   └── index.html         # Main HTML template
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   │   ├── Navbar.js     # Navigation bar
│   │   │   └── Footer.js     # Footer
│   │   ├── context/          # React context (auth)
│   │   ├── pages/            # Page components
│   │   │   ├── Home.js       # Landing page
│   │   │   ├── Products.js   # Product listing
│   │   │   ├── Login.js      # Login page
│   │   │   ├── Register.js   # Registration page
│   │   │   ├── Cart.js       # Shopping cart
│   │   │   ├── Checkout.js   # Checkout flow
│   │   │   ├── farmer/       # Farmer pages
│   │   │   ├── consumer/     # Consumer pages
│   │   │   └── admin/        # Admin pages
│   │   ├── utils/            # Utility functions
│   │   ├── App.js            # Main app component
│   │   └── index.js          # App entry point
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── .env                  # Frontend configuration
│
├── design_guidelines.json     # Design system and colors
├── README.md                 # Project documentation
└── BEGINNER_SETUP_GUIDE.md  # This file!
```

---

## 🎓 Learning Resources

### If you want to learn more:

**React:**
- Official Tutorial: https://react.dev/learn
- FreeCodeCamp: https://www.freecodecamp.org/learn/front-end-development-libraries/

**Python/FastAPI:**
- FastAPI Tutorial: https://fastapi.tiangolo.com/tutorial/
- Python for Beginners: https://www.python.org/about/gettingstarted/

**MongoDB:**
- MongoDB University (Free): https://university.mongodb.com/
- Docs: https://www.mongodb.com/docs/

**General Web Development:**
- MDN Web Docs: https://developer.mozilla.org/
- W3Schools: https://www.w3schools.com/

---

## 🌟 Features of This Platform

✅ **User Authentication** - Secure login/registration with JWT tokens
✅ **Role-Based Access** - Different features for Farmers, Consumers, and Admins
✅ **Product Management** - Farmers can add, edit, delete products
✅ **Smart Shopping Cart** - Automatic bulk discount calculation
✅ **Order Management** - Track orders from creation to delivery
✅ **Payment Integration** - Razorpay payment gateway (test mode)
✅ **Reviews & Ratings** - Consumers can review products
✅ **Analytics Dashboards** - Sales data for farmers, platform stats for admins
✅ **Admin Controls** - Approve farmers, manage users
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Modern UI** - Clean agricultural theme with smooth animations

---

## 💡 Tips for Beginners

1. **Don't Panic!** - Errors are normal. Read the error messages carefully.
2. **Google is Your Friend** - Most errors have been solved by someone before.
3. **Use VSCode Extensions** - They make coding much easier.
4. **Keep Terminals Organized** - Use separate terminals for backend and frontend.
5. **Save Your Work** - Use Git for version control (learn Git basics).
6. **Test Frequently** - Test your app after every change.
7. **Read the Code** - Try to understand what each file does.
8. **Join Communities** - Stack Overflow, Reddit (r/learnprogramming, r/webdev)

---

## 📞 Getting Help

If you're stuck:

1. **Read the error message** - It usually tells you what's wrong
2. **Check this guide** - Look in the Troubleshooting section
3. **Search Google** - Copy the error message and search
4. **Stack Overflow** - Post your question with code and error details
5. **GitHub Issues** - If this is an open-source project
6. **Developer Communities** - Discord, Slack groups for React/Python

---

## 🎉 Congratulations!

You've successfully set up and run a full-stack web application! This is a major achievement. Now you can:

- Modify the code to add new features
- Change the design and colors
- Add more product categories
- Implement real payment processing
- Deploy it online for others to use

**Keep learning and happy coding!** 🚀

---

## 📝 Quick Command Reference

### Backend Commands:
```bash
# Activate virtual environment
source venv/bin/activate          # Mac/Linux
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Run seed script
python seed_data.py

# Start server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Commands:
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### MongoDB Commands:
```bash
# Start MongoDB
brew services start mongodb-community  # Mac
sudo systemctl start mongod           # Linux

# Stop MongoDB
brew services stop mongodb-community   # Mac
sudo systemctl stop mongod            # Linux

# Check status
brew services list                    # Mac
sudo systemctl status mongod          # Linux
```

---

**Last Updated:** March 2026  
**Created by:** E1, Emergent AI Agent  
**License:** MIT (feel free to use and modify!)

---

## 📧 Test Credentials Summary

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@modernharvest.com      | admin123    |
| Farmer 1 | farmer1@example.com          | farmer123   |
| Farmer 2 | farmer2@example.com          | farmer123   |
| Consumer | consumer1@example.com        | consumer123 |
| Consumer | consumer2@example.com        | consumer123 |

---

**Remember:** This is a learning project. The passwords are simple for testing. In a real production app, always use strong passwords and proper security! 🔒
