"use client";
import React, { useState } from 'react';
import Sidebar from '../components/shared/Sidebar';
import DashboardTab from '../components/dashboard/DashboardTab';
import OrdersTab from '../components/orders/OrdersTab';
import ProductsTab from '../components/products/ProductsTab';
import DeliveryTab from '../components/delivery/DeliveryTab';
import CustomersTab from '../components/customers/CustomersTab';

const OrderDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'delivery' && <DeliveryTab />}
          {activeTab === 'customers' && <CustomersTab />}
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;