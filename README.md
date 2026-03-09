# Coding Assessment Platform

A comprehensive, full-stack recruitment platform designed for candidate screening, application management, and timed technical assessments.

## 🚀 Key Functionalities

### Candidate Portal
- **Secure Authentication**: Candidate registration and login with JWT-based protection.
- **Dynamic Application Form**: Comprehensive application submission including personal details, academic background, and commitments.
- **Resume Management**: Secure PDF upload for candidate resumes.
- **Timed MCQ Assessment**: 
  - Automated assessment triggered upon shortlisting.
  - Interactive timer with auto-submission on expiry.
  - **Offline Resilience**: Answers are saved to local storage even during network interruptions and synced automatically once connection is restored.

### Admin Dashboard
- **Review Pipeline**: Centralized list of all applications for status management (Pending, Shortlisted, Rejected).
- **Candidate Details View**: Premium modal interface to view full application data and academic details at a glance.
- **MCQ Management**: Full CRUD operations (Add, Edit, Delete) for assessment questions.
- **Advanced Results Export**: 
  - Downloadable CSV report with candidate information.
  - Includes detailed analytics: Start time, Submission time, Score, and Duration taken.

### Technical & UI Features
- **Responsive Design**: Mobile-first architecture that scales gracefully from smartphones to desktop monitors.
- **Glassmorphic UI**: Modern dark-themed design with subtle blurs, gradients, and micro-animations.
- **Sync Architecture**: Robust synchronization logic for reliable data entry during low-network conditions.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, React Router, Axios, React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Styling**: Vanilla CSS (Tailwind-ready).

## ⚙️ Project Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas URI)

### 2. Environment Setup
Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | The port number the backend server will run on. | `5000` |
| `MONGO_URI` | The connection string for your MongoDB database. | `mongodb://localhost:27017/assessment_platform` |
| `JWT_SECRET` | A secret key used to sign and verify JSON Web Tokens for authentication. | `your_secret_string` |
| `ASSESSMENT_DURATION_MINUTES` | The time limit for the candidate assessment in minutes. | `30` |

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/assessment_platform
JWT_SECRET=your_jwt_secret
ASSESSMENT_DURATION_MINUTES=30
```

### 3. Installation
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📝 Test Credentials

Candidate login  >>>>
username: candidate1@gmail.com
password: 10#candidate

admin login  >>>>
username: admin1@gmail.com
password: 10#admin

(Already added 10 MCQ questions also)


