// index.js

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

import customerRoutes from './routes/customerRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import employeesRoutes from './routes/employeesRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bakery_shop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check database connection
const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database:', connection.config.database);
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

// Routes
app.use('/api', customerRoutes);
app.use('/api', itemRoutes);
app.use('/api', categoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', employeesRoutes);

// Endpoint to handle user login
app.post('/login', async (req, res) => {
    const { role, username, password } = req.body;

    try {
        // Retrieve user from database based on username
        const [results] = await pool.execute('SELECT * FROM employees WHERE username = ?', [username]);

        if (results.length === 0) {
            console.log('User not found');
            return res.status(401).json('Invalid Credentials');
        }

        const user = results[0];

        // Compare plain text password with hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json('Invalid Credentials');
        }

        // Check if user role matches the provided role
        if (user.role !== role) {
            console.log('Role mismatch');
            return res.status(403).json('Not Authorized');
        }

        // Return user information if login is successful
        const responseObject = {
            username: user.username,
            role: user.role,
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            address: user.address,
            employeeId: user.employee_id
        };
        console.log('Login successful:', responseObject);
        res.status(200).json(responseObject);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json('Server error');
    }
});

// Endpoint to handle user registration
app.post('/register', async (req, res) => {
    const { role, username, email, password, name, phone_number, address } = req.body;

    try {
        // Check if username or email already exists
        const [existingUsers] = await pool.execute('SELECT * FROM employees WHERE username = ? OR email = ?', [
            username,
            email
        ]);

        if (existingUsers.length > 0) {
            return res.status(400).json('Username or email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertQuery =
            'INSERT INTO employees (role, username, email, password, name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [results] = await pool.execute(insertQuery, [
            role,
            username,
            email,
            hashedPassword,
            name,
            phone_number,
            address
        ]);

        res.status(201).json('User registered successfully');
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json('Server error');
    }
});

// Start the server
const PORT = 8800;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await checkConnection(); // Check database connection on server start
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1); // Exit the process if database connection fails
    }
});

export { pool, checkConnection }; // Export the pool and checkConnection function
