---
title: "Maxglow Ecommerce Platform - Complete Technical Documentation"
author: "Maxglow Architecture Team"
date: "June 2026"
---

# Maxglow Ecommerce Platform - Complete Technical Documentation

## 1. PROJECT OVERVIEW

**Project Purpose:**
Maxglow is a premium herbal luxury e-commerce platform designed to facilitate seamless online shopping for organic skincare and haircare products. It integrates a secure, high-performance customer storefront with a comprehensive administrative backend for inventory, order, and user management.

**Business Use Case:**
The platform allows Maxglow to sell products directly to consumers (D2C) bypassing third-party marketplaces. It provides robust tools to track inventory levels, manage dynamic discounts (coupons), process payments securely, and analyze sales reports, ultimately scaling their digital retail presence.

**Main Features:**
- Complete shopping cart and checkout pipeline.
- Secure payment gateway integration (Razorpay).
- Real-time inventory tracking and stock alerts.
- Role-based Access Control (Super Admin, Manager, Staff, Customer).
- Automated GST invoice generation.
- Product reviews and dynamic coupon system.

**User Types:**
1. **Customers:** Browse products, add to cart, checkout, manage addresses, and view order history.
2. **Staff/Managers:** Process orders, update stock, and view basic reports.
3. **Super Admin:** Full access to financial metrics, refund processing, coupon generation, and global system settings.

**Customer Journey:**
`Landing Page -> Product Search/Filter -> Product Details -> Add to Cart -> Secure Checkout (Address + Razorpay) -> Order Confirmation -> Tracking Dashboard.`

---

## 2. COMPLETE TECHNOLOGY STACK

### Frontend Stack
- **Framework:** **Next.js 14.2** (App Router) - Used for server-side rendering (SSR), optimized SEO, and robust file-based routing.
- **UI Library:** **React 18** - Component-based architecture for dynamic user interfaces.
- **Styling:** **Bootstrap 5.3** - Used for responsive layout grids, modal dialogs, and rapid UI prototyping.
- **State Management:** **Redux Toolkit (RTK)** - Centralized global state management (managing cart, auth tokens, and admin datasets).
- **Icons:** **Lucide React** - Lightweight, consistent vector icons.
- **Data Fetching:** **Axios** - Used for making promise-based HTTP requests to the backend REST API.

### Backend Stack
- **Runtime:** **Node.js** - Asynchronous, event-driven JavaScript runtime for high-throughput API handling.
- **Framework:** **Express.js** - Minimalist web framework handling routing, middleware, and HTTP requests.
- **Database:** **MongoDB** (with **Mongoose** ORM) - NoSQL database used for flexible, document-based data storage (Orders, Users, Products).
- **Authentication:** **JSON Web Tokens (JWT)** - Used for stateless, secure user authentication via HTTP-only cookies and Bearer headers.
- **Security:** **Bcrypt.js** (Password hashing), **Helmet** (HTTP headers), **CORS** (Cross-origin protection).

---

## 3. COMPLETE DEPENDENCY ANALYSIS

### Frontend Dependencies (`frontend/package.json`)
| Package Name | Version | Purpose | Used In |
| :--- | :--- | :--- | :--- |
| `next` | ^14.2.3 | Core React framework. | Entire Application (`app/`) |
| `react`, `react-dom`| ^18.3.1 | Core UI library for components. | All components |
| `@reduxjs/toolkit` | ^2.2.3 | Global state management. | `store/`, Redux slices |
| `react-redux` | ^9.1.2 | Binds React components to Redux store. | `layout.js` (Provider) |
| `axios` | ^1.6.8 | HTTP client for backend communication. | Redux slices, Pages |
| `bootstrap` | ^5.3.3 | CSS framework for responsive design. | `layout.js`, UI components |
| `lucide-react` | ^0.378.0| SVG Icons library. | UI Buttons, Navbars |
| `recharts` | ^3.9.0 | Data visualization for Admin Dashboard. | `admin/dashboard/page.js` |

### Backend Dependencies (`backend/package.json`)
| Package Name | Version | Purpose | Used In |
| :--- | :--- | :--- | :--- |
| `express` | ^4.19.2 | Web server routing. | `server.js`, `routes/` |
| `mongoose` | ^8.3.4 | MongoDB object modeling. | `models/`, `controllers/`|
| `jsonwebtoken` | ^9.0.2 | Creating/verifying auth tokens. | `middleware/auth.js`, `authController.js`|
| `bcryptjs` | ^2.4.3 | Hashing user passwords securely. | `models/User.js` |
| `razorpay` | ^2.9.2 | Payment gateway SDK. | `OrderController.js` |
| `multer` | ^1.4.5 | Handling `multipart/form-data` (images).| `uploadRoutes.js` |
| `helmet` | ^7.1.0 | Securing HTTP headers. | `server.js` |
| `express-rate-limit`| ^7.2.0 | Brute-force attack prevention. | Authentication routes |

---

## 4. COMPLETE FOLDER STRUCTURE EXPLANATION

### Frontend (`frontend/src/`)
- **/app**: Contains Next.js App Router pages.
  - `/admin`: All administrative protected routes (Dashboard, Orders, Inventory).
  - `/cart`, `/checkout`, `/login`, `/register`: Customer-facing routes.
- **/components**: Reusable UI blocks (`Header.js`, `Footer.js`, `ProductCard.js`, `AdminSidebar.js`).
- **/store**: Redux configuration (`store.js`) and slices.
  - `authSlice.js`: Manages login state, JWT tokens, and user profile data.
  - `cartSlice.js`: Manages local shopping cart array, total calculation, and coupons.
  - `ordersSlice.js`: Handles payment processing and order history fetching.
  - `adminSlice.js`: Fetches aggregate data for the admin dashboard.

### Backend (`backend/src/`)
- **/models**: Mongoose schemas defining database structure (`User.js`, `Order.js`, `Product.js`).
- **/controllers**: Core business logic. Functions that receive `req` and send `res` (`OrderController.js`).
- **/routes**: Maps URL endpoints to specific Controller functions (`orderRoutes.js`).
- **/middleware**: Functions that intercept requests before they reach the controller (`auth.js` for JWT verification, `errorHandler.js` for global error trapping).
- **/config**: Database connection (`db.js`).
- **/utils**: Helper scripts (`seeder.js` for injecting dummy data).

*Data Flow:* `Route -> Middleware (Auth) -> Controller -> Model (DB) -> Response`

---

## 5. COMPLETE API DOCUMENTATION

### Authentication
- **POST `/api/auth/register`**: Creates a new user. Hashes password using bcrypt. Returns JWT.
- **POST `/api/auth/login`**: Authenticates user. Attaches JWT as a secure cookie and JSON payload.
- **GET `/api/auth/me`**: (Protected) Fetches current user profile using JWT.

### Products
- **GET `/api/products`**: Returns all available products. Supports filtering.
- **POST `/api/products`**: (Admin only) Creates a new product in the catalog.
- **PUT `/api/products/:id`**: (Admin only) Updates product details (price, stock).

### Orders & Payments
- **POST `/api/orders`**: (Protected) Creates a local Order document and a pending Razorpay Order ID.
- **POST `/api/orders/verify`**: (Protected) Cryptographically verifies the Razorpay signature to confirm successful payment. Marks order as "Paid".
- **GET `/api/orders/myorders`**: (Protected) Fetches order history for the logged-in customer.
- **GET `/api/orders/admin`**: (Admin only) Fetches all global orders.

### Inventory & Admin
- **GET `/api/reports/dashboard`**: (Admin only) Returns total revenue, active users, and low-stock alerts.
- **POST `/api/refunds`**: (Super Admin) Triggers the Razorpay Refund API and marks order as Cancelled.

---

## 6. DATABASE DOCUMENTATION

**MongoDB Collections:**

1. **Users (`User.js`)**
   - *Fields*: `name`, `email`, `password` (hashed), `role` (Customer, Admin), `addresses` (Array of objects).
   - *Relationships*: Linked to Orders and Reviews.

2. **Products (`Product.js`)**
   - *Fields*: `name`, `description`, `price`, `discount`, `stock`, `images`, `category`.
   - *Relationships*: Referenced inside the Order items array.

3. **Orders (`Order.js`)**
   - *Fields*: `user` (ObjectId), `items` (Array of product IDs, price, qty), `totalAmount`, `paymentStatus` (Pending, Paid, Failed), `orderStatus` (Placed, Packed, Shipped, Delivered).
   - *Relationships*: Links `User` and multiple `Products`. Holds `razorpayOrderId`.

4. **Coupons (`Coupon.js`)**
   - *Fields*: `code`, `discountPercentage`, `expiryDate`, `isActive`.

5. **Logs (`Log.js`)**
   - *Fields*: `adminId`, `action`, `targetId`, `timestamp`.
   - *Purpose*: Audit trail for Super Admins to monitor staff activity.

---

## 7. COMPLETE APPLICATION FLOW

**Customer Checkout Flow:**
1. Customer clicks "Add to Cart" -> `cartSlice` Redux state updates local storage.
2. Customer navigates to `/checkout` -> Enters Shipping Address.
3. Clicks "Pay" -> Dispatches `createOrder` -> Calls `POST /api/orders`.
4. Backend Controller creates a `razorpay_order_id` and saves Order as "Pending". Returns ID to frontend.
5. Frontend injects Razorpay `checkout.js` SDK and opens the Payment Modal.
6. Customer completes payment -> Razorpay returns `razorpay_payment_id` and `signature`.
7. Frontend calls `POST /api/orders/verify`.
8. Backend verifies the SHA256 cryptographic signature. If valid, updates Order to "Paid" and reduces Product Inventory (`stock = stock - qty`).
9. Frontend redirects to Success Page.

**Admin Management Flow:**
1. Admin logs in -> Receives JWT with `role: 'Manager'`.
2. Navigates to `/admin/orders` -> Dispatches `fetchAdminOrders`.
3. Backend checks JWT via `protect` and `admin` middleware.
4. Admin views Order Details -> Clicks "Print Invoice".
5. Admin updates status to "Shipped" -> Calls `PUT /api/orders/:id/status`. Backend logs action in `Log` collection.

---

## 8. AUTHENTICATION & SECURITY

- **JWT Flow**: Upon login, a JWT is signed using a secret (`process.env.JWT_SECRET`). It is returned to the client and stored in `localStorage` (or Redux state) AND securely set as an HTTP-only cookie.
- **Protected Routes**: The `protect` middleware extracts the Bearer token, decodes the User ID, and attaches the full `req.user` object to the request. If the token is invalid or missing, it blocks execution with a `401 Unauthorized` error.
- **RBAC (Role-Based Access Control)**: The `admin` middleware runs after `protect`. It checks if `req.user.role` matches allowed roles (Super Admin, Manager). If a Customer tries to access `/api/products/create`, they are blocked with `403 Forbidden`.
- **Password Security**: Passwords are never stored in plain text. `User.js` utilizes a Mongoose `pre-save` hook to encrypt the password using `bcryptjs` with a salt factor of 10.

---

## 9. REDUX STATE MANAGEMENT

The frontend relies heavily on `@reduxjs/toolkit` for predictable state changes:

- **`authSlice`**: Stores `{ user, token, loading, error }`. Actions include `loginUser`, `registerUser`, and `logoutUser`.
- **`cartSlice`**: Stores `{ items, subtotal, tax, total, couponCode }`. Automatically recalculates GST (18%) and shipping rules whenever `addToCart` or `removeFromCart` is dispatched. Syncs with browser `localStorage` to persist cart data across tabs.
- **`ordersSlice`**: Manages the asynchronous lifecycle (Pending, Fulfilled, Rejected) of payment intents and fetches the user's personal order history.
- **`adminSlice`**: Fetches bulk datasets (all orders, all users, inventory analytics) specifically required by the Admin dashboard components.

---

## 10. THIRD-PARTY SERVICES

1. **Razorpay (Payment Gateway)**
   - Used for processing domestic INR transactions (Credit Card, UPI, Netbanking).
   - *Flow*: `razorpay.orders.create()` on backend -> Frontend SDK intercepts payment -> `crypto.createHmac('sha256')` on backend verifies the success signature to prevent tampering.

2. **File Storage (Multer)**
   - Currently configured for local disk storage (`/public/uploads`).
   - Allows Admins to upload product thumbnail images safely.

---

## 11. FEATURES LIST

**Customer Features:**
- Seamless Product Browsing & Real-time stock visibility.
- Persistent Shopping Cart (survives page reloads).
- Secure Checkout with Saved Addresses.
- Razorpay Payment Integration.
- Dynamic Cross-Selling Recommendations at Checkout.
- Order History Tracking.

**Admin Features:**
- Centralized Analytics Dashboard (Revenue, Pending Orders).
- Product CRUD (Create, Read, Update, Delete) & Inventory Management.
- Order Processing Pipeline (Placed -> Confirmed -> Packed -> Shipped).
- Automated A4 Printable GST Invoice Generation.
- One-Click Razorpay Refunds (Super Admin only).
- Coupon Code Generation and Expiry Management.

---

## 12. ERROR HANDLING & SECURITY CHECK

- **Global Error Middleware**: `backend/src/middleware/errorHandler.js` catches unhandled exceptions and formats them into a standardized `{ success: false, message: "..." }` JSON structure. It actively intercepts Mongoose `ValidationError` and `CastError` (invalid MongoDB IDs).
- **Security Check**:
  - `helmet`: Automatically sanitizes HTTP headers to prevent XSS.
  - `cors`: Restricts API access strictly to whitelisted frontend ports (e.g., `localhost:7051`).
  - `.env`: API Keys (Razorpay Secret, JWT Secret, MongoDB URI) are stored securely in environment variables and never committed to version control.

---

## 13. DEPLOYMENT INFORMATION

*Production Architecture:*
1. **Frontend**: The Next.js application should be built (`npm run build`) and deployed to a Vercel, Netlify, or AWS Amplify environment for global edge-caching and SSR support.
2. **Backend**: The Node.js/Express server should be containerized (Docker) and deployed to an AWS EC2 instance, Heroku, or Render.
3. **Database**: MongoDB Atlas is recommended for production cloud hosting, offering automated backups and horizontal scaling.
4. **Storage**: Local `multer` uploads should be migrated to AWS S3 buckets in production for persistent media storage.

---

## 14. INTERVIEW / CLIENT QUESTIONS & ANSWERS

**Q1: Why was Next.js chosen over pure React for the frontend?**
*Answer:* Next.js was chosen for its App Router architecture and Server-Side Rendering (SSR) capabilities. For an e-commerce site, SEO is critical. Next.js allows search engines to crawl fully rendered product pages. Additionally, its built-in optimizations for images and fonts drastically improve page load speeds.

**Q2: How does the application handle a scenario where a user pays, but the internet drops before the backend verifies the signature?**
*Answer:* The backend initially creates a "Pending" order in MongoDB alongside the Razorpay `order_id`. If the frontend drops, the payment is captured by Razorpay, but the database remains "Pending". A production environment would utilize **Razorpay Webhooks** to asynchronously notify the backend server of a successful payment, entirely independent of the user's browser connection.

**Q3: How is the inventory updated securely?**
*Answer:* Inventory is decremented only *after* the `POST /api/orders/verify` route cryptographically confirms the Razorpay signature. This ensures stock is never deducted for failed or tampered transactions.

**Q4: How can this platform scale for 100,000+ users?**
*Answer:*
1. Implement Redis caching for the `/api/products` endpoint since product data rarely changes but is fetched constantly.
2. Migrate images to AWS S3 and serve them via a CDN (CloudFront).
3. Scale the Node.js backend horizontally behind an Nginx Load Balancer or an AWS Application Load Balancer.

---
*End of Document*
