"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import clsx from 'clsx';

const OrdersTable = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
  );
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'descending',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [orderToEdit, setOrderToEdit] = useState(null);

  // Status options for dropdown
  const statusOptions = useMemo(() => [
    { value: "Pas de réponse 4", label: "No Response" },
    { value: "En cours", label: "In Progress" },
    { value: "Livré", label: "Delivered" },
    { value: "Annulé", label: "Cancelled" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Confirmée", label: "Confirmée" },
  ], []);

  // Contact type options for dropdown
  const contactTypeOptions = useMemo(() => [
    { value: "appel", label: "Call" },
    { value: "message", label: "Message" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "site", label: "Website" },
    { value: "wordpress", label: "WordPress" },
  ], []);

  // Reusable components
  const DetailItem = ({ label, value, children }) => (
    <div className="mb-3 last:mb-0">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {children || (value || 'Not specified')}
      </dd>
    </div>
  );

  const StatusBadge = ({ status, map, defaultText }) => (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        map[status?.toLowerCase()]?.color || 'bg-gray-100 text-gray-800'
      )}
    >
      {map[status?.toLowerCase()]?.icon && (
        <span className="mr-1.5">{map[status?.toLowerCase()]?.icon}</span>
      )}
      {map[status?.toLowerCase()]?.text || status || defaultText}
    </span>
  );

  // Status and contact type mappings
  const statusMap = useMemo(() => ({
    "Pas de réponse 4": {
      text: "No Response",
      color: "bg-red-100 text-red-800",
      icon: "✖️",
    },
    "En cours": {
      text: "In Progress",
      color: "bg-yellow-100 text-yellow-800",
      icon: "🔄",
    },
    "Livré": {
      text: "Delivered",
      color: "bg-green-100 text-green-800",
      icon: "✅",
    },
    "Annulé": {
      text: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: "❌",
    },
    "Confirmed": {
      text: "Confirmed",
      color: "bg-green-100 text-green-800",
      icon: "✔️",
    },
    "Confirmée": {
      text: "Confirmed",
      color: "bg-green-100 text-green-800",
      icon: "✔️",
    },
  }), []);

  const contactTypeMap = useMemo(() => ({
    "appel": {
      text: "Call",
      color: "bg-blue-100 text-blue-800",
    },
    "message": {
      text: "Message",
      color: "bg-green-100 text-green-800",
    },
    "whatsapp": {
      text: "WhatsApp",
      color: "bg-emerald-100 text-emerald-800",
    },
    "email": {
      text: "Email",
      color: "bg-purple-100 text-purple-800",
    },
    "site": {
      text: "Website",
      color: "bg-indigo-100 text-indigo-800",
    },
    "wordpress": {
      text: "wordpress",
      color: "bg-blue-100 text-indigo-800",
    },
  }), []);

  // Function to highlight specific words safely
  const renderWithHighlights = useCallback((text) => {
    if (!text) return '-';
    const str = text.toString();
    
    // Escape HTML first to prevent XSS
    const escaped = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Apply highlighting
    return escaped
      .replace(/wordpress/gi, '<span class="bg-blue-400 px-1 rounded-full">WordPress</span>')
      .replace(/you can/gi, '<span class="bg-pink-500 px-1 rounded-full">You Can</span>')
      .replace(/youcan/gi, '<span class="bg-pink-500 px-1 rounded-full">youcan</span>')
      .replace(/shopify/gi, '<span class="bg-yellow-400 text-white px-1 rounded-full">shopify</span>')
      .replace(/watssap-call/gi, '<span class="bg-green-300 px-1 rounded-full">WhatsApp -call</span>')
      .replace(/Confirmed/gi, '<span class="bg-green-200 px-1 font-bold rounded-full">Confirmed</span>')
      .replace(/Confirmée/gi, '<span class="bg-green-100 px-1 font-bold rounded-full">Confirmée</span>')
      .replace(/shipped/gi, '<span class="bg-pink-200 px-1 rounded-full">shipped</span>')
      .replace(/REPORTE/gi, '<span class="bg-red-600 px-1 text-white rounded-full">REPORTE</span>')
      .replace(/LIVRED/gi, '<span class="bg-yellow-300 px-1 rounded-full">LIVRED</span>')
      .replace(/pas de reponce/gi, '<span class="bg-red-100 px-1 rounded-full">pas de reponce</span>')
      .replace(/Mise en distribution/gi, '<span class="bg-violet-300 px-1 rounded-full">Mise en distribution</span>')
      .replace(/RETERNE/gi, '<span class="bg-violet-300 px-1 rounded-full">RETERNE</span>')
      .replace(/anulee/gi, '<span class="bg-red-600 text-white font-bold px-1 rounded-full">anulee</span>')
      .replace(/annuler/gi, '<span class="bg-red-600 text-white font-bold px-1 rounded-full">annuler</span>')
      .replace(/Reporté/gi, '<span class="bg-red-600 text-white font-bold px-1 rounded-full">Reporté</span>')
      .replace(/instagram/gi, '<span class="bg-red-200 text-white font-bold px-1 rounded-full">instagram</span>');
  }, []);

  // Configure axios instance
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'https://app.ownecoo.com/backend/api',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      transformRequest: [
        (data, headers) => {
          if (headers) {
            Object.keys(headers).forEach((key) => {
              if (typeof headers[key] === 'string') {
                headers[key] = headers[key].replace(/[^\x00-\xFF]/g, '');
              }
            });
          }
          return JSON.stringify(data);
        },
      ],
    });

    instance.interceptors.request.use((config) => {
      if (authToken) {
        const cleanToken = authToken.replace(/[^\x00-\xFF]/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
      return config;
    });

    return instance;
  }, [authToken]);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/plorders');
      let ordersData = response.data;

      // Handle different response formats
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        } else if (Array.isArray(response.data.results)) {
          ordersData = response.data.results;
        }
      }

      if (!Array.isArray(ordersData)) {
        throw new Error('Invalid data format received from server.');
      }

      const mappedOrders = ordersData.map((order) => ({
        id: order.id || order._id || Math.random().toString(36).substr(2, 9),
        date: order.date || order.createdAt || order.order_date || '',
        customerName: order.name || order.customerName || order.client_name || '',
        customerNumber: order.number || order.phone || order.customerNumber || '',
        productName: order.items || order.productName || order.description || '',
        orderSource: order.source || order.orderSource || order.channel || '',
        orderStatus: order.order_status || order.orderStatus || order.status || 'Unknown',
        city: order.city || order.shipping_city || order.client_city || '',
        address: order.address || order.shipping_address || order.client_address || '',
        price: order.price || order.amount || order.total || 0,
        suivi: order.suivi || order.tracking || '',
        contactType: order.contactType || order.contact_type || '',
        campagne_name: order.campagne_name || order.campaign || '',
      }));

      setOrders(mappedOrders);
    } catch (err) {
      let errorMessage = 'Failed to fetch orders';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please authenticate again.';
          setShowTokenInput(true);
          localStorage.removeItem('authToken');
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.statusText) {
          errorMessage = `${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch cities function - now using a comprehensive list of Moroccan cities
  const fetchCities = useCallback(async () => {
    try {
      // Comprehensive list of Moroccan cities including student cities
      const moroccanCities = [
        "Agadir", "Al Hoceima", "Asilah", "Azemmour", "Azrou", "Beni Mellal", 
        "Berkane", "Berrechid", "Boujdour", "Casablanca", "Chefchaouen", "Dakhla", 
        "El Jadida", "Errachidia", "Essaouira", "Fes", "Figuig", "Guelmim", 
        "Ifrane", "Kenitra", "Khemisset", "Khenifra", "Khouribga", "Laayoune", 
        "Larache", "Marrakech", "Meknes", "Mohammedia", "Nador", "Ouarzazate", 
        "Oujda", "Rabat", "Safi", "Sale", "Sefrou", "Settat", "Sidi Ifni", 
        "Sidi Kacem", "Tangier", "Tan-Tan", "Taroudant", "Taza", "Tetouan", "Tiznit", 
        "Zagora", "Aïn Chock", "Aïn Sebaâ", "Aïn Diab", "Hay Hassani", "Maârif", 
        "Sidi Bernoussi", "Sidi Maarouf", "Tit Mellil", "Bouskoura", "Dar Bouazza", 
        "Mediouna", "Nouaceur", "Temara", "Skhirat", "Harhoura", "Ain Atiq", 
        "Souissi", "Agdal", "Hassan", "Yacoub El Mansour", "Takadoum", "Hay Riad", 
        "Al Irfane", "Océan", "L'Oasis", "Ennahda", "Ain Chock", "Ain Diab", 
        "Ain Sebaa", "Hay Mohammadi", "Belvedere", "Polo", "California", "Racine", 
        "Gauthier", "Gueliz", "Hivernage", "Daoudiate", "Sidi Youssef Ben Ali", 
        "Massira", "Amerchich", "Mhamid", "Agdal", "Saiss", "Atlas", "Zohour", 
        "Al Qods", "Al Wahda", "Hay Salam", "Bourgogne", "Hamria", "Agdal", 
        "Marjane", "Ouislane", "Touarga", "Youssoufia", "Al Fida", "Mers Sultan", 
        "Derb Sultan", "Sidi Othmane", "Hay Farah", "Lissasfa", "Sidi Moumen", 
        "Hay Moulay Rachid", "Oulfa", "Anfa", "Maarif", "Racine", "Gauthier", 
        "Belvedere", "California", "Polo", "Sidi Bernoussi", "Sidi Maarouf", 
        "Hay Hassani", "Al Fida", "Mers Sultan", "Derb Sultan", "Sidi Othmane", 
        "Hay Farah", "Lissasfa", "Sidi Moumen", "Hay Moulay Rachid", "Oulfa"
      ];

      // Remove duplicates and sort alphabetically
      const uniqueCities = [...new Set(moroccanCities)].sort();
      setCities(uniqueCities);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      // Fallback to a default list if API fails
      const defaultCities = [
        "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes", 
        "Oujda", "Kenitra", "Tetouan", "Safi", "El Jadida", "Beni Mellal", "Nador", 
        "Khouribga", "Settat", "Mohammedia", "Al Hoceima", "Larache", "Khemisset", 
        "Taourirt", "Errachidia", "Taroudant", "Ouarzazate", "Sidi Kacem", "Taza", 
        "Tiznit", "Azrou", "Midelt", "Sefrou", "Youssoufia", "Tan-Tan", "Sidi Ifni", 
        "Guelmim", "Dakhla", "Berkane", "Berrechid", "Sidi Slimane", "Ouezzane", 
        "Chefchaouen", "Asilah", "Azemmour", "Boujdour", "Figuig", "Laayoune", "Zagora"
      ];
      setCities(defaultCities);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchOrders();
      fetchCities();
    } else {
      setShowTokenInput(true);
    }
  }, [authToken, fetchOrders, fetchCities]);

  // Handle token submission
  const handleTokenSubmit = (e) => {
    e.preventDefault();
    const token = e.target.token.value.trim();

    if (/[^\x00-\x7F]/.test(token)) {
      setError('Token contains invalid characters. Only ASCII characters are allowed.');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      setShowTokenInput(false);
      setError(null);
    }
  };

  // Handle tracking number change
  const handleTrackingChange = (orderId, newTracking) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, suivi: newTracking } : order
      )
    );
    setIsEditingTracking(false);
    setOrderToEdit(null);
    setNewTrackingNumber('');
    // Here you would typically also make an API call to update the tracking on the server
  };

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );
    setIsEditingStatus(false);
    // Here you would typically also make an API call to update the status on the server
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const term = searchTerm?.toLowerCase() || '';
    const city = selectedCity?.toLowerCase() || '';
    
    return orders.filter(order => {
      const matchesSearch = !term || 
        Object.values(order).some(
          val => val?.toString().toLowerCase().includes(term)
        );
      
      const matchesCity = !city || 
        order.city?.toLowerCase() === city;
      
      return matchesSearch && matchesCity;
    });
  }, [orders, searchTerm, selectedCity]);

  const sortedOrders = useMemo(() => {
    if (!sortConfig.key) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      if (a[sortConfig.key] == null) return 1;
      if (b[sortConfig.key] == null) return -1;

      if (sortConfig.key === 'date') {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === 'price') {
        const numA = parseFloat(a[sortConfig.key]) || 0;
        const numB = parseFloat(b[sortConfig.key]) || 0;
        return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
      }

      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortConfig]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);
  const requestSort = useCallback((key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Table columns configuration
  const columns = useMemo(() => [
    { key: 'date', label: 'Date', sortable: true, className: 'whitespace-nowrap' },
    { key: 'customerName', label: 'Customer', sortable: true, className: 'whitespace-nowrap' },
    { key: 'customerNumber', label: 'Contact', sortable: false, className: 'whitespace-nowrap' },
    { key: 'city', label: 'City', sortable: false, className: 'whitespace-nowrap' },
    { key: 'price', label: 'Amount', sortable: true, className: 'whitespace-nowrap text-right' },
    { key: 'productName', label: 'Product', sortable: false, className: 'whitespace-nowrap' },
    { key: 'orderStatus', label: 'Status', sortable: true, className: 'whitespace-nowrap' },
    { key: 'suivi', label: 'Tracking', sortable: false, className: 'whitespace-nowrap' },
    { key: 'orderSource', label: 'Source', sortable: false, className: 'whitespace-nowrap' },
    { key: 'contactType', label: 'Contact Type', sortable: false, className: 'whitespace-nowrap' },
    { key: 'campagne_name', label: 'Campaign', sortable: false, className: 'whitespace-nowrap' },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      className: 'whitespace-nowrap text-right' 
    },
  ], []);

  const handleEditOrder = (orderId) => {
    console.log('Editing order:', orderId);
    // Implement your edit logic here
  };

  const handleViewOrder = (orderId) => {
    console.log('Viewing order:', orderId);
    // Implement your view logic here
  };

  // Authentication form
  if (showTokenInput) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please authenticate to access your orders</p>
          </div>

          <form onSubmit={handleTokenSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                API Token
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="token"
                  name="token"
                  type="password"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                  placeholder="Enter your bearer token"
                  required
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                Sign in
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-6 text-lg font-medium text-gray-700">Loading your orders...</p>
        <p className="mt-2 text-sm text-gray-500">This may take a moment</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 px-4">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>{error}</p>
            </div>
            <div className="mt-5 flex space-x-3">
              {error.includes('authenticate') && (
                <button
                  onClick={() => setShowTokenInput(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Re-authenticate
                </button>
              )}
              <button
                onClick={fetchOrders}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main table rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Dashboard</h1>
              <p className="mt-2 text-gray-600">
                {sortedOrders.length} orders • Sorted by {sortConfig.key} (
                {sortConfig.direction})
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {/* City filter dropdown */}
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Cities</option>
                  {cities.map((city, index) => (
                    <option key={`${city}-${index}`} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition shadow-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    setAuthToken('');
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center transition shadow-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Tracking Edit Section */}
          {isEditingTracking && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-grow">
                  <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Edit Tracking Number for Order #{orderToEdit?.id}
                  </label>
                  <input
                    id="tracking-number"
                    type="text"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                    placeholder="Enter new tracking number"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTrackingChange(orderToEdit.id, newTrackingNumber)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTracking(false);
                      setOrderToEdit(null);
                      setNewTrackingNumber('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
           )}
        </div>

        {/* Table section */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={clsx(
                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        column.className,
                        column.sortable && 'cursor-pointer hover:bg-gray-100 group'
                      )}
                      onClick={() => column.sortable && requestSort(column.key)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="ml-2 text-gray-400">
                            {sortConfig.key === column.key ? (
                              sortConfig.direction === 'ascending' ? (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )
                            ) : (
                              <svg
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((order) => (
                    <tr
                      key={order.id}
                      className={clsx(
                        'hover:bg-gray-50 transition-colors duration-150',
                        selectedOrder?.id === order.id && 'bg-blue-50',
                        order.productName?.includes('WordPress') && 'bg-blue-50',
                        order.productName?.includes('You Can') && 'bg-pink-50',
                        order.productName?.includes('WhatsApp -call') && 'bg-green-50',
                        order.orderStatus?.includes('Confirmée') && 'bg-green-50'
                      )}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {columns.map((column) => (
                        <td
                          key={`${order.id}-${column.key}`}
                          className={clsx('px-6 py-4 whitespace-nowrap text-sm', column.className)}
                        >
                          {column.key === 'orderStatus' ? (
                            <span
                              className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                statusMap[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {statusMap[order.orderStatus]?.icon}{' '}
                              {statusMap[order.orderStatus]?.text || order.orderStatus}
                            </span>
                          ) : column.key === 'price' ? (
                            <div className="text-right font-medium text-gray-900">
                              {parseFloat(order.price).toFixed(2)}{' '}
                              <span className="text-gray-500">MAD</span>
                            </div>
                          ) : column.key === 'date' ? (
                            <div className="text-gray-900">
                              {new Date(order.date).toLocaleDateString()}
                              <div className="text-xs text-gray-500">
                                {new Date(order.date).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : column.key === 'contactType' ? (
                            <span
                              className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                contactTypeMap[order.contactType?.toLowerCase()]?.color ||
                                  'bg-gray-100 text-gray-800'
                              )}
                            >
                              {contactTypeMap[order.contactType?.toLowerCase()]?.text ||
                                order.contactType ||
                                '-'}
                            </span>
                          ) : column.key === 'actions' ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderToEdit(order);
                                  setNewTrackingNumber(order.suivi || '');
                                  setIsEditingTracking(true);
                                }}
                                className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 text-sm font-medium transition"
                              >
                                Edit Tracking
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrder(order.id);
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm font-medium transition"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOrder(order.id);
                                }}
                                className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 text-sm font-medium transition"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <div
                              className={clsx('text-gray-900', column.className)}
                              dangerouslySetInnerHTML={{
                                __html: renderWithHighlights(order[column.key]),
                              }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No orders found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, sortedOrders.length)}
                    </span>{' '}
                    of <span className="font-medium">{sortedOrders.length}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={clsx(
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        )}
                      >
                        {number}
                      </button>
                    ))}
                  
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 overflow-y-auto z-50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
              {/* Background overlay with click-to-close */}
              <div 
                className="fixed inset-0 transition-opacity cursor-pointer"
                //onClick={() => setSelectedOrder(null)}
                aria-hidden="true"
              >
                <div className="absolute inset-0  opacity-75">
              
              {/* Modal container with smooth animation */}
              <div 
                className="inline-block mt-[100px] w-full max-w-2xl align-middle bg-white rounded-xl shadow-2xl transform transition-all"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-t-xl px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 
                      id="modal-title"
                      className="text-xl font-bold text-white"
                    >
                      Order #{selectedOrder.id || 'N/A'}
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-white hover:text-gray-200 focus:outline-none"
                      aria-label="Close"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main content with scrollable area */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Two-column responsive grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h4>
                        <DetailItem label="Name" value={selectedOrder.customerName} />
                        <DetailItem label="Phone" value={selectedOrder.customerNumber} />
                        <DetailItem label="City" value={selectedOrder.city} />
                        <DetailItem label="Address" value={selectedOrder.address} />
                        <DetailItem label="Contact Type">
                          <StatusBadge 
                            status={selectedOrder.contactType} 
                            map={contactTypeMap} 
                            defaultText="Not specified"
                          />
                        </DetailItem>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Information</h4>
                        <DetailItem label="Date" value={new Date(selectedOrder.date).toLocaleString()} />
                        <DetailItem label="Source" value={selectedOrder.orderSource} />
                        <DetailItem label="Campaign" value={selectedOrder.campagne_name} />
                      </div>
                    </div>

                    {/* Order Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Details</h4>
                        <DetailItem label="Status">
                          {isEditingStatus ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              >
                                {statusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  handleStatusChange(selectedOrder.id, newStatus);
                                  setIsEditingStatus(false);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditingStatus(false)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <StatusBadge 
                                status={selectedOrder.orderStatus} 
                                map={statusMap} 
                                defaultText="Unknown"
                              />
                              <button
                                onClick={() => {
                                  setIsEditingStatus(true);
                                  setNewStatus(selectedOrder.orderStatus);
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </DetailItem>
                        <DetailItem label="Amount" value={`${parseFloat(selectedOrder.price).toFixed(2)} MAD`} />
                        <DetailItem label="Tracking">
                          {isEditingTracking ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newTrackingNumber}
                                onChange={(e) => setNewTrackingNumber(e.target.value)}
                              />
                              <button
                                onClick={() => {
                                  handleTrackingChange(selectedOrder.id, newTrackingNumber);
                                  setIsEditingTracking(false);
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditingTracking(false)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span>{selectedOrder.suivi || 'Not specified'}</span>
                              <button
                                onClick={() => {
                                  setIsEditingTracking(true);
                                  setNewTrackingNumber(selectedOrder.suivi || '');
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </DetailItem>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Products</h4>
                        <div className="prose prose-sm max-w-none">
                          {selectedOrder.productName ? (
                            <div dangerouslySetInnerHTML={{
                              __html: renderWithHighlights(selectedOrder.productName),
                            }} />
                          ) : (
                            <p className="text-gray-500">No products listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with action buttons */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      handleEditOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    Edit Order
                  </button>
                  {selectedOrder.orderStatus !== 'Livré' && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => handleStatusChange(selectedOrder.id, 'Livré')}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>

        )}
      </div>
    </div>
  );
};

export default OrdersTable;