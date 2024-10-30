// Login.js
import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Components/data"; // Ensure correct import
import "./Login.css"


// Login component for user authentication

const Login = () => {
    const [role, setRole] = useState("cashier");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth(); // Access login function from AuthContext

    const handleRoleChange = (e) => setRole(e.target.value);
    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    // Handle form submission for login

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            // Send POST request to login endpoint
            const response = await axios.post("http://localhost:8800/login", { role, username, password });
            const user = response.data;
            if (user.role === role) {
                login(user); // Save user data to context
                setSuccessMessage("Login successful!");
                setError("");

                // Navigate to appropriate page based on role
                if (user.role === "cashier") navigate("/CashierHome");
                else if (user.role === "staff") navigate("/Staff");
                else if (user.role === "admin") navigate("/AdminHome");
            } else {
                setError("Role mismatch: User role does not match selected role");
                setSuccessMessage("");
            }
        } catch (error) { 
            setError("Login failed: Invalid credentials");
            setSuccessMessage("");
        }
    };

    return (
        <div className="login bg-image">
            <h1 className="heading">Gurukanda Bakers</h1>
            <h2 className="login-heading">Log in</h2>
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Role:</label>
                        <select value={role} onChange={handleRoleChange}>
                            <option value="admin">Admin</option>
                            <option value="cashier">Cashier</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Username:</label>
                        <input type="text" value={username} onChange={handleUsernameChange} />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={handlePasswordChange} />
                    </div>
                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success">{successMessage}</p>}
                    <div className="button">
                        <button type="submit">Login</button>
                    </div>
                </form>
                <NavLink to="/register">Don't have an Account?</NavLink>
            </div>
        </div>
    );
};

export default Login;
