# Course Allocation Simulator

A full-stack course allocation system that generates student-course assignments based on ranked preferences and course capacities using constraint optimization.

## Features

- Student and admin authentication with role-based access
- Student preference submission and allocation tracking
- Admin management of students, courses, and preferences
- Course allocation using Google OR-Tools CP-SAT
- Course capacity and preference constraints
- Allocation reset and re-run
- What-if simulation for hypothetical course capacity changes

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma
- **Optimization:** Python, Google OR-Tools
- **Authentication:** JWT, bcrypt
- **Deployment:** Vercel, Render

## Architecture

React + TypeScript
        |
        | REST API
        v
Node.js + Express
        |
   +----+----+
   |         |
   v         v
PostgreSQL  Python
            OR-Tools

## Project Structure

course-allocation-simulator/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
├── solver/
│   ├── solver.py
│   └── requirements.txt
└── README.md

## Running Locally

### Prerequisites

- Node.js
- PostgreSQL
- Python 3
- pip

### Backend

cd backend
npm install
npx prisma generate
npm run dev

### Frontend

cd frontend
npm install
npm run dev

### Solver

From the project root:

pip install -r solver/requirements.txt

### Environment Variables

Create a `backend/.env` file:

DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret"
PORT=5000

Do not commit `.env` files or database credentials.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL
- **Optimization Engine:** Python + OR-Tools deployed with the backend

The frontend communicates with the deployed Express API, which handles authentication, database operations, allocation requests, and communication with the Python optimization engine.