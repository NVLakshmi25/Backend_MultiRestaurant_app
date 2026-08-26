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