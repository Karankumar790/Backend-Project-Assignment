# Project-assignment-backend

🔐 Admin Credentials:-
Username: Lazy780@gmail.com
Password: Lazy@123


Backend API 
This is the backend server for a product management, built using Node.js, Express, MongoDB, and JWT for authentication. It supports features like user registration/login, course management, user posts, media uploads, purchase tracking, and contact queries.

Live Frontend: https://project-assignment-frontend-nxuz.vercel.app

Technologies Used:-
Node.js

Express.js

MongoDB & Mongoose

Cloudinary (media uploads)

JWT & Cookies (auth)

Multer (file upload)

Nodemailer (email with OTP)

bcrypt.js (password hashing)

dotenv (environment variables)


API Routes Overview
User Routes (/api/v1/user)
POST /register – Register new user

POST /login – Login user

GET /logout – Logout

POST /forgotPassword – Send OTP to email

POST /resetPassword – Reset password using OTP

GET /profile – Get user profile (auth)

PUT /profile/update – Update profile with image (auth)

GET /getAllUsers – Admin: All users with pagination

DELETE /deleteUser/:id – Admin: Delete user


Queries
POST /queries – Send a query (auth)

GET /getMyQuery – User's own queries

GET /getAllQueries – Admin: View all queries

DELETE /deleteQueries/:queryId – Admin: Delete query

PUT /queryReply/:queryId – Admin: Reply to query


Course Routes (/api/v1/course)
(Courses CRUD, protected – not included in full here)

Purchase Routes (/api/v1/purchase)
(Handle course purchases)

Course Progress (/api/v1/progress)
(Track user progress)

Media Upload (/api/v1/media)
File uploads via Cloudinary

User Posts (/api/v1/userPost)
CRUD for user-generated posts