# Visitify - SaaS Visitor Management System

A modern, full-stack visitor management platform for offices, coworking spaces, and enterprises. Built with React, Node.js/Express, MongoDB, and Tailwind CSS.

---

## 🚀 Features (Implemented)

### Frontend (React + Vite + Tailwind)
- **Modern, minimal landing page** with:
  - Hero, Features, Pricing (INR), FAQ, Contact
  - Smooth scroll navigation, responsive design
  - Consistent branding (logo, favicon, color system)
- **Authentication**
  - Signup (company, admin)
  - Login (JWT, localStorage)
- **Admin Dashboard**
  - Live visitor stats, polling, and real-time updates
  - Pending approvals for hosts/admins (approve/reject visitors)
  - Status badges (checked in, pending, rejected)
  - Average wait time calculation
  - Sidebar navigation (dashboard, company, employees, workflow, analytics, billing)
  - Top-right user profile tray (modern dropdown/drawer, logout, settings, billing, language)
  - Notification popover (minimal, modern, empty state, clear all, view all)
- **Kiosk/Tablet Mode**
  - Visitor self check-in/check-out interface
  - Host dropdown, form validation, responsive design
- **Contact Page**
  - Contact form, links from Pricing/FAQ
- **Reusable UI Components**
  - Button, Card, Drawer, Popover, Table, Toast, etc. (shadcn-ui)
- **Profile & Settings Pages**
  - Profile, Settings (scaffolded, ready for content)
  - Billing: Modern, responsive Subscription & Billing page with plan overview, plan comparison, add-ons, payment method, and invoice history. Upgrade flow integrated with Razorpay (dummy/test mode for now).

### Backend (Node.js + Express + MongoDB)
- **Multi-tenant architecture** (Company, User, Visitor models)
- **Role-based access control** (Super Admin, Admin, Receptionist, Employee, Visitor)
- **Visitor management** (check-in, approval, status updates)
- **Authentication** (JWT, password hashing, validation)
- **Notification system** (email/SMS/WhatsApp via Twilio/Nodemailer)
- **Subscription plans** (default plan, billing endpoints, Razorpay integration in progress)
- **RESTful API** (versioned, organized routes)
- **Validation, error handling, CORS, security**

---

## 🟢 What Works (as of now)
- Full landing page and marketing flow
- Signup/login, JWT auth, and protected routes
- Admin dashboard with live visitor data, polling, and approval workflow
- Kiosk check-in/check-out (UI and backend integration)
- User profile tray (modern dropdown/drawer, logout, settings, billing, language)
- Notification popover (minimal, modern, empty state, clear all, view all)
- Profile, Settings pages (scaffolded)
- **Billing page:**
  - UI: Modern, card-based, responsive, with plan overview, plan comparison, add-ons, payment method, and invoice history
  - Backend: Endpoints for plan checkout, invoices, and webhook switched to Razorpay (dummy/test mode)
  - Upgrade flow: Working end-to-end with Razorpay test plan, redirects to payment page
  - Next: Wire up real plan IDs, production keys, and webhook event handling
- Contact form and routing
- Consistent branding (logo, favicon, color system)
- Backend: all core models, routes, and controllers for auth, visitor, admin, employee, receptionist, analytics, billing
- Notification logic (mocked, ready for real integration)
- Environment variable and proxy setup

---

## 🟡 What’s Remaining / In Progress
- **Notification backend integration** (currently mock data in UI)
- **Profile, Settings page content** (UI is scaffolded, needs real data/forms)
- **Billing page:** Razorpay integration in progress, UI and backend flow working in test mode
- **Analytics, Company, Employee, Workflow, Superadmin pages** (placeholders, not fully implemented)
- **Advanced reporting, audit logs, and analytics**
- **File uploads (photos, ID proofs, etc.)**
- **Production deployment scripts and Dockerization**
- **Automated tests (backend and frontend)**
- **Accessibility and advanced i18n**
- **Full mobile/tablet optimization**
- **API documentation (Swagger/Postman)**
- **End-to-end visitor notification triggers**

---

## 🏗️ Project Structure

```
visitify-front-end-ui/
├── backend/           # Node.js/Express/MongoDB API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── ...
├── src/               # React frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── ...
├── public/            # Static assets (logo, favicon)
└── ...
```

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, bcrypt
- **Notifications:** Twilio, Nodemailer (backend), popover UI (frontend)
- **UI/UX:** Modern SaaS design, minimal, responsive, accessible

---

## ⚡ Getting Started

### Frontend
```bash
cd visitify-front-end-ui
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env # configure your environment variables
npm run dev
```

---

## 🌐 Key Routes & Pages
- `/` - Landing page
- `/contact` - Contact form
- `/login`, `/signup` - Auth
- `/admin/dashboard` - Admin dashboard
- `/admin/profile`, `/admin/settings`, `/admin/billing` - User/account pages
- `/kiosk/checkin`, `/kiosk/checkout` - Visitor self check-in/out

---

## 🎨 Branding & Design System
- Consistent logo, favicon, and color palette
- Modern, minimal UI (Tailwind + shadcn-ui)
- Reusable components in `src/components/ui/`

---

## 📋 API & Backend Highlights
- RESTful, versioned API (`/api/v1/...`)
- Multi-tenant, role-based access
- Visitor, user, company, subscription, notification models
- Notification triggers (mocked, ready for real integration)
- Secure, validated, and ready for production

---

## 📈 Contributing & Roadmap
- See [backend/README.md](backend/README.md) for backend API details
- Open issues or PRs for bugs, features, or questions
- Roadmap: see “What’s Remaining” above

---

Built with ❤️ by the Visitify team for modern visitor management.
