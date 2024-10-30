import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBarCashier from "../Components/NavBarCashier";
import "./CashierCurrentOrders.css";
import OrderDetailsBox from "../Components/OrderDetailsBox";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../Components/data"; // Ensure correct import
import { useLocation } from "react-router-dom";

// State variables for managing component state
function CashierCurrentOrders() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [availableItems, setAvailableItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState("");
    const [balance, setBalance] = useState(0);
    const [categories, setCategories] = useState([]);
    const [customer, setCustomer] = useState({}); // New state to store customer details

    const { auth } = useAuth(); // Use the useAuth hook to get auth info
    const location = useLocation();
    const customerID = location.state?.customerID; // Get customer ID from navigation state

    // Toggle dropdown visibility
    const toggleDropdown = () => setShowDropdown(!showDropdown);

    // Fetch categories from the server
    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8800/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // Fetch items from the server
    const fetchItems = async () => {
        try {
            const response = await axios.get("http://localhost:8800/api/items");
            const items = response.data.map((item) => ({
                ...item,
                Unit_price: parseFloat(item.Unit_price),
            }));
            setAvailableItems(items);
            setFilteredItems(items);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    // Fetch customer details from the server
    const fetchCustomerDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8800/api/customers/${id}`);
            setCustomer(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching customer details:", error);
        }
    };

    // Handle quantity input change
    const handleQuantityChange = (e) => setQuantity(e.target.value);

    // Handle paid amount input change
    const handlePaidAmountChange = (e) => {
        const paid = parseFloat(e.target.value) || 0;
        setPaidAmount(paid);
        setBalance(paid - totalAmount);
    };

    // Handle category selection from dropdown
    const handleCategorySelect = (categoryId) => {
        if (categoryId === "") {
            setFilteredItems(availableItems);
        } else {
            const filtered = availableItems.filter((item) => item.category_id === parseInt(categoryId));
            setFilteredItems(filtered);
        }
        toggleDropdown();
    };

    // Add item to cart
    const handleAddToCart = () => {
        if (selectedItem && quantity > 0) {
            if (quantity <= selectedItem.Quantity) {
                const itemTotal = selectedItem.Unit_price * quantity;
                const newItem = {
                    ...selectedItem,
                    quantity: parseInt(quantity),
                    total: itemTotal,
                };
                setOrderDetails([...orderDetails, newItem]);

                const newTotal = totalAmount + itemTotal;
                setTotalAmount(newTotal);
                setBalance(paidAmount - newTotal);

                setQuantity("");
                setSelectedItem(null);
            } else {
                alert("Quantity exceeds available stock!");
            }
        }
    };

    // Delete item from cart
    const handleDeleteItem = (itemId) => {
        const updatedOrderDetails = orderDetails.filter((item) => item.Item_id !== itemId);
        setOrderDetails(updatedOrderDetails);

        const newTotal = updatedOrderDetails.reduce((acc, item) => acc + item.total, 0);
        setTotalAmount(newTotal);
        setBalance(paidAmount - newTotal);
    };

    // Cancel the current order
    const handleCancelOrder = () => {
        setOrderDetails([]);
        setTotalAmount(0);
        setPaidAmount("");
        setBalance(0);
    };

    // Place the order and generate PDF receipt
    const handlePlaceOrder = async () => {
        try {
            // Prepare order items array for backend
            const formattedOrderItems = orderDetails.map((item) => ({
                item_id: item.Item_id,
                item_name: item.name, // Include item name
                quantity: item.quantity,
                price: item.Unit_price.toFixed(2) // Ensure price is formatted as expected by backend
            }));
            
// The server processes the order and stores it in the database
            const response = await axios.post("http://localhost:8800/api/orders", {
                status: "Pending",
                dateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
                customerName: customer.Name, // Use the customer's name
                cashierName: auth ? auth.name : "-", // Use the cashier's username from auth
                totalPrice: totalAmount.toFixed(2), // Ensure totalPrice is formatted correctly
                orderItems: formattedOrderItems, // Use 'orderItems' instead of 'orderDetails'
            });

            // Generate PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
            const companyName = "Gurukanda Bakers";
            doc.setFontSize(20); // Set larger font size
            doc.setFont("helvetica", "bold"); // Set bold font
            const textWidth = doc.getTextWidth(companyName); // Get text width for alignment
            doc.text(companyName, (pageWidth - textWidth) / 2, 20); // Center align text

            doc.setFontSize(12); // Reset font size for the rest of the text
            doc.setFont("helvetica", "normal"); // Reset font style
            doc.text(`Receipt`, 10, 40);
            doc.text(`Customer: ${customer.Name}`, 10, 50);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 60);
            doc.text(`Cashier: ${auth ? auth.name : "-"}`, 10, 70);
            doc.text("Order Details:", 10, 80);

            // Create table with order details
            doc.autoTable({
                startY: 90,
                head: [["Item ID", "Name", "Price", "Quantity", "Total"]],
                body: orderDetails.map((item) => [
                    item.Item_id,
                    item.name,
                    item.Unit_price.toFixed(2),
                    item.quantity,
                    item.total.toFixed(2),
                ]),
            });

            doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
            doc.text(`Paid Amount: Rs. ${paidAmount.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 20);
            doc.text(`Balance: Rs. ${balance.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 30);

            doc.save("receipt.pdf");

            handleCancelOrder(); // Clear order details after placing order
        } catch (error) {
            console.error("Error placing order:", error);
            // Handle error appropriately (e.g., display error message to user)
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchCategories();
        fetchItems();
        if (customerID) {
            fetchCustomerDetails(customerID); // Fetch customer details
        }
    }, [customerID]);

    return (
        <div className='bg-image'>
            <NavBarCashier />
            <div className='order-info'>
                <p>Customer: {customer.Name || "-"}</p> {/* Display customer name */}
                <p>Cashier: {auth ? auth.name : "Unknown"}</p> {/* Display cashier's name */}
            </div>
            <h1>Current Orders</h1>
            <div className='dropdown'>
                <select className='dropbtn' onChange={(e) => handleCategorySelect(e.target.value)}>
                    <option value=''>Select Category</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.Name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                className='cashiercurrentorderspage refresh-button'
                onClick={() => setFilteredItems(availableItems)}>
                Refresh
            </button>
            <div className='box'>
                <table>
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.Item_id}>
                                <td>{item.Item_id}</td>
                                <td>{item.name}</td>
                                <td>{item.Unit_price}</td>
                                <td>{item.Quantity}</td>
                                <td>
                                    <button onClick={() => setSelectedItem(item)}>Select</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className='add-to-cart' onClick={handleAddToCart}>
                    Add to Cart
                </button>
            </div>
            <div className='quantity-input'>
                <label htmlFor='quantity'>Enter Quantity:</label>
                <input type='number' id='quantity' value={quantity} onChange={handleQuantityChange} />
            </div>
            <OrderDetailsBox orderDetails={orderDetails} handleDeleteItem={handleDeleteItem} />
            <div className='total-box'>
                <h3>Total: Rs. {totalAmount.toFixed(2)}</h3>
                <label htmlFor='paidAmount'>Paid Amount: </label>
                <input type='number' id='paidAmount' value={paidAmount} onChange={handlePaidAmountChange} />
                <h3>Balance: Rs. {balance.toFixed(2)}</h3>
            </div>
            <div className='actions'>
                <button className='place-order' onClick={handlePlaceOrder}>
                    Place Order
                </button>
                <button className='cancel-order' onClick={handleCancelOrder}>
                    Cancel Order
                </button>
            </div>
        </div>
    );
}

export default CashierCurrentOrders;
