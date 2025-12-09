# HireMe Backend

Backend server for the **HireMe** platform, built using **Node.js**, **Express**, and **MongoDB**.  
This backend provides RESTful APIs for user management, job postings, applications, analytics, and authentication.

---

## 📜 Table of Contents

- [Technologies Used](#technologies-used)
- [Project Setup](#project-setup)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Role-based Access Control](#role-based-access-control)
- [File Uploads](#file-uploads)
- [Payment Integration](#payment-integration)
- [Postman Documentation](#postman-documentation)
- [License](#license)

---

## ⚡ Technologies Used

- **Node.js** - Runtime environment  
- **Express.js** - Backend framework  
- **MongoDB** - Database  
- **Mongoose** - MongoDB ODM  
- **JWT** - Authentication with access and refresh tokens  
- **Cloudinary** - File storage (images, CVs)  
- **Multer** - File upload middleware  
- **SSL Commerz** - Payment gateway integration  
- **Cors**, **dotenv**, and other essential middlewares  

---

## 🛠 Project Setup

- **Node.js version:** 18+  
- **Database:** MongoDB (Atlas cluster)  
- **Authentication:** JWT (Access & Refresh Tokens)  
- **File Storage:** Cloudinary  
- **Base API URL:** `/api/v1`

The backend provides APIs for:

1. User registration, login, and logout.
2. Role-based access control.
3. CRUD operations for users, jobs, and applications.
4. Analytics for admin users.
5. File uploads (CVs) for job applications.
6. Payment integration with SSL Commerz.

---

## 📁 Folder Structure

```
HIREME/
├── node_modules/
├── public/                       # Public assets
├── src/                          # Source code
│   ├── controller/               # Controllers
│   │   ├── analytics.controller.js
│   │   ├── application.controller.js
│   │   ├── auth.controller.js
│   │   ├── invoice.controller.js
│   │   ├── job.controller.js
│   │   ├── payment.controller.js
│   │
│   ├── database/                 # Database scripts
│   ├── db.js                     # MongoDB connection
│   │
│   ├── helpers/                  # Helper utilities
│   │   ├── cloudinary.js
│   │   ├── customError.js
│   │   ├── globalErrorHandler.js
│   │
│   ├── middleware/               # Middlewares
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   ├── permission.middleware.js
│   │
│   ├── model/                    # Mongoose models
│   │   ├── application.model.js
│   │   ├── invoice.model.js
│   │   ├── job.model.js
│   │   ├── user.model.js
│   │
│   ├── routes/                   # API routes
│   │   ├── api/
│   │   │   ├── analytics.api.js
│   │   │   ├── application.api.js
│   │   │   ├── auth.api.js
│   │   │   ├── invoice.api.js
│   │   │   ├── job.api.js
│   │   │   ├── payment.api.js
│   │   ├── index.api.js
│   │
│   ├── utils/                    # Utilities
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │
│   ├── validation/               # Request validations
│   │   ├── application.validation.js
│   │   ├── auth.validation.js
│   │   ├── job.validation.js
│   │
│   └── app.js                    # Express app initialization
│
├── index.js                  # Server entry point
├── .env                          # Environment variables
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=production
PORT=3000

# Base URLs
BASE_API=/api/v1
BACKEND_URL=http://localhost:3000
BACKENDLIVE_URL=https://hireme-rm8g.onrender.com

# MongoDB
USER_NAME=
PASSWORD=
MONGODB_URL=
MONGODB_NAME=

# JWT Tokens
ACCESTOKEN_SECRET=
ACCESTOKEN_EXPIRE=1h
REFRESH_SECRET=
REFRESH_EXPIRE=15d

#Cloudinary
CLOUD_NAME=
API_KEY=
API_SECREAT=

# SSL Commerz
STORE_ID=
STORE_PASSWORD=
```

> **Note:** All sensitive keys and secrets are left empty for security. Configure them locally before running the server.

---

## 💻 Installation

1. Clone the repository:

```bash
git clone https://github.com/sabbir00921/HireME.git
cd HireME
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the variables listed above.

---

## ▶ Running the Server

```bash
npm start
```

Server will run at `http://localhost:3000` or the `PORT` defined in `.env`.

---

## 📌 API Endpoints

**Base URL:** `/api/v1`

### User Authentication & Management

| Method | Endpoint                 | Description             | Access         |
| ------ | ------------------------ | ----------------------- | -------------- |
| POST   | `/registration`          | Register a new user     | Public         |
| POST   | `/login-users`           | Login user              | Public         |
| POST   | `/logout-users`          | Logout user             | Authenticated  |
| POST   | `/generate-access-token` | Regenerate access token | Authenticated  |
| GET    | `/getall-users`          | Get all users           | Admin (view)   |
| PUT    | `/update-user/:id`       | Update user             | Admin (edit)   |
| DELETE | `/delete-user/:id`       | Delete user             | Admin (delete) |

### Job Management

| Method | Endpoint          | Description      | Access                   |
| ------ | ----------------- | ---------------- | ------------------------ |
| POST   | `/create-job`     | Create a new job | Admin, Employee (add)    |
| GET    | `/get-all-jobs`   | Get all jobs     | Public                   |
| GET    | `/get-job/:id`    | Get job by ID    | Public                   |
| PUT    | `/update-job/:id` | Update job       | Admin, Employee (edit)   |
| DELETE | `/delete-job/:id` | Delete job       | Admin, Employee (delete) |

### Application Management

| Method | Endpoint                  | Description                      | Access                   |
| ------ | ------------------------- | -------------------------------- | ------------------------ |
| POST   | `/create-application`     | Apply for a job (upload CV)      | Job Seeker (add)         |
| GET    | `/get-all-applications`   | Get all applications             | Admin, Employee (view)   |
| GET    | `/get-applicationhistory` | Get application history for user | Job Seeker (view)        |
| PUT    | `/accept-application/:id` | Accept job application           | Admin, Employee (edit)   |
| PUT    | `/reject-application/:id` | Reject job application           | Admin, Employee (edit)   |
| DELETE | `/delete-application/:id` | Delete application               | Admin, Employee (delete) |

### Analytics

| Method | Endpoint         | Description             | Access       |
| ------ | ---------------- | ----------------------- | ------------ |
| GET    | `/get-analytics` | Get analytics for admin | Admin (view) |

---

## 🔑 Authentication

* **Access Token:** Short-lived token (1 hour)  
* **Refresh Token:** Long-lived token (15 days)  
* Tokens are stored as JWT in `.env`.

---

## 🛡 Role-based Access Control

* **Roles:** `admin`, `employee`, `job_seeker`, `user`  
* **Permissions:** `add`, `view`, `edit`, `delete`  
* Implemented via `permission` middleware for route authorization.

---

## 📂 File Uploads

* Uses **Multer** middleware for uploading CVs in job applications.  
* Example route: `/create-application` with `cv` file upload.

---

## 💳 Payment Integration

* Uses **SSL Commerz** as a payment gateway.  
* Configure `STORE_ID` and `STORE_PASSWORD` in `.env`.  
* Base API URL: `https://securepay.sslcommerz.com`

---

## 📬 Postman Documentation

Explore and test APIs using the Postman documentation:  
[HireMe Postman Collection](https://documenter.getpostman.com/view/46718021/2sB3dQw9vt)

---

## 📄 License

This project is licensed under the **MIT License**.

---

**Developed by Sabbir Hossain**  
GitHub: [https://github.com/sabbir00921](https://github.com/sabbir00921)
