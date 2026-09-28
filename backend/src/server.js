import express from "express";
import cors from "cors";
import pool from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Student Registration API is running",
  });
});

// GET all students
app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM students ORDER BY id DESC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      "Database error while fetching students:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

// POST a new student
app.post("/api/students", async (req, res) => {
  try {
    const {
      name,
      roll,
      department,
      year,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !roll ||
      !department ||
      !year
    ) {
      return res.status(400).json({
        message:
          "Name, roll, department, and year are required",
      });
    }

    // Validate department
    const allowedDepartments = [
      "CSE",
      "EEE",
      "ECE",
    ];

    if (!allowedDepartments.includes(department)) {
      return res.status(400).json({
        message:
          "Department must be CSE, EEE, or ECE",
      });
    }

    // Validate year
    const studentYear = Number(year);

    if (
      !Number.isInteger(studentYear) ||
      studentYear < 1900 ||
      studentYear > 2100
    ) {
      return res.status(400).json({
        message:
          "Year must be between 1900 and 2100",
      });
    }

    const result = await pool.query(
      `INSERT INTO students
       (name, roll, department, year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name.trim(),
        roll.trim(),
        department,
        studentYear,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(
      "Database error while registering student:",
      error
    );

    res.status(500).json({
      message: "Failed to register student",
      error: error.message,
    });
  }
});

// DELETE a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const studentId = Number(id);

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Database error while deleting student:",
      error
    );

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}`
  );
});