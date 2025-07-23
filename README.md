# Visitify Front-End UI & Backend

A modern, full-featured visitor management system for offices and organizations. Built with React, TypeScript, Tailwind CSS (frontend), and Node.js/Express/MongoDB (backend).

---

## Features

- **Visitor Registration**: Kiosk, Receptionist, and Employee pre-registration flows
- **Dynamic Gate Pass**: QR code-based, printable, and mobile-friendly
- **Admin Panel**: Manage visitors, employees, analytics, and settings
- **Receptionist Panel**: Register/check-in visitors, view all requests/history, check out visitors
- **Employee Panel**: Approve/reject requests, pre-register visitors, view visitor history
- **Notifications**: Email notifications (SMS/WhatsApp disabled by default)
- **Consistent Design**: Unified UI/UX across all panels

---

## Setup

### 1. Clone the Repository
```sh
git clone <repo-url>
cd visitify-front-end-ui
```

### 2. Install Dependencies
#### Frontend
```sh
npm install
```
#### Backend
```sh
cd backend
npm install
```

### 3. Environment Variables
- Copy `.env.example` to `.env` in the backend folder and fill in MongoDB, SMTP, and other required values.
- Twilio/SMS/WhatsApp are disabled by default.

### 4. Run the App
#### Backend
```sh
cd backend
npm start
```
#### Frontend
```sh
cd ..
npm run dev
```

---

## Usage

### Kiosk/Visitor Registration
- `/register-visitor` or `/kiosk/checkin`: Register a new visitor (mobile, name, aadhar, gender, host, purpose)
- On success, redirects to a dynamic gate pass with QR code

### Gate Pass
- `/gate-pass/:id`: Shows a printable, QR-enabled gate pass for the visitor

### Admin Panel
- `/admin/dashboard`: Analytics, quick actions, and visitor management
- `/admin/visitors`: All visitors (accordion view)

### Receptionist Panel
- `/receptionist/dashboard`: Register/check-in visitors, view today's visitors, all requests & history, check out visitors
- Register Visitor: Modern form with all required fields
- All Requests & History: Filter by date, view/print gate pass, check out

### Employee Panel
- `/employee/dashboard`: Approve/reject requests, pre-register visitors, view visitor history
- Pending requests and visitor history sections

---

## Design Language
- All panels use the same card, table, button, and form components
- Responsive and mobile-friendly
- Status badges and actions are consistent everywhere

---

## Customization
- To enable SMS/WhatsApp, re-enable Twilio in `backend/utils/notify.js` and add credentials to `.env`
- To change branding, update the logo, company name, and colors in Tailwind config and UI components

---

## Contributing
Pull requests and issues are welcome! Please follow the code style and open an issue for major changes.

---

## License
MIT
