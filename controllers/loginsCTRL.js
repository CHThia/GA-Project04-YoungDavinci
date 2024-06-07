const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { insertStudentDetails, insertTeacherDetails, insertLogin, findUserByEmail } = require('../models/login');

const studentSignUp = async (req, res) => {
  try {
    const formData = req.body;

    // Check if password length is at least 3
    if (formData.password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters long' });
    }

    formData.password = await bcrypt.hash(formData.password, 10); // Hash the password
    const studentId = await insertStudentDetails(formData);

    // Ensure the studentId is being used correctly
    if (!studentId) {
      return res.status(500).json({ error: 'Failed to create student details' });
    }

    await insertLogin(formData.email, formData.password, false); // Explicitly setting isTeacher to false

    res.status(201).json({ message: 'Student created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const teacherSignUp = async (req, res) => {
  try {
    const formData = req.body;

    // Check if password length is at least 3
    if (formData.password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters long' });
    }

    formData.password = await bcrypt.hash(formData.password, 10); // Hash the password
    const teacherId = await insertTeacherDetails(formData);

    // Ensure the teacherId is being used correctly
    if (!teacherId) {
      return res.status(500).json({ error: 'Failed to create teacher details' });
    }

    await insertLogin(formData.email, formData.password, true); // Explicitly setting isTeacher to true

    res.status(201).json({ message: 'Teacher created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt with email:', email);
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user);

    const validPassword = await bcrypt.compare(password, user.pwd);

    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

    console.log('JWT token generated:', token);

    if (user.isteacher) {
      console.log('Redirecting teacher to /AllStudents');
      return res.json({ token, redirect: '/AllStudents' });
    } else {
      console.log('Redirecting student to /StudentDashboard');
      return res.json({ token, redirect: '/StudentDashboard' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {
  studentSignUp,
  teacherSignUp,
  login,
};



module.exports = {
  studentSignUp,
  teacherSignUp,
  login,
};