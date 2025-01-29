# Social Media App

## Description

This project is a social media application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to create accounts, post updates, follow other users, and interact with posts.

## Features

### Backend

- User authentication (JWT)
- User management (registration, login, profile updates)
- Post creation, deletion, and retrieval
- Follow/unfollow users
- Real-time notifications (Socket.io)

### Frontend

- User registration and login forms
- User profile pages
- Feed displaying posts from followed users
- Post creation and interaction (like, comment)
- Real-time updates and notifications

## Technologies Used

- **Frontend**: React, Vite, @vitejs/plugin-react, @emotion/react, @emotion/styled, @mui/material, @mui/icons-material, Redux, Redux Toolkit, React Router DOM, Formik, Yup
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Socket.io
- **Build Tools**: Vite, pnpm

## Folder Structure

```
/client
  ├── public
  ├── src
  │   ├── assets
  │   ├── components
  │   ├── pages
  │   ├── redux
  │   ├── styles
  │   ├── utils
  │   ├── App.jsx
  │   ├── index.jsx
  ├── .env
  ├── index.html
  ├── package.json
  ├── pnpm-lock.yaml
  ├── README.md
  ├── vite.config.js
/server
  ├── config
  ├── controllers
  ├── models
  ├── routes
  ├── utils
  ├── .env
  ├── index.js
  ├── package.json
  ├── README.md
```

## How to Run the Project

1. **Clone the repository**:

   ```sh
   git clone <repository-url>
   cd social-media
   ```

2. **Install dependencies**:

   ```sh
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in both the `/client` and `/server` directories with the necessary environment variables.

4. **Run the backend**:

   ```sh
   cd server
   pnpm start
   ```

5. **Run the frontend**:

   ```sh
   cd client
   pnpm dev
   ```

6. **Open the application**:
   Open your browser and navigate to `http://localhost:3000`.
