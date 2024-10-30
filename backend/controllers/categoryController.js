// controllers/categoryController.js

import { pool } from '../index.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    const query = 'SELECT * FROM category';
    try {
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json('Database error');
    }
};
