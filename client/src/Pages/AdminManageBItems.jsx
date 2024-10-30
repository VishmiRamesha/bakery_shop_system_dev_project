import React, { useState, useEffect } from "react";
import axios from "axios";

import "./AdminManageBItems.css";
import { Link } from "react-router-dom";

const CashierHome = () => {
	const [itemDetails, setItemDetails] = useState({
		name: "",
		description: "",
		category_id: "",
		Quantity: "",
		Unit: "",
		Unit_price: "",
	});
	const [items, setItems] = useState([]);
	const [filteredItems, setFilteredItems] = useState([]);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateItemId, setUpdateItemId] = useState(null);
	const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchItems();
		fetchCategories();
	}, []);

	const fetchItems = async () => {
		try {
			const response = await axios.get("http://localhost:8800/api/items");
			setItems(response.data);
			setFilteredItems(response.data); // Initialize filtered items with all items
		} catch (error) {
			console.error("Error fetching items:", error);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await axios.get("http://localhost:8800/api/categories");
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setItemDetails((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSearch = (event) => {
		const searchTerm = event.target.value.toLowerCase();
		setSearchTerm(searchTerm);
		const filtered = items.filter(
			(item) =>
				item.name.toLowerCase().includes(searchTerm) ||
				item.description.toLowerCase().includes(searchTerm) ||
				item.category_id.toString().includes(searchTerm) || // Convert category_id to string 
				item.Quantity.toString().includes(searchTerm) ||
				item.Unit.toString().includes(searchTerm) ||
				item.Unit_price.toString().includes(searchTerm)
		);
		setFilteredItems(filtered);
	};

	const clearForm = () => {
		setItemDetails({
			name: "",
			description: "",
			category_id: "",
			Quantity: "",
			Unit: "",
			Unit_price: "",
		});
		setIsUpdating(false);
		setUpdateItemId(null);
	};

	const handleRegisterOrUpdate = async (event) => {
		event.preventDefault();
		const { name, description, category_id, Quantity, Unit, Unit_price } = itemDetails;
		try {
			if (isUpdating) {
        const conformEdit = window.confirm("Are you sure you want to Update this item?");
        if (conformEdit) {
				await axios.put(`http://localhost:8800/api/items/${updateItemId}`, {
					name,
					description,
					category_id,
					Quantity,
					Unit,
					Unit_price,
				})};
			} else {
        const conformAddItem = window.confirm("Are you sure you want to Add this item?");
        if (conformAddItem)
				await axios.post("http://localhost:8800/api/items", {
					name,
					description,
					category_id,
					Quantity,
					Unit,
					Unit_price,
				});
			}
			clearForm();
			fetchItems();
		} catch (error) {
			console.error("Error saving item:", error);
		}
	};

	const handleEdit = (item) => {
		setItemDetails({
			name: item.name,
			description: item.description,
			category_id: item.category_id,
			Quantity: item.Quantity,
			Unit: item.Unit,
			Unit_price: item.Unit_price,
		});
		setIsUpdating(true);
		setUpdateItemId(item.Item_id);
	};

	const handleDelete = async (itemId) => {
		try {
      const conformDelete = window.confirm("Are you sure you want to Delete this item?");
        if (conformDelete) {
			await axios.delete(`http://localhost:8800/api/items/${itemId}`);
			fetchItems();
		}} catch (error) {
			console.error("Error deleting item:", error);
		}
	};

	return (
		<div className='bg-image'>
			
			<div className='cashier-home-container'>
				<div className='forms-container'>
					<form className='item-form' onSubmit={handleRegisterOrUpdate}>
						<h2>{isUpdating ? "Update Item" : "New Item"}</h2>
						<div className='form-group'>
							<label htmlFor='name'>Item Name:</label>
							<input
								type='text'
								id='name'
								name='name'
								value={itemDetails.name}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='description'>Description:</label>
							<input
								type='text'
								id='description'
								name='description'
								value={itemDetails.description}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='category_id'>Category:</label>
							<select
								id='category_id'
								name='category_id'
								value={itemDetails.category_id}
								onChange={handleChange}
								required>
								<option value=''>Select Category</option>
								{categories.map((category) => (
									<option key={category.category_id} value={category.category_id}>
										{category.Name}
									</option>
								))}
							</select>
						</div>
						<div className='form-group'>
							<label htmlFor='Quantity'>Quantity:</label>
							<input
								type='text'
								id='Quantity'
								name='Quantity'
								value={itemDetails.Quantity}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='Unit'>Unit:</label>
							<input
								type='text'
								id='Unit'
								name='Unit'
								value={itemDetails.Unit}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='Unit_price'>Unit Price:</label>
							<input
								type='text'
								id='Unit_price'
								name='Unit_price'
								value={itemDetails.Unit_price}
								onChange={handleChange}
								required
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

				{/* Item List */}
				<div className='item-table-container'>
					<input
						type='text'
						placeholder='Search by Name, Description, Category, Quantity, Unit, or Unit Price'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<h2>Item List</h2>
					<table className='item-table'>
						<thead>
							<tr>
								<th>Name</th>
								<th>Description</th>
								<th>Category</th>
								<th>Quantity</th>
								<th>Unit</th>
								<th>Unit Price</th>
								<th>Actions</th>
							</tr>{" "}
						</thead>
						<tbody>
							{filteredItems.map((item) => (
								<tr key={item.Item_id}>
									<td>{item.name}</td>
									<td>{item.description}</td>
									<td>{item.category_id}</td>
									<td>{item.Quantity}</td>
									<td>{item.Unit}</td>
									<td>{item.Unit_price}</td>
									<td>
										<button className='edit-button' onClick={() => handleEdit(item)}>
											Edit
										</button>
										<button className='delete-button' onClick={() => handleDelete(item.Item_id)}>
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
				
			</div>
		</div>
	);
};

export default CashierHome;
