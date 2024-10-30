import React from 'react';
import '../Components/NavBarCashier.css';

const NavBarCashier = () => {
    return (
        <nav>
            <ul>
                <li><a href="/CashierHome">Home</a></li>
                <li><a href="/CashierCurrentOrders">Current Orders</a></li>
                
            </ul>
        </nav>
    );
};

export default NavBarCashier;