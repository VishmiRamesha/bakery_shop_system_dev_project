import express from 'express';
import {
    createItem,
    getAllItems,
    getItemById,
    updateItem, // Import the updated function for updating sold quantities based on items
    deleteItem,
    getItemsByCategory
} from '../controllers/itemController.js';

const router = express.Router();

// Route to create a new item
router.post('/items', createItem);

// Route to get all items
router.get('/items', getAllItems);

// Route to get items by category
router.get('/items/category/:category_id', getItemsByCategory);

// Route to get item by id
router.get('/items/:id', getItemById);

// Route to update sold quantity for multiple items in an order
router.put('/items/updateSoldQuantity', async (req, res, next) => {
    const items = req.body.items;

    try {
        await updateItem(items);
        res.status(200).json({ message: `Sold quantities updated successfully for all items` });
    } catch (error) {
        next(error); // Pass error to error handler middleware
    }
});

// Route to delete item by id
router.delete('/items/:id', deleteItem);

export default router;
