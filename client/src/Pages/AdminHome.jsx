import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBarAdmin from "../Components/NavBarCashier";
import "./AdminHome.css";
import { Link } from "react-router-dom";

const AdminHome = () => {
	const [employeeDetails, setEmployeeDetails] = useState({
		username: "",
		password: "", // Include password field
		name: "",
		email: "",
		phone_number: "",
		address: "",
		role: "cashier",
	});
	const [employees, setEmployees] = useState([]);
	const [filteredEmployees, setFilteredEmployees] = useState([]);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateEmployeeId, setUpdateEmployeeId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchEmployees();
	}, []);

	const fetchEmployees = async () => {
		try {
			const response = await axios.get("http://localhost:8800/api/employees");
			setEmployees(response.data);
			setFilteredEmployees(response.data);
		} catch (error) {
			console.error("Error fetching employees:", error);
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setEmployeeDetails((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSearch = (event) => {
		const searchTerm = event.target.value.toLowerCase();
		setSearchTerm(searchTerm);
		const filtered = employees.filter(
			(employee) =>
				employee.username.toLowerCase().includes(searchTerm) ||
				employee.name.toLowerCase().includes(searchTerm) ||
				employee.email.toLowerCase().includes(searchTerm) ||
				employee.phone_number.includes(searchTerm) ||
				employee.address.toLowerCase().includes(searchTerm) ||
				employee.role.toLowerCase().includes(searchTerm)
		);
		setFilteredEmployees(filtered);
	};

	const clearForm = () => {
		setEmployeeDetails({
			username: "",
			password: "", // Reset password field
			name: "",
			email: "",
			phone_number: "",
			address: "",
			role: "cashier",
		});
		setIsUpdating(false);
		setUpdateEmployeeId(null);
	};

	const handleRegisterOrUpdate = async (event) => {
		event.preventDefault();
		const { username, password, name, email, phone_number, address, role } = employeeDetails;
		try {
			if (isUpdating) {
				const confirmEdit = window.confirm("Are you sure you want to update this employee?");
				if (confirmEdit) {
					await axios.put(`http://localhost:8800/api/employees/${updateEmployeeId}`, {
						username,
						password, // Include password in update request
						name,
						email,
						phone_number,
						address,
						role,
					});
				}
			} else {
				const confirmAddEmployee = window.confirm("Are you sure you want to add this employee?");
				if (confirmAddEmployee) {
					await axios.post("http://localhost:8800/api/employees", {
						username,
						password, // Include password in create request
						name,
						email,
						phone_number,
						address,
						role,
					});
				}
			}
			clearForm();
			fetchEmployees();
		} catch (error) {
			console.error("Error saving employee:", error);
		}
	};

	const handleEdit = (employee) => {
		setEmployeeDetails({
			username: employee.username,
			password: "", // Leave password blank when editing
			name: employee.name,
			email: employee.email,
			phone_number: employee.phone_number,
			address: employee.address,
			role: employee.role,
		});
		setIsUpdating(true);
		setUpdateEmployeeId(employee.employee_id);
	};

	const handleDelete = async (employeeId) => {
		try {
			const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
			if (confirmDelete) {
				await axios.delete(`http://localhost:8800/api/employees/${employeeId}`);
				fetchEmployees();
			}
		} catch (error) {
			console.error("Error deleting employee:", error);
		}
	};

	return (
		<div className='bg-image'>
			<NavBarAdmin />
			<div className='admin-home-container'>
				<div className='forms-container'>
					<form className='employee-form' onSubmit={handleRegisterOrUpdate}>
						<h2>{isUpdating ? "Update Employee" : "New Employee"}</h2>
						<div className='form-group'>
							<label htmlFor='username'>Username:</label>
							<input
								type='text'
								id='username'
								name='username'
								value={employeeDetails.username}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='password'>Password:</label>
							<input
								type='password'
								id='password'
								name='password'
								value={employeeDetails.password}
								onChange={handleChange}
								required={!isUpdating} // Password is required only for new employees
							/>
						</div>					
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={employeeDetails.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone_number">Phone Number:</label>
                            <input
                                type="text"
                                id="phone_number"
                                name="phone_number"
                                value={employeeDetails.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={employeeDetails.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address:</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={employeeDetails.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role:</label>
                            <select
                                id="role"
                                name="role"
                                value={employeeDetails.role}
                                onChange={handleChange}
                            >
                                <option value="cashier">Cashier</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                          
                            
						<div className='form-group'>
							<button type='submit'>{isUpdating ? "Update" : "Register"}</button>
							<button type='button' className='refresh-button' onClick={clearForm}>
								Refresh
							</button>
						</div>
            </div>
					</form>
				</div>

				{/* Employee List */}
				<div className='employee-table-container'>
					<input
						type='text'
						placeholder='Search by Username, Name, Email, Phone Number, Address, or Role'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<h2>Employee List</h2>
					<table className='employee-table'>
						<thead>
							<tr>
								<th>Username</th>
								<th>Name</th>
								<th>Email</th>
								<th>Phone Number</th>
								<th>Address</th>
								<th>Role</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredEmployees.map((employee) => (
								<tr key={employee.employee_id}>
									<td>{employee.username}</td>
									<td>{employee.name}</td>
									<td>{employee.email || "N/A"}</td>
									<td>{employee.phone_number}</td>
									<td>{employee.address || "N/A"}</td>
									<td>{employee.role}</td>
									<td>
										<button className='edit-button' onClick={() => handleEdit(employee)}>
											Edit
										</button>
										<button
											className='delete-button'
											onClick={() => handleDelete(employee.employee_id)}>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<div className='link-container'>
				<Link to='/AdminDashboard'>Go to Admin Dashboard</Link>
			</div>
		</div>
	);
};

export default AdminHome;