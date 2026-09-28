import Student from "../models/Student.js";

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to load students" });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, roll, department, year } = req.body;

    if (!name || !roll || !department || year === undefined || year === "") {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.create({
      name,
      roll,
      department,
      year
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Please enter valid student information" });
    }

    res.status(500).json({ message: "Failed to register student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student" });
  }
};
