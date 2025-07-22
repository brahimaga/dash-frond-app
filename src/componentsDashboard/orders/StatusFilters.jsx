import React from 'react';

const StatusFilters = ({ activeFilter, setActiveFilter, setCurrentPage }) => {
  const statusFilters = [
    { id: 'all', label: 'All Orders', count: 0 }, // You can pass counts as props
    { id: 'pending', label: 'Pending', color: 'yellow', count: 0 },
    { id: 'shipped', label: 'Shipped', color: 'blue', count: 0 },
    { id: 'delivered', label: 'Delivered', color: 'green', count: 0 },
    { id: 'cancelled', label: 'Cancelled', color: 'red', count: 0 },
  ];

  // Color mapping for active states
  const activeColors = {
    pending: 'bg-yellow-600',
    shipped: 'bg-blue-600',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-600',
    all: 'bg-gray-600'
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-500 mr-2">Filter by:</span>
      {statusFilters.map(filter => {
        const isActive = activeFilter === filter.id;
        const activeColorClass = activeColors[filter.id] || 'bg-gray-600';
        
        return (
          <button
            key={filter.id}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center ${
              isActive
                ? `${activeColorClass} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setActiveFilter(filter.id);
              setCurrentPage(1);
            }}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-white text-gray-800' : 'bg-gray-300 text-gray-700'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilters;