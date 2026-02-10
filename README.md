<div align="center">

# 🎯 GetInterviewReady.ai

### Your Personal AI-Powered Interview Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🌟 Overview

A comprehensive full-stack **MERN** application designed to help candidates prepare for technical interviews using AI-powered question generation, real-time analysis, and personalized feedback. Built with modern web technologies and enterprise-grade security practices.

### Key Highlights

🤖 **AI-Powered** - Leverages Google Gemini AI for intelligent question generation  
🔐 **Secure** - JWT authentication with bcrypt password hashing  
📊 **Analytics** - Track progress with detailed performance metrics  
💼 **Professional** - Clean, modern UI with glassmorphism design  
📱 **Responsive** - Works seamlessly on all devices  

---

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - Secure registration and login system
- ✅ **AI Interview Sessions** - Practice with AI-generated questions
- ✅ **Real-time Feedback** - Instant analysis of your responses
- ✅ **Progress Tracking** - Detailed dashboard with performance metrics
- ✅ **Resume Analysis** - AI-powered resume parsing and ATS scoring
- ✅ **Smart Recommendations** - Personalized learning paths based on performance
- ✅ **Interview History** - Review and learn from past sessions
- ✅ **Voice Recognition** - Answer questions using speech-to-text

### Technical Features

- 🔒 **JWT Authentication** - Stateless authentication with secure tokens
- 🗄️ **MongoDB Database** - Scalable NoSQL database
- 🎨 **Modern UI** - Tailwind CSS with glassmorphism effects
- 🚀 **Fast Development** - Vite for lightning-fast build times
- 📡 **RESTful API** - Clean, well-documented API endpoints
- 🔄 **State Management** - React hooks for efficient state handling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| **React 18** | Modern UI library with hooks |
| **Vite** | Next-generation frontend tooling |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router v6** | Declarative routing |
| **Axios** | Promise-based HTTP client |
| **Recharts** | Composable charting library |

### Backend
| Technology | Description |
|------------|-------------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Fast, minimalist web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | Elegant MongoDB object modeling |
| **JWT** | Secure authentication tokens |
| **Bcrypt** | Password hashing |
| **Google Gemini AI** | AI-powered question generation |

---

## 📁 Project Structure

```
mern_pro/
│
├── 📂 backend/                   # Backend API
│   ├── 📂 config/
│   │   └── db.js                # MongoDB connection setup
│   ├── 📂 controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── interviewController.js
│   │   ├── dashboardController.js
│   │   ├── recommendationController.js
│   │   └── resumeController.js
│   ├── 📂 middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── 📂 models/
│   │   ├── User.js              # User schema
│   │   ├── Interview.js         # Interview session schema
│   │   └── Recommendation.js    # Cache schema
│   ├── 📂 routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── interviewRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── resumeRoutes.js
│   ├── 📂 services/
│   │   └── geminiService.js     # AI integration
│   ├── 📂 utils/
│   │   └── validation.js        # Input validation helpers
│   ├── 📄 .env.example          # Environment template
│   ├── 📄 .gitignore
│   ├── 📄 package.json
│   └── 📄 server.js             # Express server entry point
│
└── 📂 frontend/                  # React frontend
    ├── 📂 src/
    │   ├── 📂 components/
    │   │   ├── Button.jsx       # Reusable button component
    │   │   ├── Input.jsx        # Form input component
    │   │   └── ProtectedRoute.jsx
    │   ├── 📂 pages/
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   ├── Login.jsx        # Authentication pages
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx      # User profile & resume
    │   │   ├── InterviewStart.jsx
    │   │   ├── InterviewSession.jsx

Before you begin, ensure you have the following installed:

- ![Node.js](https://img.shields.io/badge/Node.js-v16+-green) Node.js (v16 or higher)
- ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green) MongoDB (local or Atlas)
- ![npm](https://img.shields.io/badge/npm-or_yarn-red) npm or yarn package manager

### Quick Start

Follow these steps to get the application running:

<details>
<summary><b>📦 Step 1: Clone & Install</b></summary>

```bash
# Clone the repository
git clone <your-repo-url>
cd mern_pro

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```
</details>

<details>
<summary><b>⚙️ Step 2: Configure Environment Variables</b></summary>

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
MONGODB_URI=mongodb://localhost:27017/ai-interview-platform
JWT_SECRET=<generate-a-secure-secret>
JWT_EXPIRE=30d
GEMINI_API_KEY=<your-gemini-api-key>
PORT=5000
NODE_ENV=development
```

> 💡 **Generate JWT Secret**: 
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> 🔑 **Get Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Frontend Configuration (Optional)

```bash
cd frontend
cp .env.example .env
```

Default configuration works for local development.

</details>

<details>
<summary><b>🚀 Step 3: Start the Application</b></summary>

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

✅ Server running at `http://localhost:5000`

#### Terminal 2 - Frontend App

```bash
cd frontend
npm run dev
```

✅ App running at `http://localhost:5173` (or displayed port)

#### Terminal 3 - MongoDB (if local)

```bash
mongod
```

</details>

<det� API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |

### Interview Endpoints

| Mequest:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
</details>

<details>
<summary><b>POST /api/auth/login</b></summary>

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
</details>

<details>
<summary><b>GET /api/auth/profile</b></summary>

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```
</details>

---OST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |

### Request/Response Examples

**Register:**
```json
// Request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Login:**
```json
// 🔐 Security

This application implements enterprise-grade security practices:

| Feature | Implementation |
|---------|----------------|
| **Password Security** | Bcrypt hashing with 10 salt rounds |
| **Authentication** | Stateless JWT tokens |
| **Token Expiration** | Configurable (default: 30 days) |
| **Route Protection** | Middleware-based auth verification |
| **Input Validation** | Express-validator for all inputs |
| **CORS** | Configured for secure cross-origin requests |
| **Environment Variables** | Sensitive data stored in `.env` files |
| **SQL Injection** | Protected via Mongoose ODM |

### Security Best Practices

✅ Never commit `.env` files  
✅ Use strong JWT secrets (32+ characters)  
✅ Enable HTTPS in production  
✅ Implement rate limiting for APIs  
✅ Regular dependency updates (`npm audit`)  
✅ Use MongoDB Atlas for production  
✅ Implement request validation  

---

## 📱 Usage Flow

```mermaid
graph LR
    A[User Visits Site] --> B{Authenticated?}
    B -->|No| C[Login/Register]
    B -->|Yes| D[Dashboard]
    C --> E[Enter Credentials]
    E --> F[Token Generated]
    F --> D
    D --> G[Start Interview]
    G --> H[AI Questions]
    H --> I[Submit Answers]
    I --> J[Get Results]
    J --> K[View Analytics]
```

### User Journey

1. **Registration** → Create account → Token issued → Redirect to Dashboard
2. **Login** → Authenticate → Token stored → Access protected routes
3. **Interview** → Select role & difficulty → AI generates questions → Submit answers
4. **Results** → View scores → Get feedback → Track progress
5. **Recommendations** → AI analyzes performance → Suggests improvement areas

---
- ✅ Reusable components
- ✅ Auto-redirect on login/logout
- ✅ Token stored in localStorage

## 🔒 Security Features

- Passwords hashed using bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Protected routes on both frontend and backend
- Token expiration (7 days default)
- Email validation
- Password strength requirements (min 6 characters)
- CORS configuration

## 📱 Usage Flow

1. **Register:** User creates account → Token generated → Redirected to Dashboard
2. **Login:** User logs in → Token stored → Redirected to Dashboard
3. **Protected Access:** Dashboard checks token → If valid, shows content
4. **Logout:** Clear token from localStorage → Redirect to Login
5. **Auto-redirect:** Logged-in users can't access Login/Register pages

## 🧪 Testing the Application

1. **Start both servers** (backend and frontend)
2. **Navigate to** `http://localhost:3000`
3. **Register a new account**
4. **You'll be automatically redirected to Dashboard**
5. **Test logout functionality**
6. **Try logging in again**

## 🎯 Next Steps (Future Enhancements)

- [ ] Refresh token mechanism
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social authentication (Google, GitHub)
- [ ] User profile editing
- [ ] Interview practice modules
- [ ] AI-powered interview questions
- [ ] Performance analytics
- [ ] Admin dashboard

## 📝 Environment Variables

### Backend (.env)

See `.env.example` for all required variables:

```env
MONGODB_URI=mongodb://localhost:27017/ai-interview-platform
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
```

⚠️ **Important:** Never commit the `.env` file to version control!

### Frontend (.env)
<details>
<summary><b>MongoDB Connection Error</b></summary>

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` file
- For MongoDB Atlas, verify network access and credentials
- Check firewall settings

</details>

<details>
<summary><b>Token/Authentication Errors</b></summary>

**Problem:** `Unauthorized` or `Token expired`

**Solutions:**
- Clear browser localStorage
- Check `JWT_SECRET` matches between requests
- Verify token isn't expired (check `JWT_EXPIRE` in `.env`)
- Ensure `Authorization` header is sent: `Bearer <token>`

</details>

<details>
<summary><b>CORS Errors</b></summary>

**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**
- Verify CORS is enabled in `server.js`
- Check `VITE_API_URL` in frontend `.env`
- For production, add your domain to CORS whitelist

</details>

<details>
<summary><b>Port Already in Use</b></summary>

**Problem:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find and kill process on port 5000
npx kill-port 5000

# Or change port in backend/.env
PORT=5001
```
Then update `VITE_API_URL` in frontend `.env`

</details>

<details>
<summary><b>Dependencies Installation Failed</b></summary>

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or try yarn
yarn install
```

</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent question generation
- MongoDB for robust database solutions
- The React and Node.js communities

---

<div align="center">

### Built with ❤️ by Developers, for Developers

**[⬆ Back to Top](#-getinterviewreadyai)**

</div>
**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

**Token Errors:**
- Clear localStorage in browser
- Check JWT_SECRET matches on backend

**CORS Errors:**
- Verify CORS is enabled in server.js
- Check API URL in frontend .env

**Port Already in Use:**
- Change PORT in backend .env
- Update VITE_API_URL in frontend .env

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for GetInterviewReady.ai

---

**Happy Coding! 🚀**
