// controllers/customerController.js

import { pool } from '../index.js';

export const createCustomer = async (req, res) => {
    const { name, email, phone_number } = req.body;
    const query = 'INSERT INTO customer (name, email, phone_number) VALUES (?, ?, ?)';
    try {
        const result = await pool.query(query, [name, email, phone_number]);
        res.status(201).json({ C_ID: result.insertId, name, email, phone_number });
    } catch (err) {
        console.error('Error inserting customer:', err);
        res.status(500).json('Database error');
    }
};

export const getAllCustomers = async (req, res) => {
    const query = 'SELECT * FROM customer';
    try {
        const [results] = await pool.query(query); // Destructure to get the first element which is an array of customers
        res.status(200).json(results); // Return the array of customers directly
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json('Database error');
    }
};

export const getCustomerById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM customer WHERE C_ID = ?';
    try {
        const [[result]] = await pool.query(query, [id]); // Destructure the first item of the first array
        if (!result) {
            return res.status(404).json('Customer not found');
        }
        res.status(200).json(result); // Return the single customer object directly
    } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json('Database error');
    }
};

export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number } = req.body;
    const query = 'UPDATE customer SET name = ?, email = ?, phone_number = ? WHERE C_ID = ?';
    try {
        const result = await pool.query(query, [name, email, phone_number, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json('Customer not found');
        }
        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json('Database error');
    }
};

export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM customer WHERE C_ID = ?';
    try {
        const result = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json('Customer not found');
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json('Database error');
    }
};
