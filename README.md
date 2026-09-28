# Student Registration System

A small, compact, and professional full-stack student registration system built with:

- React + Vite
- Node.js + Express
- PostgreSQL
- `pg` (Node.js PostgreSQL client)
- Modern responsive CSS

## Project Structure

```text
student-registration-system/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # PostgreSQL connection
│   │   └── server.js         # Express API server
│   ├── .env                  # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── database/
│   └── schema.sql            # PostgreSQL database schema
│
└── README.md