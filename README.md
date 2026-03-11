# Real-Time Document Collaboration Platform

A full-stack, real-time document editing and collaboration platform built with the MERN stack (MongoDB, Express, React, Node.js) and WebSockets.

## 🚀 Features

- **Real-Time Collaboration**: Edit documents simultaneously with other users using WebSockets (Socket.io) and Quill.js rich-text editor.
- **Authentication**: Secure sign-up and login utilizing JSON Web Tokens (JWT) and bcrypt password hashing.
- **Document Management**: Create, view, and delete your documents from a personalized Dashboard.
- **Document Sharing**: Share specific documents securely with other registered users via their email.
- **Inbox & Notifications**: Receive an instant in-app notification in your inbox whenever someone shares a document with you. Click the notification to jump straight into the editor!
- **Auto-Saving**: Never lose progress—documents automatically save to the database every 2 seconds while typing.

## 🛠️ Technology Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- Quill.js (Rich Text Editor)
- React Router DOM
- Socket.io-client
- Axios
- Lucide React (Icons)

**Backend**
- Node.js
- Express.js 
- MongoDB & Mongoose
- Socket.io (WebSockets)
- JSON Web Token (JWT)
- bcrypt

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SKaran872/infinitelocushackathon.git
   cd infinitelocushackathon
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory with the following variables:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```
   - Create a `.env` file in the `client` directory:
     ```env
     VITE_API_URL=http://localhost:5000
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

## 🌐 Deployment
This project is configured for deployment on Vercel. 
- The React frontend is bundled using Vite.
- Static Single Page Application (SPA) routing is handled natively via the custom `vercel.json` configuration.
