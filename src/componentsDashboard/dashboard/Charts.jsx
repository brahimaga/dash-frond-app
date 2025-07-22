import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = () => {
  // State management
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [timeRange, setTimeRange] = useState('monthly');

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://app.darsmok.ma/backend/api/plorders', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      processChartData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  }, [timeRange]);

  // Process API data into chart format
  const processChartData = (apiData) => {
    try {
      const groupedData = {};
      const ordersData = Array.isArray(apiData) ? apiData : 
                       (apiData.data || apiData.orders || apiData.results || []);

      if (!Array.isArray(ordersData)) {
        throw new Error('Invalid data format received from API');
      }

      ordersData.forEach(order => {
        const orderDate = new Date(order.date || order.createdAt || order.order_date);
        let groupKey;
        
        if (timeRange === 'daily') {
          groupKey = orderDate.toLocaleDateString();
        } else if (timeRange === 'weekly') {
          const weekNumber = getWeekNumber(orderDate);
          groupKey = `Week ${weekNumber}`;
        } else {
          groupKey = orderDate.toLocaleString('default', { month: 'short' });
        }

        const price = parseFloat(order.price || order.amount || order.total || 0);

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            name: groupKey,
            orders: 0,
            revenue: 0,
            returningCustomers: 0,
            newCustomers: 0
          };
        }

        groupedData[groupKey].orders += 1;
        groupedData[groupKey].revenue += price;
        
        if (order.contactType === 'returning' || order.contact_type === 'returning') {
          groupedData[groupKey].returningCustomers += 1;
        } else {
          groupedData[groupKey].newCustomers += 1;
        }
      });

      // Convert to array and calculate averages
      let processedData = Object.values(groupedData).map(group => ({
        ...group,
        avgOrderValue: (group.revenue / group.orders).toFixed(2),
        conversionRate: group.returningCustomers > 0 ? 
          ((group.returningCustomers / group.orders) * 100).toFixed(1) : 0
      }));

      // Sort data based on time range
      if (timeRange === 'daily') {
        processedData.sort((a, b) => new Date(a.name) - new Date(b.name));
      } else if (timeRange === 'weekly') {
        processedData.sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
      } else {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        processedData.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
      }

      setChartData(processedData);
      setLoading(false);
    } catch (err) {
      setError('Error processing data: ' + err.message);
      setLoading(false);
    }
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Set up auto-refresh
  useEffect(() => {
    fetchData();
    
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, autoRefresh, refreshInterval]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Change refresh interval
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 5 && value <= 300) {
      setRefreshInterval(value);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={`tooltip-item-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.name}:</span>
                <span className="font-medium ml-1 text-gray-800">
                  {entry.name.includes('revenue') || entry.name.includes('Value') ? 
                    `${entry.value} Dhs` : 
                    entry.name.includes('Rate') ? `${entry.value}%` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading && chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading analytics data...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch your dashboard</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Error loading data</h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>{error}</p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">
            Insights and metrics from your orders data
            {lastUpdated && (
              <span className="ml-2">• Last updated: {lastUpdated.toLocaleString()}</span>
            )}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <label htmlFor="timeRange" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Time Range:
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={toggleAutoRefresh}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                autoRefresh 
                  ? 'border-transparent shadow-sm text-white bg-green-600 hover:bg-green-700' 
                  : 'border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-refresh
            </button>
            
            {autoRefresh && (
              <div className="flex items-center space-x-2">
                <label htmlFor="interval" className="text-sm text-gray-700 whitespace-nowrap">
                  Every:
                </label>
                <input
                  type="number"
                  id="interval"
                  min="5"
                  max="300"
                  value={refreshInterval}
                  onChange={handleIntervalChange}
                  className="block w-16 pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                <span className="text-sm text-gray-700">sec</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {chartData.reduce((sum, month) => sum + month.orders, 0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {chartData.length} {timeRange === 'daily' ? 'days' : timeRange === 'weekly' ? 'weeks' : 'months'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {chartData.reduce((sum, month) => sum + month.revenue, 0).toLocaleString()} Dhs
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {calculateGrowth(chartData)}% growth
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Avg. Order Value</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {(
                chartData.reduce((sum, month) => sum + parseFloat(month.avgOrderValue), 0) / 
                chartData.length
              ).toFixed(2)} Dhs
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {chartData[chartData.length - 1]?.avgOrderValue} Dhs last {timeRange.slice(0, -2)}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Returning Customers</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {chartData.reduce((sum, month) => sum + month.returningCustomers, 0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {(
                (chartData.reduce((sum, month) => sum + month.returningCustomers, 0) /
                chartData.reduce((sum, month) => sum + month.orders, 0)) * 100
              ).toFixed(1)}% conversion rate
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Orders Overview</h2>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {timeRange === 'daily' ? 'Daily' : timeRange === 'weekly' ? 'Weekly' : 'Monthly'}
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#8b5cf6" 
                  name="Total Orders"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="returningCustomers" 
                  fill="#d946ef" 
                  name="Returning Customers"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="newCustomers" 
                  fill="#8b5cf6" 
                  name="New Customers"
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
            <div className="flex space-x-2">
              {chartData.length > 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {calculateGrowth(chartData)}% growth
                </span>
              )}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  name="Total Revenue (Dhs)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="avgOrderValue" 
                  fill="#0ea5e9" 
                  name="Avg. Order Value (Dhs)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Performance Metrics</h2>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Comprehensive View
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
              />
              <Bar 
                dataKey="orders" 
                fill="#8b5cf6" 
                name="Total Orders"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="revenue" 
                fill="#10b981" 
                name="Total Revenue (Dhs)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="avgOrderValue" 
                fill="#0ea5e9" 
                name="Avg. Order Value (Dhs)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="conversionRate" 
                fill="#d946ef" 
                name="Conversion Rate (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate growth percentage
function calculateGrowth(data) {
  if (data.length < 2) return 0;
  
  const firstPeriod = data[0].revenue;
  const lastPeriod = data[data.length - 1].revenue;
  
  if (firstPeriod === 0) return 100;
  
  const growth = ((lastPeriod - firstPeriod) / firstPeriod) * 100;
  return growth.toFixed(1);
}

export default AnalyticsDashboard;