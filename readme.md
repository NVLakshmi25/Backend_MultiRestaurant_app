https://github.com/GreatStackDev/notes/blob/main/Basic_Express_with_Typescript.md 


  create  a basic   typescript  app
Tasks ListedInitialized backend server with MongoDB database connectivity.Added health check endpoint for server status monitoring.Configured server environment with middleware support and database integration.    Show more


>>>  Interface Breakdownname: Required string for the user's name.
email: Required string for the user's email.
password?: Optional string (often omitted if using external auth like Google).
phone?: Optional string for contact information.
role: Union type allowing only "user", "admin", or "owner".
createdAt / updatedAt: Date objects for tracking record history.

---------------------------------------------------------------------------
New Features
User registration with email validation and duplicate account prevention
User login with token-based session authentication
Protected endpoints requiring valid authentication tokens
Role-based access control with admin and owner permission levels
Secure password handling and storage
Authenticated user profile retrieval endpoint
Global error handling for API responses
------------------------------------------------------------------------------

## Summary

Implemented authentication and authorization for the backend.

## Changes

- Added user registration
- Added user login
- Added bcrypt password hashing
- Added JWT token generation
- Added JWT authentication middleware
- Added protected `/api/auth/me` endpoint
- Added admin-only authorization
- Added owner/admin authorization
- Prevented passwords from being returned in user responses

## Testing

- Tested user registration
- Tested user login
- Tested JWT authentication
- Tested authenticated user profile endpoint
- Tested admin authorization
- Tested owner authorization

## Files Changed

- `src/controllers/AuthController.ts`
- `src/middleware/auth.ts`
- `src/routes/authRoutes.ts`
- `src/models/User.ts`
- `src/services/token-service.ts`

----------------------------------------------------------
# 🔐 Node.js + Express + TypeScript Authentication API

A beginner-friendly backend authentication and authorization API built using **Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, and bcrypt**.

This project demonstrates how to build a secure authentication system with:

* 👤 User Registration
* 🔑 User Login
* 🔐 JWT Authentication
* 🛡️ Protected Routes
* 👑 Role-Based Authorization
* 🔒 Password Hashing with bcrypt
* 🍃 MongoDB Database Integration
* 📦 Mongoose Models and Schemas
* 🌐 REST API Architecture
* ⚙️ Environment Variables
* 🚨 Error Handling

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technologies Used](#-technologies-used)
4. [Project Architecture](#-project-architecture)
5. [Project Structure](#-project-structure)
6. [Installation](#-installation)
7. [Environment Variables](#-environment-variables)
8. [Running the Project](#-running-the-project)
9. [API Endpoints](#-api-endpoints)
10. [User Registration](#-1-user-registration)
11. [User Login](#-2-user-login)
12. [JWT Authentication](#-3-jwt-authentication)
13. [Protected Routes](#-4-protected-routes)
14. [Role-Based Authorization](#-5-role-based-authorization)
15. [Authentication Flow](#-authentication-flow)
16. [Database Structure](#-database-structure)
17. [HTTP Status Codes](#-http-status-codes)
18. [Security Features](#-security-features)
19. [Important Project Notes](#-important-project-notes)
20. [Testing with Postman](#-testing-with-postman)
21. [Interview Explanation](#-interview-explanation)
22. [Future Improvements](#-future-improvements)

---

# 🚀 Project Overview

This project is a REST API that provides authentication and authorization functionality.

A user can register with their:

* Name
* Email
* Password
* Phone number

During registration, the password is hashed using **bcrypt** before it is stored in MongoDB.

After registration or login, the backend generates a **JSON Web Token (JWT)**.

The client can then send this JWT when accessing protected APIs.

The backend verifies the JWT and identifies the authenticated user.

The project also supports different user roles:

```text
user
admin
owner
```

Different roles can have different permissions.

---

# ✨ Features

### Authentication

* User registration
* User login
* Password hashing
* Password verification
* JWT generation
* JWT verification
* Get currently logged-in user

### Authorization

* Normal user access
* Admin-only access
* Owner/admin access
* Role-based access control

### Database

* MongoDB
* Mongoose
* User schema
* Email uniqueness
* Automatic timestamps

### Backend

* Express.js
* TypeScript
* REST APIs
* Middleware
* Error handling
* CORS
* Environment variables

---

# 🛠️ Technologies Used

| Technology     | Purpose               |
| -------------- | --------------------- |
| Node.js        | JavaScript runtime    |
| Express.js     | Backend web framework |
| TypeScript     | Static typing         |
| MongoDB        | NoSQL database        |
| Mongoose       | MongoDB ODM           |
| bcrypt         | Password hashing      |
| JSON Web Token | Authentication        |
| dotenv         | Environment variables |
| CORS           | Cross-origin requests |

---

# 🏗️ Project Architecture

The application follows a simple layered backend architecture:

```text
                    CLIENT
                React / Postman
                       |
                       | HTTP Request
                       ↓
                 EXPRESS SERVER
                       |
                       ↓
                    ROUTES
                       |
                       ↓
                  MIDDLEWARE
                       |
             ┌─────────┴─────────┐
             ↓                   ↓
       Authentication       Authorization
             |
             ↓
          CONTROLLER
             |
             ↓
          MONGOOSE
             |
             ↓
          MONGODB
             |
             ↓
          RESPONSE
```

---

# 📁 Project Structure

Recommended structure:

```text
project/
│
├── src/
│   │
│   ├── config/
│   │   └── db.ts
│   │
│   ├── controllers/
│   │   └── auth.ts
│   │
│   ├── middlewares/
│   │   └── authmiddleware.ts
│   │
│   ├── models/
│   │   └── User.ts
│   │
│   ├── routes/
│   │   ├── AuthRoutes.ts
│   │   └── UserRoutes.ts
│   │
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Folder responsibilities

```text
config/
    Database configuration

models/
    MongoDB schemas and models

controllers/
    Application/business logic

middlewares/
    Authentication and authorization

routes/
    API endpoint definitions

server.ts
    Express application setup
```

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone <your-github-repository-url>
```

## 2. Move into the project

```bash
cd <project-folder>
```

## 3. Install dependencies

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/authentication_db

JWT_SECRET=your_super_secret_key

NODE_ENV=development
```

### Environment variables

| Variable     | Purpose                            |
| ------------ | ---------------------------------- |
| `PORT`       | Backend server port                |
| `MONGO_URI`  | MongoDB connection string          |
| `JWT_SECRET` | Secret used to sign and verify JWT |
| `NODE_ENV`   | Application environment            |

### Important

Never commit your `.env` file to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules/
.env
dist/
```

---

# ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Or, depending on your package configuration:

```bash
npm start
```

The server runs at:

```text
http://localhost:5000
```

You can test the root endpoint:

```text
GET http://localhost:5000/
```

Response:

```text
Server is Live!
```

---

# 🔌 API Endpoints

## Authentication APIs

| Method | Endpoint             | Description      | Authentication |
| ------ | -------------------- | ---------------- | -------------- |
| POST   | `/api/auth/register` | Register user    | ❌              |
| POST   | `/api/auth/login`    | Login user       | ❌              |
| GET    | `/api/auth/me`       | Get current user | ✅              |

## User APIs

| Method | Endpoint             | Description         | Authentication |
| ------ | -------------------- | ------------------- | -------------- |
| GET    | `/api/users/profile` | Get profile         | ✅              |
| GET    | `/api/users/admin`   | Admin-only endpoint | ✅ Admin        |

> The `UserRoutes.ts` file defines these user routes. The current `server.ts` shown in this project mounts `authRouter`, but does not yet mount `userRouter`. See the Important Project Notes section below.

---

# 👤 1. User Registration

## Endpoint

```http
POST /api/auth/register
```

## Request Body

```json
{
    "name": "Venkat",
    "email": "venkat@gmail.com",
    "password": "123456",
    "phone": "9876543210"
}
```

## What happens?

```text
Client
   ↓
POST /api/auth/register
   ↓
Express Router
   ↓
registerUser Controller
   ↓
Validate fields
   ↓
Check existing user
   ↓
Hash password with bcrypt
   ↓
Create MongoDB user
   ↓
Generate JWT
   ↓
Send response
```

## Successful Response

```json
{
    "_id": "user-id",
    "name": "Venkat",
    "email": "venkat@gmail.com",
    "phone": "9876543210",
    "role": "user",
    "token": "JWT_TOKEN"
}
```

The registration controller validates required fields, checks whether the email already exists, hashes the password, creates the user, assigns the initial role as `user`, and returns a JWT.

---

# 🔑 2. User Login

## Endpoint

```http
POST /api/auth/login
```

## Request Body

```json
{
    "email": "venkat@gmail.com",
    "password": "123456"
}
```

## Login Flow

```text
Email + Password
       ↓
Find user by email
       ↓
User exists?
   ↓          ↓
 No         Yes
 ↓           ↓
401       bcrypt.compare()
              ↓
          Password match?
           ↓         ↓
          No        Yes
          ↓          ↓
         401     Generate JWT
                     ↓
                    200
```

## Successful Response

```json
{
    "_id": "user-id",
    "name": "Venkat",
    "email": "venkat@gmail.com",
    "phone": "9876543210",
    "role": "user",
    "token": "JWT_TOKEN"
}
```

The login controller searches for the user by normalized email and verifies the password using `bcrypt.compare()`.

---

# 🔐 3. JWT Authentication

JWT stands for:

> **JSON Web Token**

JWT is used to authenticate users after successful registration or login.

The token is generated using:

```typescript
jwt.sign(
    { id },
    secret,
    {
        expiresIn: "30d"
    }
);
```

The JWT contains the user's ID.

Conceptually:

```text
User ID
   ↓
JWT Payload
   ↓
JWT Signature
   ↓
JWT Token
```

---

# 🪪 Sending JWT

For protected routes, the client sends the token in the HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Example:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

---

# 🛡️ 4. Protected Routes

The `protect` middleware protects private routes.

Example:

```typescript
authRouter.get(
    "/me",
    protect,
    getMe
);
```

The request flow is:

```text
GET /api/auth/me
        ↓
protect middleware
        ↓
Read Authorization header
        ↓
Extract JWT
        ↓
Verify JWT
        ↓
Get user ID
        ↓
Find user in MongoDB
        ↓
Remove password
        ↓
req.user = user
        ↓
next()
        ↓
getMe()
        ↓
Return user
```

The middleware reads the Bearer token, verifies it with `jwt.verify()`, finds the corresponding user, excludes the password, and attaches the user to `req.user`.

---

# 👤 5. Get Current User

## Endpoint

```http
GET /api/auth/me
```

## Header

```http
Authorization: Bearer <JWT_TOKEN>
```

## Successful Response

```json
{
    "_id": "user-id",
    "name": "Venkat",
    "email": "venkat@gmail.com",
    "phone": "9876543210",
    "role": "user"
}
```

The password is excluded.

---

# 👑 6. Role-Based Authorization

The application supports:

```text
user
admin
owner
```

This is called:

> **Role-Based Access Control (RBAC)**

---

## Normal User

A normal user can access authenticated user functionality.

```text
user
 ↓
protect
 ↓
allowed
```

---

## Admin

The `adminOnly` middleware checks:

```typescript
req.user?.role === "admin"
```

If the user is an admin:

```text
admin
  ↓
adminOnly
  ↓
next()
  ↓
Route handler
```

Otherwise:

```text
user
 ↓
adminOnly
 ↓
403 Forbidden
```

The `adminOnly` middleware allows only users whose role is `admin`.

---

# 👑 Owner / Admin Authorization

The project also defines `ownerOnly`.

It allows:

```text
owner
admin
```

and rejects:

```text
user
```

The middleware checks the authenticated user's role before allowing the request to continue.

---

# 🔄 Authentication Flow

## Registration

```text
             REGISTER
                 |
                 ↓
         Validate Request
                 |
                 ↓
       Check Existing Email
                 |
                 ↓
          Hash Password
                 |
                 ↓
          Save to MongoDB
                 |
                 ↓
           Generate JWT
                 |
                 ↓
             Response
```

---

## Login

```text
               LOGIN
                 |
                 ↓
            Find User
                 |
                 ↓
         Compare Password
                 |
                 ↓
        Generate JWT Token
                 |
                 ↓
             Response
```

---

## Protected API

```text
           API REQUEST
                 |
                 ↓
       Authorization Header
                 |
                 ↓
          Extract JWT
                 |
                 ↓
          Verify JWT
                 |
                 ↓
          Find User
                 |
                 ↓
        req.user = user
                 |
                 ↓
              next()
                 |
                 ↓
          Route Handler
                 |
                 ↓
             Response
```

---

# 🗄️ Database Structure

The `User` model contains:

```text
User
│
├── _id
├── name
├── email
├── password
├── phone
├── role
├── createdAt
└── updatedAt
```

The Mongoose schema defines:

```typescript
name: String
email: String
password: String
phone: String
role: String
```

The role is restricted to:

```text
"user"
"admin"
"owner"
```

and defaults to:

```text
"user"
```

The schema also enables automatic `createdAt` and `updatedAt` timestamps.

---

# 🔒 Password Security

Passwords are never intentionally stored as plain text.

During registration:

```text
Plain Password
      ↓
bcrypt.genSalt()
      ↓
bcrypt.hash()
      ↓
Hashed Password
      ↓
MongoDB
```

During login:

```text
Entered Password
      ↓
bcrypt.compare()
      ↓
Stored Hash
      ↓
true / false
```

Example:

```text
Password entered:

123456
```

MongoDB stores something similar to:

```text
$2b$10$...
```

rather than:

```text
123456
```

---

# 🚦 HTTP Status Codes

The project uses several HTTP status codes.

| Status | Meaning               | Example                        |
| ------ | --------------------- | ------------------------------ |
| 200    | OK                    | Successful login               |
| 201    | Created               | User successfully registered   |
| 400    | Bad Request           | Missing required fields        |
| 401    | Unauthorized          | Invalid/missing authentication |
| 403    | Forbidden             | User lacks required role       |
| 500    | Internal Server Error | Unexpected server error        |

---

# 🧩 Important Express Concepts

## `req`

Represents the HTTP request.

Examples:

```typescript
req.body
req.headers
req.params
req.query
```

---

## `res`

Represents the HTTP response.

Examples:

```typescript
res.json()
res.send()
res.status()
```

---

## `next()`

Moves execution to the next middleware or route handler.

Example:

```text
protect
   ↓
next()
   ↓
getMe
```

---

# 🧱 Middleware

Middleware sits between the request and the route handler.

```text
Request
   ↓
Middleware
   ↓
Route Handler
   ↓
Response
```

This project uses middleware for:

* JWT authentication
* Admin authorization
* Owner authorization

---

# 🧠 TypeScript `AuthRequest`

Express's standard request type does not automatically know about:

```typescript
req.user
```

Therefore the project defines:

```typescript
export interface AuthRequest extends Request {
    user?: IUser;
}
```

This tells TypeScript that the request may contain an authenticated user.

---

# 🍃 MongoDB Connection

The project gets the MongoDB connection string from:

```typescript
process.env.MONGO_URI
```

and connects using:

```typescript
await mongoose.connect(mongoURI);
```

If the MongoDB connection fails, the application logs the error and exits.

---

# 🌐 CORS

The project uses:

```typescript
app.use(cors());
```

CORS stands for:

> Cross-Origin Resource Sharing

It allows the frontend and backend to communicate when they are running on different origins.

Example:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# 📦 JSON Request Handling

The project uses:

```typescript
app.use(express.json());
```

This allows Express to parse JSON request bodies.

For example:

```json
{
    "email": "venkat@gmail.com",
    "password": "123456"
}
```

can be accessed using:

```typescript
req.body
```

---

# 🚨 Error Handling

The project contains a global Express error handler:

```typescript
app.use(
    (
        err,
        req,
        res,
        next
    ) => {
        ...
    }
);
```

Unexpected server errors can be handled centrally.

The response includes the error stack only when the application is not running in production.

---

# ⚠️ Important Project Notes

## 1. `userRouter` needs to be mounted

Your project contains `UserRoutes.ts` with:

```text
/api/users/profile
/api/users/admin
```

However, the `server.ts` shown in the current code imports and mounts only `authRouter`:

```typescript
app.use(
    "/api/auth",
    authRouter
);
```

To make the user routes accessible, add:

```typescript
import userRouter from "./routes/UserRoutes.js";

app.use(
    "/api/users",
    userRouter
);
```

Then these endpoints will be available:

```text
GET /api/users/profile
GET /api/users/admin
```

---

# 🧪 Testing with Postman

## Register

Select:

```text
POST
```

URL:

```text
http://localhost:5000/api/auth/register
```

Choose:

```text
Body → raw → JSON
```

Send:

```json
{
    "name": "Venkat",
    "email": "venkat@gmail.com",
    "password": "123456",
    "phone": "9876543210"
}
```

---

## Login

URL:

```text
http://localhost:5000/api/auth/login
```

Body:

```json
{
    "email": "venkat@gmail.com",
    "password": "123456"
}
```

Copy the returned:

```text
token
```

---

## Get Current User

URL:

```text
http://localhost:5000/api/auth/me
```

Header:

```text
Authorization: Bearer YOUR_TOKEN
```

---

## Profile

URL:

```text
http://localhost:5000/api/users/profile
```

Header:

```text
Authorization: Bearer YOUR_TOKEN
```

---

## Admin

URL:

```text
http://localhost:5000/api/users/admin
```

Header:

```text
Authorization: Bearer YOUR_TOKEN
```

The logged-in user's role must be:

```text
admin
```

---

# 💼 Real-World Use Cases

This authentication architecture can be used in applications such as:

### 🛒 E-commerce

```text
Customer
Admin
Store Owner
```

### 🏢 Employee Management System

```text
Employee
HR/Admin
Company Owner
```

### 🏥 Hospital Management System

```text
Patient
Staff
Administrator
```

### 🎓 Learning Management System

```text
Student
Teacher
Administrator
```

### 🏠 Real Estate Application

```text
User
Agent/Owner
Administrator
```

The same authentication concepts can be adapted to different applications.

---

# 🔐 Authentication vs Authorization

## Authentication

Authentication answers:

> **Who are you?**

Example:

```text
Email + Password
       ↓
Login
       ↓
JWT
```

---

## Authorization

Authorization answers:

> **What are you allowed to access?**

Example:

```text
Authenticated User
       ↓
Role = admin?
       ↓
YES → Admin API
NO  → 403
```

---

# 🎯 Interview Explanation

If an interviewer asks:

> **Explain your authentication project.**

You can answer:

> I developed a REST API using Node.js, Express.js, TypeScript, MongoDB, Mongoose, bcrypt, and JWT. The application provides user registration, login, JWT-based authentication, protected routes, and role-based authorization.
>
> During registration, I validate the input, check whether the email already exists, hash the password using bcrypt, and store the user in MongoDB using Mongoose. The backend assigns the default `user` role and generates a JWT after successful registration.
>
> During login, I find the user by email and use `bcrypt.compare()` to verify the password. If the credentials are valid, I generate a JWT and return it to the client.
>
> For protected routes, the client sends the JWT in the Authorization header using the Bearer scheme. The `protect` middleware verifies the token, retrieves the user from MongoDB, removes the password from the result, attaches the user to `req.user`, and calls `next()`.
>
> I also implemented role-based authorization using `adminOnly` and `ownerOnly` middleware. This allows the application to restrict certain APIs based on the authenticated user's role.
>
> The overall request flow is Client → Express Router → Middleware → Controller → Mongoose → MongoDB → Response.

---

# ❓ Common Interview Questions

### What is JWT?

> JWT stands for JSON Web Token. It is a signed token commonly used to authenticate users between a client and server.

### Why bcrypt?

> bcrypt is used to securely hash passwords and compare entered passwords with stored hashes.

### What is middleware?

> Middleware is a function that executes during the Express request-response lifecycle.

### What is `next()`?

> `next()` passes control to the next middleware or route handler.

### What is authentication?

> Authentication verifies the identity of a user.

### What is authorization?

> Authorization determines whether an authenticated user has permission to access a resource.

### What is RBAC?

> RBAC stands for Role-Based Access Control. Permissions are determined according to the user's role.

### What is the difference between 401 and 403?

> 401 means the user is not properly authenticated. 403 means the user is authenticated but does not have sufficient permission.

### Why use `.select("-password")`?

> To prevent the password field from being included when retrieving the authenticated user.

### Why use environment variables?

> To keep configuration and sensitive values such as database credentials and JWT secrets outside the source code.

---

# 📚 Learning Concepts Demonstrated

By completing this project, you are practicing:

```text
JavaScript
   ↓
TypeScript
   ↓
Node.js
   ↓
Express.js
   ↓
REST APIs
   ↓
MongoDB
   ↓
Mongoose
   ↓
Authentication
   ↓
JWT
   ↓
bcrypt
   ↓
Middleware
   ↓
Authorization
   ↓
RBAC
```

---

# 🚀 Future Improvements

Possible improvements for a production-ready authentication system:

* [ ] Add request validation using Zod/Joi/express-validator
* [ ] Add stronger password validation
* [ ] Add refresh tokens
* [ ] Add logout/token revocation strategy
* [ ] Add password reset
* [ ] Add email verification
* [ ] Add rate limiting
* [ ] Configure restricted CORS origins
* [ ] Add centralized custom error classes
* [ ] Add duplicate-key error handling
* [ ] Add automated tests
* [ ] Add API documentation with Swagger/OpenAPI
* [ ] Add logging
* [ ] Add deployment configuration
* [ ] Add frontend integration
* [ ] Add more granular permissions

---

# 👨‍💻 Author

**Nimmana Venkatalakshmi**

B.Tech – Electronics and Communication Engineering

Interested in:

* Frontend Development
* React.js
* JavaScript
* TypeScript
* Node.js
* Express.js
* MongoDB
* Full-Stack Development

---

# ⭐ Conclusion

This project demonstrates a complete beginner-to-intermediate authentication backend using modern JavaScript/TypeScript technologies.

The core authentication architecture is:

```text
REGISTER
   ↓
Validate
   ↓
Hash Password
   ↓
MongoDB
   ↓
JWT


LOGIN
   ↓
Find User
   ↓
bcrypt.compare()
   ↓
JWT


PROTECTED ROUTE
   ↓
Bearer Token
   ↓
Verify JWT
   ↓
Find User
   ↓
req.user
   ↓
next()


AUTHORIZATION
   ↓
Check Role
   ↓
Allow / Deny
```

The project is a good foundation for building larger applications such as e-commerce systems, employee management systems, real-estate platforms, learning management systems, and other role-based applications.
----------------------------------------------------------------------------------------------------------------