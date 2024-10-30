import React from 'react';
import './OrderDetailsBox.css';

const OrderDetailsBox = ({ orderDetails, handleDeleteItem }) => {
    return (
        <div className="order-details-box">
            <h2>Order Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Item ID</th>
                        <th>Name</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orderDetails.map((item) => (
                        <tr key={item.Item_id}>
                            <td>{item.Item_id}</td>
                            <td>{item.name}</td>
                            <td>{item.Unit_price}</td>
                            <td>{item.quantity}</td>
                            <td>{item.total.toFixed(2)}</td>
                            <td>
                                <button onClick={() => handleDeleteItem(item.Item_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetailsBox;
