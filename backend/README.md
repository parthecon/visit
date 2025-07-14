# Visitify Backend - SaaS Visitor Management System

A comprehensive backend solution for visitor management with multi-tenancy, role-based access control, and notification services.

## 🚀 Features

- **Multi-tenant Architecture** - Separate companies with isolated data
- **Role-based Access Control** - Super Admin, Company Admin, Receptionist, Employee, Visitor
- **Visitor Management** - Check-in/out, pre-registration, approval workflows
- **Notification System** - Email, SMS, WhatsApp notifications
- **File Uploads** - Photos, ID proofs, signatures, documents
- **Analytics & Reporting** - Visit trends, peak hours, approval times
- **Subscription Management** - Multiple plans with usage limits
- **RESTful API** - Versioned API with comprehensive endpoints

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Notifications**: Twilio (SMS/WhatsApp) + Nodemailer (Email)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- NPM or Yarn

## ⚡ Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd visitify-backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Update .env with your configuration
```

3. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

4. **Run the Application**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

Key environment variables to configure:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/visitify

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Notifications
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
- `POST /auth/register` - Register company with admin
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Forgot password
- `PUT /auth/reset-password` - Reset password

### Visitor Endpoints
- `POST /visitor/checkin` - Visitor self check-in
- `GET /visitor/success` - Check-in success page

### Admin Endpoints
- `GET /admin/dashboard` - Company admin dashboard
- `POST /admin/employees` - Create employee
- `PUT /admin/company-settings` - Update company settings

### Employee Endpoints
- `GET /employee/visitors` - View assigned visitors
- `POST /employee/pre-register` - Pre-register visitor
- `PUT /employee/approval/:id` - Approve/reject visitor

### Receptionist Endpoints
- `GET /receptionist/visitors` - Live visitor log
- `POST /receptionist/visitor` - Manual check-in
- `GET /receptionist/approvals` - Pending approvals

## 🏗️ Project Structure

```
backend/
├── controllers/          # Route controllers
├── models/              # Mongoose models
├── routes/              # Express routes
├── middlewares/         # Custom middleware
├── utils/               # Utility functions
├── config/              # Configuration files
├── uploads/             # File upload directory
├── app.js              # Express app configuration
├── server.js           # Server startup
└── .env                # Environment variables
```

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control:

- **Super Admin**: Full system access, manage all companies
- **Company Admin**: Manage own company, employees, settings
- **Receptionist**: Check-in visitors, view company visitors
- **Employee**: View assigned visitors, pre-register, approve/reject
- **Visitor**: Self check-in capabilities

## 📊 Database Models

Key models and relationships:

- **User** - All system users with roles
- **Company** - Tenant companies with settings
- **Visitor** - Visitor records with check-in/out data
- **SubscriptionPlan** - Subscription tiers and limits
- **NotificationLog** - Notification history and status
- **VisitLog** - Audit trail of all visitor activities

## 🔔 Notification System

Supports multiple notification channels:

- **Email** - SMTP/SendGrid integration
- **SMS** - Twilio integration
- **WhatsApp** - Twilio Business API

Trigger points:
- Visitor check-in → Notify host
- Approval/rejection → Notify visitor
- Subscription alerts → Notify admin

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas or production MongoDB
4. Set up proper CORS origins
5. Configure production SMTP/Twilio credentials
6. Set up file upload storage (AWS S3/CloudStorage)
7. Enable HTTPS
8. Set up monitoring and logging

### Docker Deployment

```bash
# Build image
docker build -t visitify-backend .

# Run container
docker run -p 5000:5000 --env-file .env visitify-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring & Logging

- Health check endpoint: `GET /health`
- Request logging in development
- Error tracking and reporting
- Performance monitoring ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Create pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@visitify.com

---

Built with ❤️ for modern visitor management needs.