import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const OrderTrackingPage = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // Map configuration
  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  // Handle login form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('https://app.darsmok.ma/backend/api/login', {
        username: loginForm.username,
        password: loginForm.password
      });
      
      setAuthToken(response.data.token);
      localStorage.setItem('authToken', response.data.token);
      fetchOrders(response.data.token);
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Fetch orders function
  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('https://app.darsmok.ma/backend/api/plorders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setOrders(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedOrder(response.data.data[0]);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        setAuthToken('');
        setError('Session expired. Please login again.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (authToken) {
      fetchOrders(authToken);
    }
  }, [authToken]);

  // Calculate map center
  const getMapCenter = () => {
    if (!selectedOrder) return { lat: 31.7917, lng: -7.0926 }; // Default to Morocco
    
    return {
      lat: selectedOrder.current_lat || 31.7917,
      lng: selectedOrder.current_lng || -7.0926
    };
  };

  // Generate path for Polyline
  const getPathCoordinates = () => {
    if (!selectedOrder) return [];
    
    return [
      { lat: selectedOrder.warehouse_lat || 33.5731, lng: selectedOrder.warehouse_lng || -7.5898 },
      { lat: selectedOrder.current_lat || 31.7917, lng: selectedOrder.current_lng || -7.0926 },
      { lat: selectedOrder.delivery_lat || 31.7917, lng: selectedOrder.delivery_lng || -7.0926 }
    ];
  };

  // Loading state
  if (loading && authToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated state
  if (!authToken) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Order Tracking Login</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                name="username"
                value={loginForm.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            setAuthToken('');
          }}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Logout
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('list')}
        >
          Order List
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className={`lg:col-span-1 ${activeTab === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Your Orders</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {orders.map(order => (
                <div 
                  key={order.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{order.product_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Order ID: {order.order_id}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${order.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Ordered</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className={`lg:col-span-2 ${activeTab === 'list' ? 'block' : 'hidden lg:block'}`}>
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOrder.product_name}</h2>
                    <p className="text-gray-600 mt-1">Order ID: {selectedOrder.order_id}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-[#E8EEFF] rounded-[11px] py-[14px] px-[15px] gap-[7px]">
                      <div className="relative w-[20px] h-[20px]">
                        <div className="absolute inset-[10.42%] border-[1.5px] border-[#424AFF]"></div>
                        <div className="absolute left-[37.5%] right-[33.33%] top-[33.33%] bottom-[45.83%] border-[1.5px] border-[#424AFF]"></div>
                      </div>
                      <span className="text-[15px] font-medium leading-[33px] text-[#424AFF]">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center bg-[#FFE9CF] rounded-[11px] py-[14px] px-[15px] gap-[7px]">
                      <div className="relative w-[20px] h-[20px]">
                        <div className="absolute inset-[8.33%] border-[1px] border-[#FF7F07]"></div>
                        <div className="absolute left-[49.97%] right-[50%] top-[66.67%] bottom-[33.33%] border-[1px] border-[#FF7F07]"></div>
                        <div className="absolute left-[50%] right-[50%] top-[37.5%] bottom-[45.83%] border-[1px] border-[#FF7F07]"></div>
                      </div>
                      <span className="text-[10px] font-medium leading-[33px] text-[#FF7F07]">
                        Delay
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {activeTab === 'map' ? (
                  // Map View
                  <div>
                    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={getMapCenter()}
                        zoom={12}
                      >
                        {/* Warehouse Marker */}
                        <Marker 
                          position={{
                            lat: selectedOrder.warehouse_lat || 33.5731,
                            lng: selectedOrder.warehouse_lng || -7.5898
                          }} 
                          label={{ text: "W", color: "white" }}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                          }}
                        />
                        
                        {/* Current Location Marker */}
                        <Marker 
                          position={{
                            lat: selectedOrder.current_lat || 31.7917,
                            lng: selectedOrder.current_lng || -7.0926
                          }} 
                          label={{ text: "D", color: "white" }}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                          }}
                        />
                        
                        {/* Destination Marker */}
                        <Marker 
                          position={{
                            lat: selectedOrder.delivery_lat || 31.7917,
                            lng: selectedOrder.delivery_lng || -7.0926
                          }} 
                          label={{ text: "H", color: "white" }}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          }}
                        />
                        
                        {/* Delivery Path */}
                        <Polyline
                          path={getPathCoordinates()}
                          options={{
                            strokeColor: "#4285F4",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            geodesic: true
                          }}
                        />
                      </GoogleMap>
                    </LoadScript>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-500 text-sm">Estimated Delivery</h3>
                        <p className="font-semibold mt-1">{selectedOrder.estimated_delivery}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-500 text-sm">Courier</h3>
                        <p className="font-semibold mt-1">{selectedOrder.courier || 'Aramex'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-500 text-sm">Distance</h3>
                        <p className="font-semibold mt-1">{selectedOrder.distance || 'Calculating...'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Timeline View
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-4">Tracking Timeline</h3>
                      
                      <div className="relative pl-8">
                        {/* Timeline line */}
                        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-blue-200"></div>
                        
                        {selectedOrder.tracking_history?.map((tracking, index) => (
                          <div key={index} className="relative pb-6 last:pb-0">
                            <div className={`absolute left-[11px] top-0 w-[8px] h-[8px] rounded-full ${
                              index === 0 ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-blue-400'
                            }`}></div>
                            <div className="ml-6">
                              <div className="font-medium text-gray-900">{tracking.status}</div>
                              <div className="text-sm text-gray-500">{tracking.date}</div>
                              <div className="text-sm text-gray-600 mt-1">{tracking.description}</div>
                              {tracking.location && (
                                <div className="text-sm text-gray-600 mt-1 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {tracking.location}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-[42px] h-[42px] bg-[#D9D9D9] rounded-full mr-4 flex items-center justify-center">
                            <div className="w-[30px] h-[30px] bg-gray-300"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Headphones sony</h4>
                            <p className="text-sm text-gray-600">1 X RP 234.50 Dhs</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-[42px] h-[42px] bg-[#D9D9D9] rounded-full mr-4 flex items-center justify-center">
                            <div className="w-[30px] h-[30px] bg-gray-300"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Headphones sony</h4>
                            <p className="text-sm text-gray-600">1 X RP 67.00 Dhs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipping Info */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                      <div className="bg-[#F4F8F9] rounded-t-[16px] p-4">
                        <div className="flex items-start mb-4">
                          <div className="w-[10px] h-[10px] bg-[#424AFF] rounded-full mt-1 mr-3"></div>
                          <div>
                            <p className="text-[15px] font-medium text-[#424AFF]">
                              3234 technopark, Agadir, 456 Office 234
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Shipping from</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-[10px] h-[10px] bg-[#424AFF] rounded-full mt-1 mr-3"></div>
                          <div>
                            <p className="text-[15px] font-medium text-[#424AFF]">
                              89 Bd zarktouni, Ben Mellal, rue maaroufi 45
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Shipping to</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Courier Info */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Courier Information</h3>
                        <div className="flex items-center bg-white rounded-[8px] px-[11px] py-[14px] gap-[10px]">
                          <div className="w-[16px] h-[16px] bg-gray-300 rounded-full"></div>
                          <span className="text-[15px] font-medium">Aramex</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-[19px] p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-[45px] h-[45px] bg-gray-200 rounded-full mr-4"></div>
                          <div>
                            <h4 className="font-medium">brahim aga</h4>
                            <p className="text-sm text-gray-500">Chauffeur</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="text-sm font-medium">12 ans</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Permis</p>
                            <p className="text-sm font-medium">B,C</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Driver license</p>
                            <p className="text-sm font-medium">HA 7878</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CIN</p>
                            <p className="text-sm font-medium">K12345</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4">
                          <button className="bg-[#424AFF] text-white px-4 py-2 rounded-full text-xs">
                            Appel
                          </button>
                          <button className="border border-[#424AFF] text-[#1A0C6E] px-4 py-2 rounded-full text-xs">
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => setActiveTab(activeTab === 'map' ? 'list' : 'map')}
                >
                  {activeTab === 'map' ? 'View Timeline' : 'View on Map'}
                </button>
                <div className="flex space-x-4">
                  <button className="text-[#383940] text-sm font-medium underline">
                    Cancel Order
                  </button>
                  <button className="bg-[#424AFF] text-[#C6C8FE] px-4 py-2 rounded-[10px] text-sm font-medium">
                    Notify Customer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No order selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;