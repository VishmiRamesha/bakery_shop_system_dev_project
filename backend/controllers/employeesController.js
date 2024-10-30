import { pool } from '../index.js';
import bcrypt from 'bcrypt';

// Helper function to promisify pool.query
const queryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params)
            .then(([result]) => resolve(result))
            .catch((err) => reject(err));
    });
};

// Create a new employee
export const createEmployee = async (req, res) => {
    const { username, password, name, email, phone_number, address, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO employees (username, password, name, email, phone_number, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await queryAsync(query, [username, hashedPassword, name, email, phone_number, address, role]);
        res.status(201).json({ employee_id: result.insertId, username, name, email, phone_number, address, role });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json('Server error');
    }
};

// Update an employee
export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { username, password, name, email, phone_number, address, role } = req.body;

    try {
        let query;
        let queryParams;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE employees SET username = ?, password = ?, name = ?, email = ?, phone_number = ?, address = ?, role = ? WHERE employee_id = ?';
            queryParams = [username, hashedPassword, name, email, phone_number, address, role, id];
        } else {
            query = 'UPDATE employees SET username = ?, name = ?, email = ?, phone_number = ?, address = ?, role = ? WHERE employee_id = ?';
            queryParams = [username, name, email, phone_number, address, role, id];
        }

        const result = await queryAsync(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json('Employee not found');
        }

        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json('Server error');
    }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
    const query = 'SELECT * FROM employees';

    try {
        const results = await queryAsync(query, []);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json('Database error');
    }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM employees WHERE employee_id = ?';

    try {
        const results = await queryAsync(query, [id]);
        if (results.length === 0) {
            return res.status(404).json('Employee not found');
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json('Database error');
    }
};

// Delete an employee
export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM employees WHERE employee_id = ?';

    try {
        const result = await queryAsync(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json('Employee not found');
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json('Database error');
    }
};
