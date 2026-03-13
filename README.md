# 🌾 The Modern Harvest - Local Vendor / Farmer Direct Sell Platform

A full-stack web application connecting farmers directly with consumers, eliminating middlemen and promoting sustainable agriculture.

## 🎯 Project Overview

**The Modern Harvest** is a comprehensive e-commerce platform designed specifically for the agricultural sector. It enables farmers and vendors to sell their products directly to consumers, ensuring fair prices for farmers and fresh produce for consumers.

### Key Features

✨ **Role-Based System**
- **Consumers**: Browse, purchase, review products
- **Farmers**: Manage products, track sales, view analytics
- **Admins**: Approve farmers, monitor platform, view comprehensive analytics

🛒 **E-Commerce Functionality**
- Smart shopping cart with bulk discount calculations
- Dynamic pricing based on quantity
- Real-time stock management
- Product reviews and ratings

💳 **Payment Integration**
- Razorpay payment gateway integration
- Secure payment processing
- Order tracking and history

📊 **Analytics & Insights**
- Sales dashboards for farmers
- Revenue tracking
- Top-selling products analysis
- Platform-wide statistics for admins

🎨 **Modern UI/UX**
- Clean, professional agricultural theme
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **JWT** - Authentication
- **Razorpay SDK** - Payment processing

### Database
- **MongoDB** - NoSQL database

## 🚀 Quick Start

See **[BEGINNER_SETUP_GUIDE.md](./BEGINNER_SETUP_GUIDE.md)** for detailed step-by-step instructions!

### Express Setup (For Experienced Developers)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Visit: http://localhost:3000

## 🧪 Test Accounts

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@modernharvest.com  | admin123    |
| Farmer   | farmer1@example.com      | farmer123   |
| Consumer | consumer1@example.com    | consumer123 |

## 📁 Project Structure

```
modern-harvest/
├── backend/                   # FastAPI Backend
│   ├── server.py             # Main API server
│   ├── seed_data.py          # Database seeding
│   └── requirements.txt      # Dependencies
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── context/         # React context
│   └── package.json
└── BEGINNER_SETUP_GUIDE.md  # Detailed setup guide
```

## 🔌 Key API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - List products
- `POST /api/orders` - Create order
- `POST /api/payments/create-order` - Initialize payment

Full API docs: http://localhost:8001/docs

## 🎨 Design System

- **Primary Color**: Dark Moss Green (#2F5233)
- **Fonts**: Playfair Display (headings), Outfit (body)
- **Layout**: Bento Grid system

## 📚 Documentation

- **[BEGINNER_SETUP_GUIDE.md](./BEGINNER_SETUP_GUIDE.md)** - Complete setup instructions for beginners
- **[design_guidelines.json](./design_guidelines.json)** - UI/UX design system

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Acknowledgments

Built with E1 AI Agent from Emergent

---

**Built with ❤️ for the agricultural community**
