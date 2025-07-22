import React from 'react';
import SummaryStats from './SummaryStats';
import Charts from './Charts';
import RecentOrders from './RecentOrders';

const DashboardTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Dasshboard Overview</h1>
      </div>
      
      <SummaryStats />
      <Charts />
      <RecentOrders />
    </div>
  );
};

export default DashboardTab;