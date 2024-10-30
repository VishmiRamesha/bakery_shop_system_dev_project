// controllers/itemController.js
import { pool } from "../index.js";

// Create a new item
export const createItem = (req, res) => {
	const { name, description, category_id, Quantity, Unit, Unit_price } = req.body;
	const query =
		"INSERT INTO item (name, description, category_id, Quantity, Unit, Unit_price) VALUES (?, ?, ?, ?, ?, ?)";
	pool
		.query(query, [name, description, category_id, Quantity, Unit, Unit_price])
		.then(([result]) => {
			res.status(201).json({
				Item_id: result.insertId,
				name,
				description,
				category_id,
				Quantity,
				Unit,
				Unit_price,
			});
		})
		.catch((err) => {
			console.error("Error inserting item:", err);
			res.status(500).json({ error: "Database error" });
		});
};

// Get all items
export const getAllItems = (req, res) => {
	const query = "SELECT * FROM item";
	pool
		.query(query)
		.then(([rows]) => {
			res.status(200).json(rows);
		})
		.catch((err) => {
			console.error("Error fetching items:", err);
			res.status(500).json({ error: "Database error" });
		});
};

// Get items by category
export const getItemsByCategory = (req, res) => {
	const { category_id } = req.params;
	const query = "SELECT * FROM item WHERE category_id = ?";
	pool
		.query(query, [category_id])
		.then(([rows]) => {
			res.status(200).json(rows);
		})
		.catch((err) => {
			console.error("Error fetching items by category:", err);
			res.status(500).json({ error: "Database error" });
		});
};

// Get item by ID
export const getItemById = (req, res) => {
	const { id } = req.params;
	const query = "SELECT * FROM item WHERE Item_id = ?";
	pool
		.query(query, [id])
		.then(([rows]) => {
			if (rows.length === 0) {
				return res.status(404).json({ error: "Item not found" });
			}
			res.status(200).json(rows[0]);
		})
		.catch((err) => {
			console.error("Error fetching item:", err);
			res.status(500).json({ error: "Database error" });
		});
};

// Function to update sold quantity for multiple items in an order
export const updateItem = async (items) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const { item_id, quantity } of items) {
            // Parse item_id and quantity as integers
            const parsedItemId = parseInt(item_id, 10);
            const parsedSoldQuantity = parseInt(quantity, 10);

            // Validate parsed values
            if (isNaN(parsedItemId) || isNaN(parsedSoldQuantity)) {
                throw new Error(`Invalid itemId or soldQuantity for item ${item_id}.`);
            }

            // Update query to reduce sold quantity
            const reduceSoldQuantityQuery = `
                UPDATE item
                SET Quantity = Quantity - ?
                WHERE Item_id = ? AND Quantity >= ?
            `;
            
            const [results] = await connection.query(reduceSoldQuantityQuery, [parsedSoldQuantity, parsedItemId, parsedSoldQuantity]);

            // Check if item exists and has sufficient quantity to reduce sold quantity
            if (results.affectedRows === 0) {
                throw new Error(`Insufficient quantity or item not found for item ${item_id}.`);
            }

            console.log(`Successfully reduced sold quantity of item ${parsedItemId} by ${parsedSoldQuantity}`);
        }

        // Commit transaction if successful for all items
        await connection.commit();
    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        console.error(`Error reducing sold quantity for items:`, error);
        throw error; // Propagate error for handling in route or elsewhere
    } finally {
        // Release connection back to the pool
        connection.release();
    }
};









// Delete an item
export const deleteItem = (req, res) => {
	const { id } = req.params;
	const query = "DELETE FROM item WHERE Item_id = ?";
	pool
		.query(query, [id])
		.then(([result]) => {
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: "Item not found" });
			}
			res.status(200).json({ message: "Item deleted successfully" });
		})
		.catch((err) => {
			console.error("Error deleting item:", err);
			res.status(500).json({ error: "Database error" });
		});
};
