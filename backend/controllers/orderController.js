import { pool } from "../index.js"; // Assuming pool is exported from your index.js

// Create a new order
export const createOrder = async (req, res) => {
	const { status, dateTime, customerName, cashierName, totalPrice, orderItems } = req.body;

	// Check if orderItems is defined and is an array
	if (!Array.isArray(orderItems)) {
		return res.status(400).json("Invalid order items format");
	}

	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Insert into orders table
		const insertOrderQuery = `
            INSERT INTO orders (status, Order_datetime, customer_name, cashier_name, total_price)
            VALUES (?, ?, ?, ?, ?)
        `;
		const [orderResult] = await connection.query(insertOrderQuery, [
			status,
			dateTime,
			customerName,
			cashierName,
			totalPrice,
		]);
		const orderId = orderResult.insertId;

		// Insert into order_items table
		const insertOrderItemsQuery = `
            INSERT INTO order_items (Order_id, Item_id, item_name, quantity, price)
            VALUES (?, ?, ?, ?, ?)
        `;
		for (const item of orderItems) {
			try {
				const { item_id, item_name, quantity, price } = item;
				await connection.query(insertOrderItemsQuery, [
					orderId,
					item_id,
					item_name,
					quantity,
					price,
				]);
			} catch (error) {
				console.error("Error inserting order item:", error);
				await connection.rollback();
				return res.status(500).json("Error inserting order item");
			}
		}

		await connection.commit();
		res
			.status(201)
			.json({ Order_id: orderId, status, dateTime, customerName, cashierName, totalPrice });
	} catch (error) {
		await connection.rollback();
		console.error("Error creating order:", error);
		res.status(500).json("Database error");
	} finally {
		connection.release();
	}
};

// Get all orders with optional status filter
export const getAllOrders = async (req, res) => {
	const { status } = req.query; // Get the status query parameter
	let query =
		"SELECT o.Order_id, o.status, o.Order_datetime, o.customer_name, o.cashier_name, o.total_price FROM orders o";

	// If status is provided, add a WHERE clause to filter orders by status
	if (status) {
		query += " WHERE o.status = ?";
	}

	const connection = await pool.getConnection();

	try {
		const [results] = await connection.query(query, [status]);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json("Database error");
	} finally {
		connection.release();
	}
};

// Get order by ID
export const getOrderById = async (req, res) => {
	const { id } = req.params;
	const query = `
        SELECT o.Order_id, o.status, o.Order_datetime, o.customer_name, o.cashier_name, o.total_price,
               oi.Item_id, oi.item_name, oi.quantity, oi.price
        FROM orders o
        INNER JOIN order_items oi ON o.Order_id = oi.Order_id
        INNER JOIN item i ON oi.Item_id = i.Item_id
        WHERE o.Order_id = ?
    `;

	const connection = await pool.getConnection();

	try {
		const [result] = await connection.query(query, [id]);
		if (result.length === 0) {
			return res.status(404).json("Order not found");
		}
		res.status(200).json(result[0]);
	} catch (error) {
		console.error("Error fetching order:", error);
		res.status(500).json("Database error");
	} finally {
		connection.release();
	}
};

// Update an existing order (supports partial updates)
export const updateOrder = async (req, res) => {
	const { id } = req.params;
	const { status } = req.body; // Only update status

	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Update orders table for status
		const updateOrderQuery = `
            UPDATE orders
            SET status = ?
            WHERE Order_id = ?
        `;
		await connection.query(updateOrderQuery, [status, id]);

		await connection.commit();
		res.status(200).json({ message: "Order status updated successfully" });
	} catch (error) {
		await connection.rollback();
		console.error("Error updating order status:", error);
		res.status(500).json({ error: "Database error" });
	} finally {
		connection.release();
	}
};

// Delete an order
export const deleteOrder = async (req, res) => {
	const { id } = req.params;

	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Delete from orders table
		const deleteOrderQuery = "DELETE FROM orders WHERE Order_id = ?";
		const deleteOrderResult = await connection.query(deleteOrderQuery, [id]);

		// Check if order was found and deleted
		if (deleteOrderResult.affectedRows === 0) {
			await connection.rollback();
			return res.status(404).json("Order not found");
		}

		// Delete from order_items table
		const deleteOrderItemsQuery = "DELETE FROM order_items WHERE Order_id = ?";
		await connection.query(deleteOrderItemsQuery, [id]);

		await connection.commit();
		res.status(200).json({ message: "Order deleted successfully" });
	} catch (error) {
		await connection.rollback();
		console.error("Error deleting order:", error);
		res.status(500).json("Database error");
	} finally {
		connection.release();
	}
};

// Get items by Order ID
export const getItemsByOrderId = async (req, res) => {
	const { id } = req.params;
	const query = `
        SELECT oi.Order_id, oi.item_id, oi.item_name, oi.quantity, oi.price, i.Quantity AS item_quantity
        FROM order_items oi
        INNER JOIN item i ON oi.item_id = i.Item_id
        WHERE oi.Order_id = ?
    `;

	const connection = await pool.getConnection();

	try {
		const [results] = await connection.query(query, [id]);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching items by order ID:", error);
		res.status(500).json("Database error");
	} finally {
		connection.release();
	}
};
