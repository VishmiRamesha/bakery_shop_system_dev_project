import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Staff.css"; // Ensure this CSS file exists and is correctly linked

const Staff = () => {
    const [currentOrders, setCurrentOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:8800/api/orders");
            const orders = response.data;

            const current = orders.filter(
                (order) => order.status === "Pending" || order.status === "Preparing"
            );
            const completed = orders.filter((order) => order.status === "Completed");

            setCurrentOrders(current);
            setCompletedOrders(completed);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleOrderClick = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:8800/api/orders/items/${orderId}`);
            const orderItems = response.data;

            const selectedOrderSummary =
                currentOrders.find((order) => order.Order_id === orderId) ||
                completedOrders.find((order) => order.Order_id === orderId);

            if (selectedOrderSummary) {
                const orderDetails = {
                    Order_id: selectedOrderSummary.Order_id,
                    Order_datetime: selectedOrderSummary.Order_datetime,
                    customer_name: selectedOrderSummary.customer_name,
                    cashier_name: selectedOrderSummary.cashier_name,
                    total_price: selectedOrderSummary.total_price,
                    status: selectedOrderSummary.status,
                    items: orderItems.map((item) => ({
                        item_id: item.item_id,
                        item_name: item.item_name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                };
                setSelectedOrder([orderDetails]); // Wrap orderDetails in an array to match the map usage
            } else {
                console.error("Order summary not found for order ID:", orderId);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const confirmStatusChange = window.confirm(
            `Are you sure you want to mark the order as ${newStatus}?`
        );
        if (confirmStatusChange) {
            try {
                const currentOrder = selectedOrder[0]; // selectedOrder is an array, so access the first item

                // Prepare payload with all necessary fields
                const payload = {
                    status: newStatus,
                    dateTime: currentOrder.Order_datetime,
                    customerName: currentOrder.customer_name,
                    cashierName: currentOrder.cashier_name,
                    totalPrice: currentOrder.total_price,
                    orderItems: currentOrder.items, // Assuming items structure matches backend requirement
                };

                // Send updated order details to backend
                await axios.put(`http://localhost:8800/api/orders/${orderId}`, payload);

                // Reduce inventory if status is "Completed"
                if (newStatus === "Completed") {
                    await updateInventory(currentOrder.items);
                }

                // Update selectedOrder status locally
                setSelectedOrder((prev) =>
                    prev.map((order) =>
                        order.Order_id === orderId ? { ...order, status: newStatus } : order
                    )
                );

                fetchOrders(); // Fetch updated orders after status change
            } catch (error) {
                console.error("Error updating order status:", error);
            }
        }
    };

    const updateInventory = async (orderItems) => {
        try {
            const requests = orderItems.map((item) =>
                axios.put(`http://localhost:8800/api/items/updateSoldQuantity `, {
                    items: [
                        { item_id: item.item_id, quantity: item.quantity }
                    ]
                })
            );
            await Promise.all(requests);
        } catch (error) {
            console.error("Error updating inventory:", error);
        }
    };

    const handleOrderDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this order?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8800/api/orders/${id}`);
                setSelectedOrder(null); // Clear selected order after deletion
                fetchOrders();
            } catch (error) {
                console.error("Error deleting order:", error);
            }
        }
    };

    return (
        <div className="staff bg-image">
            <div className="orders-container">
                <div className="orders-header">
                    <h2 className="orders-title">Current Orders</h2>
                    <h2 className="orders-title">Completed Orders</h2>
                </div>
                <div className="orders-boxes">
                    <div className="orders-box">
                        {currentOrders.map((order) => (
                            <div
                                className={`order-item ${
                                    selectedOrder && selectedOrder[0] && selectedOrder[0].Order_id === order.Order_id
                                        ? "selected"
                                        : ""
                                }`}
                                key={order.Order_id}
                                onClick={() => handleOrderClick(order.Order_id)}
                            >
                                <span className="order-id">Order ID: {order.Order_id}</span>
                                <span className="order-status">Status: {order.status}</span>
                            </div>
                        ))}
                    </div>
                    <div className="orders-box">
                        {completedOrders.map((order) => (
                            <div
                                className={`order-item ${
                                    selectedOrder && selectedOrder[0] && selectedOrder[0].Order_id === order.Order_id
                                        ? "selected"
                                        : ""
                                }`}
                                key={order.Order_id}
                                onClick={() => handleOrderClick(order.Order_id)}
                            >
                                <span className="order-id">Order ID: {order.Order_id}</span>
                                <span className="order-status">Status: {order.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="order-details-container">
                <h2 className="details-title">Order Details</h2>
                {selectedOrder ? (
                    <div className="details-box">
                        <div className="detail-item">
                            <span className="detail-label">Order ID:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].Order_id : "N/A"}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date/Time:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].Order_datetime : "N/A"}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].status : "N/A"}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Customer Name:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].customer_name : "N/A"}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Cashier Name:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].cashier_name : "N/A"}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Total Price:</span>
                            <span className="detail-value">
                                {selectedOrder[0] ? selectedOrder[0].total_price : "N/A"}
                            </span>
                        </div>
                        <h3>Order Items:</h3>
                        {selectedOrder[0] &&
                            selectedOrder[0].items.map((item, index) => (
                                <div key={index} className="detail-item">
                                    <span className="detail-label">Item Name:</span>
                                    <span className="detail-value">{item.item_name}</span>
                                    <span className="detail-label">Quantity:</span>
                                    <span className="detail-value">{item.quantity}</span>
                                    <span className="detail-label">Price:</span>
                                    <span className="detail-value">{item.price}</span>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="details-box">
                        <div className="detail-item">
                            <span className="detail-label">Order ID:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date/Time:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Customer Name:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Cashier Name:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Total Price:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <h3>Order Items:</h3>
                        <div className="detail-item">
                            <span className="detail-label">Item Name:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Quantity:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value">N/A</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="action-buttons-container">
                <button
                    className="action-button done"
                    onClick={() =>
                        selectedOrder &&
                        selectedOrder[0] &&
                        handleStatusChange(selectedOrder[0].Order_id, "Completed")
                    }
                    disabled={!selectedOrder || !selectedOrder[0]}
                >
                    Mark as Completed
                </button>
                <button
                    className="action-button preparing"
                    onClick={() =>
                        selectedOrder &&
                        selectedOrder[0] &&
                        handleStatusChange(selectedOrder[0].Order_id, "Preparing")
                    }
                    disabled={!selectedOrder || !selectedOrder[0]}
                >
                    Mark as Preparing
                </button>
                <button
                    className="action-button cancel"
                    onClick={() =>
                        selectedOrder && selectedOrder[0] && handleOrderDelete(selectedOrder[0].Order_id)
                    }
                    disabled={!selectedOrder || !selectedOrder[0]}
                >
                    Cancel Order
                </button>
            </div>
        </div>
    );
};

export default Staff;
