import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBarCashier from "../Components/NavBarCashier";
import "./CashierHome.css";
import { Link, NavLink, useNavigate } from "react-router-dom";

//CashierHome component to manage customer data

const CashierHome = () => {
    const [customerDetails, setCustomerDetails] = useState({ Name: "", email: "", phone_number: "" });
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateCustomerId, setUpdateCustomerId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Fetch customers when the component mounts

    useEffect(() => {
        fetchCustomers();
    }, []);

// Function to fetch customers from the server
    const fetchCustomers = async () => {
        try {
            const response = await axios.get("http://localhost:8800/api/customers");
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };
// Handle changes in the form inputs

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCustomerDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

// Handle search input changes and filter customers
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);
        const filtered = customers.filter(
            (customer) =>
                customer.Name.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm) ||
                customer.phone_number.includes(searchTerm)
        );
        setFilteredCustomers(filtered);
    };

    // Clear the form and reset update state

    const clearForm = () => {
        setCustomerDetails({ Name: "", email: "", phone_number: "" });
        setIsUpdating(false);
        setUpdateCustomerId(null);
    };

    // Handle form submission for registering or updating a customer

    const handleRegisterOrUpdate = async (event) => {
        event.preventDefault();
        const { Name, email, phone_number } = customerDetails;
        try {
            if (isUpdating) {
                const conformEdit = window.confirm("Are you sure you want to Update this customer?");
                if (conformEdit) {
                    await axios.put(`http://localhost:8800/api/customers/${updateCustomerId}`, {
                        name: Name,
                        email,
                        phone_number,
                    });
                }
            } else {
                const conformAddCustomer = window.confirm("Are you sure you want to Add this customer?");
                if (conformAddCustomer) {
                    await axios.post("http://localhost:8800/api/customers", {
                        name: Name,
                        email,
                        phone_number,
                    });
                }
            }
            clearForm();
            fetchCustomers();
        } catch (error) {
            console.error("Error saving customer:", error);
        }
    };

    // Handle edit button click and populate form with customer data

    const handleEdit = (customer) => {
        setCustomerDetails({
            Name: customer.Name,
            email: customer.email,
            phone_number: customer.phone_number,
        });
        setIsUpdating(true);
        setUpdateCustomerId(customer.C_ID);
    };

    // Handle delete button click and remove customer
    
    const handleDelete = async (customerId) => {
        try {
            const conformDelete = window.confirm("Are you sure you want to Delete this customer?");
            if (conformDelete) {
                await axios.delete(`http://localhost:8800/api/customers/${customerId}`);
                fetchCustomers();
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };

    return (
        <div className='bg-image'>
            <NavBarCashier />
            <div className='cashier-home-container'>
                <div className='forms-container'>
                    <form className='customer-form' onSubmit={handleRegisterOrUpdate}>
                        <h2>{isUpdating ? "Update Customer" : "New Customer"}</h2>
                        <div className='form-group'>
                            <label htmlFor='Name'>Customer Name:</label>
                            <input
                                type='text'
                                id='Name'
                                name='Name'
                                value={customerDetails.Name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor='phone_number'>Phone Number:</label>
                            <input
                                type='text'
                                id='phone_number'
                                name='phone_number'
                                value={customerDetails.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor='email'>Email:</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={customerDetails.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='form-group'>
                            <button type='submit'>{isUpdating ? "Update" : "Register"}</button>
                            <button type='button' className='refresh-button' onClick={clearForm}>
                                Refresh
                            </button>
                        </div>
                    </form>
                </div>

                <div className='customer-table-container'>
                    <input
                        type='text'
                        placeholder='Search by Name, Email, or Phone Number'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <h2>Customer List</h2>
                    <table className='customer-table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.C_ID}>
                                    <td>{customer.Name}</td>
                                    <td>{customer.email || "N/A"}</td>
                                    <td>{customer.phone_number}</td>
                                    <td>
                                        <button className='edit-button' onClick={() => handleEdit(customer)}>
                                            Edit
                                        </button>
                                        <button className='delete-button' onClick={() => handleDelete(customer.C_ID)}>
                                            Delete
                                        </button>
                                        <NavLink 
                                            to="/CashierCurrentOrders" 
                                            state={{ customerID: customer.C_ID }}
                                            className='order-button'
                                        >
                                            Order
                                        </NavLink>                                
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='link-container'>
                <Link to='/CashierCurrentOrders'>Proceed Cashier without Customer Details </Link>
            </div>
        </div>
    );
};

export default CashierHome;
