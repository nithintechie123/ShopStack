# 🛒 ShopStack — Multi-Vendor Marketplace

Hey there! Welcome to **ShopStack**! 

ShopStack is a multi-vendor e-commerce platform where customers can buy items, vendors can sell products, and admins can keep everything running smoothly. 

We built the frontend with **React + Vite** and the backend with **Spring Boot** and **PostgreSQL**.

---

## 📖 Table of Contents

1. [🏠 Project Overview](#-project-overview)
2. [👥 User Roles & Permissions](#-user-roles--permissions)
3. [🏗️ Architecture & Directory Structure](#️-architecture--directory-structure)
4. [🧰 Tech Stack](#-tech-stack)
5. [📍 Completed Milestones](#-completed-milestones)
6. [🛠️ Installation & Setup Guide](#️-installation--setup-guide)
7. [🔌 Core API Endpoints](#-core-api-endpoints)
8. [🚀 Cool Features we Added](#-cool-features-we-added)

---

## 🏠 Project Overview

Here is a quick look at how the app works for different users:

*   **Customers:** Can search for items, filter by category, add things to their shopping cart or wishlist, enter their shipping info, make mock payments, and track their order status.
*   **Vendors:** Get their own store dashboard! They can list new products, update stock levels, and ship orders.
*   **Admins:** The regulators of the app. They approve or reject new vendors, review product listings, and view store statistics.
*   **Warehouse Staff:** Help keep track of physical inventory in the database and handle storage logistics.

---

## 👥 User Roles & Permissions

We use Spring Security and JSON Web Tokens (JWT) to make sure everyone only sees what they are supposed to:

| Role | What they can do |
| :--- | :--- |
| **`CUSTOMER`** | Browse products, manage wishlist/cart, place orders, and pay. |
| **`VENDOR`** | Register a store, submit products for approval, and track vendor-specific orders. |
| **`ADMIN`** | Approve/reject vendors, approve/reject products, and see platform-wide sales reports. (Admins cannot edit stock directly, to keep records clean!). |
| **`WAREHOUSE_STAFF`** | Search physical products, adjust stock levels in the warehouse database. |

---

## 🏗️ Architecture & Directory Structure

Here is how the project files are organized. We have separated the project into two main folders:

*   [backend/](file:///d:/Infosys%20Springboard/ShopStack/backend) — Spring Boot API
*   [frontend/](file:///d:/Infosys%20Springboard/ShopStack/frontend) — React + Vite UI

```
ShopStack/
├── backend/                                   ← Spring Boot REST API
│   ├── src/main/java/com/shopstack/shopstack/
│   │   ├── controller/                        ← Handles API requests (Auth, Products, Orders)
│   │   ├── dto/                               ← Data formats for requests and responses
│   │   ├── model/                             ← Database entities (User, Product, Order, etc.)
│   │   ├── repository/                        ← Database queries
│   │   ├── security/                          ← Login security & JWT config
│   │   ├── service/                           ← Business logic (Payments, Order Processing)
│   │   └── ShopstackApplication.java          ← Main backend runner file
│   └── pom.xml                                ← Backend dependencies
└── frontend/                                  ← React SPA with Vite
    ├── public/                                ← Static images and assets
    └── src/
        ├── api/                               ← Axios client setup to talk to the backend
        ├── components/                        ← Shared UI widgets (navbars, modals, cards)
        ├── context/                           ← Global state managers (Auth state, Cart state)
        ├── pages/                             ← Webpages (Dashboard, Login, Checkout)
        ├── App.jsx                            ← App Router & Route guards
        ├── index.css                          ← Stylesheet
        └── main.jsx                           ← React app starter
```

The key starting files for each part of the app are:
*   Backend Main App Class: [ShopstackApplication.java](file:///d:/Infosys%20Springboard/ShopStack/backend/src/main/java/com/shopstack/shopstack/ShopstackApplication.java)
*   Backend Dependencies: [pom.xml](file:///d:/Infosys%20Springboard/ShopStack/backend/pom.xml)
*   Frontend Router: [App.jsx](file:///d:/Infosys%20Springboard/ShopStack/frontend/src/App.jsx)
*   Frontend Styles: [index.css](file:///d:/Infosys%20Springboard/ShopStack/frontend/src/index.css)
*   Frontend Entry Point: [main.jsx](file:///d:/Infosys%20Springboard/ShopStack/frontend/src/main.jsx)

---

## 🧰 Tech Stack

### Frontend (UI)
*   **React 19** & **Vite 8**
*   **React Router DOM 7**
*   **Axios 1.x** (with automatic JWT headers for security)
*   **Tailwind CSS 4**
*   **Lucide React** (Icons)

### Backend (API & DB)
*   **Java 17** & **Spring Boot 3**
*   **Spring Security 6** (with BCrypt Password Encryption)
*   **Spring Data JPA & Hibernate 6**
*   **PostgreSQL 17** (Database)
*   **Lombok** (keeps our Java code clean and short!)
*   **JJWT** (JWT token generation)

---

## 📍 Completed Milestones

Here is the progress we have made so far! All of these features are fully built and working:

### 🌟 Milestone 1: Setting up the Core App
*   **Multi-Role Sign-Up & Login:** Users can sign up as Customers or Vendors.
*   **Security (JWT):** Implemented secure, passwordless logins using tokens.
*   **Vendor Onboarding:** Added a screen where Admins can approve or reject new vendor stores.
*   **Product Review Flow:** When a vendor submits a product, it remains invisible until an Admin approves it.
*   **Warehouse Stock Hub:** Created a workspace for warehouse staff to log stock levels.

### 🌟 Milestone 2: Carts, Checkouts & Payments
*   **Shopping Cart & Wishlist:** Fully interactive cart and wishlist with automatic discount coupon calculation.
*   **Multi-Step Checkout:** Form validation for billing/shipping addresses, and a step-by-step order tracking stepper.
*   **Safe Database Transactions (Concurrency):** Programmed database locking on product stock to ensure that if a product is popular, we never sell more than we have!
*   **Mock Payment Processor:** Simulated credit card and bank checking accounts to test orders.

### 🌟 Extra Polish & Enhancements
*   **Razorpay Integration:** Full payment gateway integration with payment verification.
*   **Multi-Tab Session Isolation:** Switched local storage to session storage so you can open multiple roles in different browser tabs at the exact same time without the sessions overlapping!
*   **Modern Light Design:** Refreshed the user interface with a high-contrast, clean light theme.
*   **Login Image Carousel:** Added interactive, auto-playing image sliders on the login and signup pages.
*   **Smart Dashboards:** Added sorting columns and CSV exporting to the Vendor inventory table.
*   **Admin Stock Safety Lock:** Restricted admins from editing stock values, leaving inventory control to vendors and warehouse staff.

---

## 🛠️ Installation & Setup Guide

Want to run ShopStack on your local machine? Just follow these simple steps!

### Prerequisites
*   **Git**
*   **Java JDK 17**
*   **Node.js (v18+ or v20+)**
*   **PostgreSQL** (running on port `5432`)

---

### Step 1: Clone the Repo
```bash
git clone https://github.com/nithintechie123/ShopStack.git
cd ShopStack
```

---

### Step 2: Set Up the Backend (Spring Boot)
1.  Open your database client and create a new database:
    ```sql
    CREATE DATABASE shopstack;
    ```
2.  Go to the backend folder:
    ```bash
    cd backend
    ```
3.  Copy [.env.example](file:///d:/Infosys%20Springboard/ShopStack/backend/.env.example) to create your own local configuration file:
    *   **Windows (PowerShell):** `Copy-Item .env.example .env`
    *   **Linux/Mac:** `cp .env.example .env`
4.  Open the newly created configuration file at [.env](file:///d:/Infosys%20Springboard/ShopStack/backend/.env) and insert your PostgreSQL credentials:
    ```env
    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/shopstack
    SPRING_DATASOURCE_USERNAME=your_postgres_username
    SPRING_DATASOURCE_PASSWORD=your_postgres_password
    SHOPSTACK_JWT_SECRET=your_super_secure_jwt_secret_key_at_least_256_bits
    SHOPSTACK_JWT_EXPIRATION=86400000
    RAZORPAY_KEY_ID=test_razorpay_key
    RAZORPAY_KEY_SECRET=test_razorpay_secret
    ```
5.  Run the backend:
    *   **Windows:** `.\mvnw.cmd spring-boot:run`
    *   **Linux/Mac:** `./mvnw spring-boot:run`
    
    The backend will start running on port `8081`!

---

### Step 3: Set Up the Frontend (React + Vite)
1.  Open a new terminal tab/window and navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Copy [frontend/.env.example](file:///d:/Infosys%20Springboard/ShopStack/frontend/.env.example) to create your `.env` file:
    *   **Windows (PowerShell):** `Copy-Item .env.example .env`
    *   **Linux/Mac:** `cp .env.example .env`
3.  Make sure your environment file points to your backend URL:
    ```env
    VITE_API_BASE_URL=http://localhost:8081
    ```
4.  Install the required packages and start the development server:
    ```bash
    npm install
    npm run dev
    ```
5.  Open `http://localhost:5173` in your browser! 🎉

---

## 🔌 Core API Endpoints

Here are the main API routes the frontend uses to talk to the backend:

### Auth
*   `POST /api/v1/auth/register` - Sign up a new user.
*   `POST /api/v1/auth/login` - Log in and receive a secure token.

### Products
*   `GET /api/v1/products` - Get all approved products (Visible to public).
*   `POST /api/v1/products` - Submit a new product (Vendor only).
*   `PUT /api/v1/products/{id}` - Edit a product's details (Vendor only).
*   `PATCH /api/v1/products/{id}/status` - Approve or reject a product listing (Admin only).

### Orders
*   `POST /api/v1/orders/checkout` - Pay and place an order.
*   `GET /api/v1/orders/my-orders` - Get order history (Customer only).
*   `PATCH /api/v1/orders/{orderId}/status` - Update shipping stage (Vendor/Admin).

---

## 🚀 Cool Features we Added

*   **🔒 Stock Concurrency Protection (Pessimistic Locking):** We lock inventory records in the database during checkout so that if multiple customers checkout at the same millisecond, the database won't oversell the stock.
*   **🎉 Interactive UI Rewards:** checkout success triggers custom confetti animations and checks.
*   **🔑 Safe Configuration (.env):** Sensitive login details and passwords are loaded using environment variables that are kept out of GitHub.
*   **🌐 Multiple Tabs, Different Roles:** By using session storage, you can log in as a Customer in one browser tab and an Admin or Vendor in another tab to test the app easily.

---

## 👥 Team B Members

*   **Nithin Kumar Gorintala**
*   **Banavathu Yaswanthi Bai**
*   **Poushali Mitra**
*   **Maha Lakshmi Jogi**
*   **Rajeev Ranjan Singh**
*   **Meesala Mahesh**
*   **Shaik Abdul Raheem**
*   **Shamkumar M**
*   **Kaja Sunand**
*   **Veldal Venkata Rohit Kumar Reddy**

