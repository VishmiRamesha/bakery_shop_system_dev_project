import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import AdminHome from './Pages/AdminHome';
import AdminManageBItems from './Pages/AdminManageBItems';
import CashierHome from './Pages/CashierHome';
import Staff from './Pages/Staff';



import CashierCurrentOrders from './Pages/CashierCurrentOrders';
import Register from './Pages/Register';
import { AuthProvider } from './Components/data';

function App() {
  return (
    <div className="App">
         <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/CashierHome" element={<CashierHome />} />
          <Route path="/AdminHome" element={<AdminHome />} />
          <Route path="/AdminManageBItems" element={<AdminManageBItems />} />
          <Route path="/CashierCurrentOrders" element={<CashierCurrentOrders />} />
          <Route path="Staff" element={<Staff />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
