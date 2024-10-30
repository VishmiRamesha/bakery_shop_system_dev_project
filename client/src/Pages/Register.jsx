import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

const Register = () => {
	const [role, setRole] = useState("cashier");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [address, setAddress] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleRoleChange = (e) => {
		setRole(e.target.value);
	};

	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
	};

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
	};

	const handlePhoneNumberChange = (e) => {
		setPhoneNumber(e.target.value);
	};

	const handleAddressChange = (e) => {
		setAddress(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!email.includes("@")) {
			setError("Please include '@' in the email address.");
			return;
		}
        
		try {
			const response = await axios.post("http://localhost:8800/register", {
				role,
				username,
				password,
				name,
				email,
				phone_number: phoneNumber,
				address,
			});
			setSuccessMessage("Registration successful. Redirecting to login...");
			setTimeout(() => {
				navigate("/");
			}, 3000);
		} catch (error) {
			if (error.response && error.response.data) {
				setError(error.response.data);
			} else {
				setError("Registration failed");
			}
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword((prevState) => !prevState);
	};

	return (
		<div className="bg-image">
			<h1 className="heading">Gurukanda Bakers</h1>
			<h2 className="register-heading">Register</h2>
			<div className="register-container">
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Select Role:</label>
						<select value={role} onChange={handleRoleChange}>
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
						<div className="password-input">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={handlePasswordChange}
							/>
							<i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} password-icon`} onClick={togglePasswordVisibility}></i>
						</div>
					</div>
					<div className="form-group">
						<label>Confirm Password:</label>
						<input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
					</div>
					<div className="form-group">
						<label>Name:</label>
						<input type="text" value={name} onChange={handleNameChange} />
					</div>
					<div className="form-group">
						<label>Email:</label>
						<input type="email" value={email} onChange={handleEmailChange} />
					</div>
					<div className="form-group">
						<label>Phone Number:</label>
						<input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} />
					</div>
					<div className="form-group">
						<label>Address:</label>
						<input type="text" value={address} onChange={handleAddressChange} />
					</div>
					{error && <p className="error">{error}</p>}
					{successMessage && <p className="success">{successMessage}</p>}
					<div className="button">
						<button type="submit">Register</button>
					</div>
				</form>
        <NavLink to='/'>Already have an Account?</NavLink>
			</div>
		</div>
	);
};

export default Register;
