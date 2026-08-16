# Full-Stack Portfolio Application

A full-stack developer portfolio project consisting of an Express and MongoDB backend API with JWT authentication and TOTP 2FA, paired with React and Next.js frontend interfaces.

🔗 **Live Site:** [lokeshsain.vercel.app](https://lokeshsain.vercel.app)

---

## Architecture & Features

### Backend Service (`backend/`)
* **REST API:** Express 5 and Mongoose managing project showcases and contact inquiries.
* **Authentication & 2FA:** JWT authentication with TOTP two-factor authentication via `otpauth` and QR code generation (`qrcode`).
* **Email Handling:** Contact message notifications routed through Resend API.
* **Security & Middleware:** Helmet, CORS configuration, rate limiting, and request logging with Morgan.

### Frontend Options
* **React Frontend (`frontend/`):** Single-page portfolio application built with React 19, Vite, Tailwind CSS v4, Framer Motion, and React Router.
* **Next.js Frontend (`next-app/`):** Alternative frontend built with Next.js 16 and React 19.

---

## Tech Stack

| Component | Technologies |
|---|---|
| **Backend** | Node.js, Express 5, MongoDB / Mongoose, JWT, OTPAuth, Resend API, Helmet |
| **Frontend (React)** | React 19, Vite, Tailwind CSS v4, Framer Motion, React Router v7, Lucide React |
| **Frontend (Next.js)** | Next.js 16, React 19, Framer Motion, Nodemailer, Lucide React |

---

## Project Structure

```
Portfolio/
├── backend/                 # Express REST API
│   ├── config/              # db.js, mailer.js
│   ├── controllers/         # adminController, contactController, portfolioController
│   ├── middleware/          # auth, csrf, rateLimit, sanitize
│   ├── models/              # Admin, Contact, OtpToken, Portfolio, RefreshSession, RevokedToken
│   ├── routes/              # adminRoutes, contactRoutes, portfolioRoutes
│   ├── server.js            # Server entry point
│   └── .env.example
├── frontend/                # React 19 + Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── next-app/                # Next.js 16 app
    ├── app/
    └── package.json
```

---

## Getting Started

### Prerequisites

* Node.js (v18.0.0 or higher)
* MongoDB connection URI
* Resend API Key (for backend contact emails)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
TRUST_PROXY=true

ADMIN_EMAIL=admin@example.com
OWNER_EMAIL=your_email@example.com
FROM_EMAIL=onboarding@resend.dev
RESEND_API_KEY=your_resend_api_key
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

### 3. Next.js App Setup (Alternative)

```bash
cd ../next-app
npm install
npm run dev
```
