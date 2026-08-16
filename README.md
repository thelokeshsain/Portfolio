# 💼 Full-Stack Portfolio Application

A production-grade developer portfolio architecture featuring an authenticated Express/MongoDB backend with Two-Factor Authentication (2FA/TOTP), transactional email delivery, and dynamic React & Next.js frontend interfaces.

🔗 **Live Site:** [lokeshsain.vercel.app](https://lokeshsain.vercel.app)

---

## ✨ Architecture & Features

### Backend Service (`backend/`)
* **REST API:** Built with Express 5 and Mongoose for managing project showcases, work experience, and incoming contact requests.
* **Security & Hardening:** Includes Helmet HTTP security headers, CORS origin validation, input sanitization, and request rate limiting.
* **Authentication & 2FA:** JWT-based administrative sessions paired with RFC 6238 TOTP two-factor authentication via `otpauth` and QR code provisioning.
* **Transactional Email Routing:** Contact form message processing and administrative alert dispatch powered by Resend API.

### Frontend Application (`frontend/` & `next-app/`)
* **React 19 Frontend:** High-performance single-page portfolio interface using Vite, Tailwind CSS, Framer Motion transitions, and React Router.
* **Next.js Application:** Alternate Next.js 16 setup with server actions, Lucide icons, and integrated MongoDB/Nodemailer support.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js (>=18), Express 5, MongoDB / Mongoose, JWT, OTPAuth, Resend API, Helmet, Morgan |
| **Frontend (React)** | React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router v7, Lucide React, React Hot Toast |
| **Frontend (Next.js)** | Next.js 16, React 19, Framer Motion, Nodemailer, Lucide React |

---

## 📁 Project Structure

```
Portfolio/
├── backend/                 # Node.js Express REST API
│   ├── config/              # Database (db.js) & Mailer configuration
│   ├── controllers/         # Admin, Contact, and Portfolio controllers
│   ├── middleware/          # Auth, CSRF, Rate Limiting, Sanitization
│   ├── models/              # Mongoose data schemas
│   ├── routes/              # Express API route declarations
│   ├── server.js            # Server entry point
│   └── .env.example         # Environment template
├── frontend/                # React + Vite client
│   ├── src/                 # Pages, components, hooks, assets
│   ├── package.json
│   └── vite.config.js
└── next-app/                # Next.js 16 implementation
    ├── app/                 # Next.js app router structure
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js:** v18.0.0 or higher
* **MongoDB:** Local instance or MongoDB Atlas cluster URI
* **Resend API Key:** For email delivery

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using `.env.example`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
TRUST_PROXY=true

ADMIN_EMAIL=admin@example.com
OWNER_EMAIL=your_email@example.com
FROM_EMAIL=onboarding@resend.dev
RESEND_API_KEY=re_your_resend_api_key
```

Run the backend server:
```bash
npm run dev
```

### 2. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

### 3. Next.js App Setup (Alternative Frontend)

```bash
cd ../next-app
npm install
npm run dev
```

---

## 📄 License

This repository is maintained for personal portfolio demonstration.
