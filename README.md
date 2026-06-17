# ShopyZone — Premium Full-Stack E-Commerce Storefront

A modern, visually outstanding full-stack e-commerce web application styled after Amazon and Flipkart. Built with React (frontend), Express.js (backend), Supabase PostgreSQL or local SQLite (database), and Tailwind CSS v4.

---

## 🚀 Key Features

* **Complete Authentication Flow:** Signup, Login, Email Verification via One-Time Password (OTP), Forgot Password, and Reset Password.
* **SMTP Email & Console Simulation Fallback:** Sends actual confirmation/reset emails if SMTP is configured, or logs the verification links/OTPs directly to the backend terminal for seamless zero-setup testing.
* **Customer Pages:** Autocomplete search bar, Category catalog, price/brand/rating filters, image gallery, customer reviews and rating submission, shopping cart with coupons, and a personal profile.
* **Simulated Checkout:** Smooth billing address form entry, coupon deduction validation, and order ID generation with simulated payment status tracking.
* **Order History & Tracking:** Active order log showcasing shipping timelines (Pending -> Shipped -> Delivered) updated in real-time.
* **Full-Featured Admin Dashboard:** Revenue and order charts (built with Recharts), product CRUD management, stock and inventory levels, user directories (with block/unblock suspension controls), and coupon management.

---

## 🛠️ Technology Stack

1. **Frontend:** React, React Router v6, Axios, Recharts, Lucide Icons, and Tailwind CSS v4.
2. **Backend:** Node.js, Express, Sequelize ORM, Nodemailer, and JSON Web Tokens (JWT).
3. **Database:** Supabase PostgreSQL (or zero-setup SQLite fallback).

---

## 🏃 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher recommended)
* npm (v9 or higher)

### 1. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. The dependencies are already installed. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file:
   * **Database:** To use **Supabase**, fill in `DATABASE_URL` with your connection string. If left empty, the server automatically initializes and uses a local SQLite database (`shopyzone.db`) inside the `backend/` folder.
   * **SMTP (Optional):** Fill in SMTP host details to receive actual verification emails. If left empty, all verification codes and reset links will log directly to the server terminal.

4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local client address (usually [http://localhost:5173](http://localhost:5173)).

---

## 🔑 Demo Accounts (Pre-Seeded)

The database automatically populates categories, products, coupons, and test accounts on first start:

### 1. Administrator Account
* **Email:** `admin@shopyzone.com`
* **Password:** `admin123`
* **Purpose:** Accesses the protected admin dashboard (`/admin`) to inspect monthly stats, manage inventory stock, view orders, block customers, or create coupon discount codes.

### 2. Customer Account
* **Email:** `user@shopyzone.com`
* **Password:** `user123`
* **Purpose:** Browses products, submits ratings, applies coupons (e.g. `WELCOME10`), simulates checkout orders, and tracks delivery status.

---

## 📂 Project Structure

```
ShopyZone/
├── backend/
│   ├── config/          # Database configuration (Sequelize)
│   ├── controllers/     # API controllers (Sequelize actions)
│   ├── middleware/      # Auth JWT verification & role checks
│   ├── models/          # Sequelize schemas (User, Product, Coupon, etc.)
│   ├── routes/          # API endpoint routes (Auth, Products, Cart, Orders)
│   ├── utils/           # Nodemailer handler & console logging fallback
│   ├── server.js        # Main server boot & seeding entry
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Layout, Header, Footer, ProtectedRoute, ProductCard
    │   ├── context/     # Auth, Cart, Wishlist, and Toast Context Providers
    │   ├── pages/       # Storefront pages & integrated Admin Dashboard
    │   ├── App.jsx      # Main application router
    │   ├── index.css    # Tailwind CSS imports & animations
    │   └── main.jsx     # App entry point
    ├── index.html       # Single Page Application template
    └── package.json
```
