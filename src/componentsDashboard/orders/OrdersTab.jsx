import React, { useState, useMemo } from 'react';
import StatusFilters from './StatusFilters';
import OrdersTable from './OrdersTable';
import OrderDetailsModal from './OrderDetailsModal';
import SearchBar from '../shared/SearchBar';
import Pagination from '../shared/Pagination';
import StatusBadge from '../shared/StatusBadge';

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sample orders data - replace with your actual data source
  const orders = [
    {
      id: 1,
      customer: 'John Doe',
      date: '2023-05-15',
      amount: 125.99,
      status: 'WordPress Subscription',
      items: 3
    },
    {
      id: 2,
      customer: 'Jane Smith',
      date: '2023-05-14',
      amount: 89.50,
      status: 'You Can Pickup',
      items: 2
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      date: '2023-05-13',
      amount: 45.00,
      status: 'WhatsApp -call scheduled',
      items: 1
    },
    {
      id: 4,
      customer: 'Sarah Williams',
      date: '2023-05-12',
      amount: 210.75,
      status: 'Confirmée',
      items: 5
    },
    {
      id: 5,
      customer: 'David Brown',
      date: '2023-05-11',
      amount: 65.30,
      status: 'shipped',
      items: 2
    },
    {
      id: 6,
      customer: 'Emily Davis',
      date: '2023-05-10',
      amount: 99.99,
      status: 'delivered',
      items: 3
    },
    {
      id: 7,
      customer: 'Robert Wilson',
      date: '2023-05-09',
      amount: 150.00,
      status: 'pending',
      items: 4
    }
  ];

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery);

      const matchesFilter = 
        activeFilter === 'all' || 
        order.status.toLowerCase().includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, activeFilter]);

  // Sort logic
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = useMemo(() => {
    const sortableItems = [...filteredOrders];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredOrders, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, sortedOrders, itemsPerPage]);

  return (
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
        />
      </div>

      <OrdersTable 
        orders={currentItems}
        sortConfig={sortConfig}
        requestSort={requestSort}
        setSelectedOrder={setSelectedOrder}
        StatusBadge={StatusBadge}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredOrders.length}
      />

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          StatusBadge={StatusBadge}
        />
      )}
    </div>
  );
};

export default OrdersTab;