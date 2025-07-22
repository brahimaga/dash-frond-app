"use client";
import React, { useState } from 'react';
import Sidebar from '../../componentsDashboard/shared/Sidebar';
import OrdersTable from '../../componentsDashboard/orders/OrdersTable';
import SearchBar from '../../componentsDashboard/shared/SearchBar';
import StatusFilters from '../../componentsDashboard/orders/StatusFilters';
import OrderDetailsModal from '../../componentsDashboard/orders/OrderDetailsModal';
import DashboardTab from '../../componentsDashboard/dashboard/DashboardTab';
import ProductsTab from '../../componentsDashboard/products/ProductsTab';
import DeliveryTab from '../../componentsDashboard/delivery/DeliveryTab';
import CustomersTab from '../../componentsDashboard/customers/CustomersTab';

const OrderDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 5;

  // Sample orders data
  const orders = [
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      date: '2023-05-15',
      amount: 125.99,
      orderStatus: 'completed',
      items: 3
    },
    {
      id: 'ORD-002',
      customerName: 'Jane Smith',
      date: '2023-05-16',
      amount: 89.50,
      orderStatus: 'processing',
      items: 2
    },
    {
      id: 'ORD-003',
      customerName: 'Robert Johnson',
      date: '2023-05-17',
      amount: 210.00,
      orderStatus: 'shipped',
      items: 5
    },
    {
      id: 'ORD-004',
      customerName: 'Emily Davis',
      date: '2023-05-18',
      amount: 55.75,
      orderStatus: 'pending',
      items: 1
    },
    {
      id: 'ORD-005',
      customerName: 'Michael Wilson',
      date: '2023-05-19',
      amount: 175.25,
      orderStatus: 'completed',
      items: 4
    }
  ];

  const filteredOrders = orders.filter(order => {
    const statusMatch = activeFilter === 'all' || order.orderStatus.toLowerCase() === activeFilter.toLowerCase();
    const searchMatch = searchQuery === '' || Object.values(order).some(
      value => value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    return statusMatch && searchMatch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex-1 md:ml-1 p-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Dashboard</h1>

        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'delivery' && <DeliveryTab />}
        {activeTab === 'customers' && <CustomersTab />}

        {activeTab === 'orders' && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <StatusFilters
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  setCurrentPage={setCurrentPage}
                />
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search orders..."
                />
              </div>
              <OrdersTable
                orders={currentItems}
                sortConfig={sortConfig}
                requestSort={requestSort}
                setSelectedOrder={setSelectedOrder}
              />
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className="px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-[#E73E2B]"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-[#E73E2B]"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of{' '}
                      <span className="font-medium">{filteredOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-2 rounded-l-md border bg-white text-black hover:bg-[#E73E2B]"
                      >
                        ←
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border text-sm ${currentPage === page
                            ? 'z-10 bg-[#E73E2B] border-blue-500 text-black'
                            : 'bg-white border-gray-300 text-black hover:bg-[#E73E2B]'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-2 rounded-r-md border bg-white text-gray-500 hover:bg-[#E73E2B]"
                      >
                        →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder && (
              <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;