'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const brandIcons = {
  Zahrex: { src: '/icons/zahrex.png', link: 'https://zahrex.com' },
  Qavo: { src: '/qavo.svg', link: 'https://qavo.com' },
  Toullz: { src: '/toullz.svg', link: 'https://toullz.com' },
  Oldrix: { src: '/oldrex.png', link: '/oldrixDashboard' },
  Darsmoke: { src: '/darsmoke.svg', link: 'https://app.darsmok.ma/dashboard' },
  Gloora: { src: '/gloora.svg', link: 'https://gloora.com' },
};

const brands = Object.keys(brandIcons);

const SuperPageWithSidebar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const verifyToken = async (token) => {
    try {
      // Here you would typically verify the token with your backend
      // For demo purposes, we'll just check if it exists
      if (token) {
        setIsAuthenticated(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token) {
      router.push('/');
      return;
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    verifyToken(token);
  }, [router]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    // Redirect to login page
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // While redirecting, show nothing or a message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10">
      {/* Header with User Info and Logout */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {userData && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-blue-600 text-sm font-medium">
                {userData.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userData.username || 'User'}
            </span>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Manage all your projects in one place</p>
      </div>

      {/* Toggle Sidebar Button */}
      <button 
        onClick={toggleSidebar}
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition flex items-center"
      >
        {showSidebar ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Close Projects
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
            View All Projects
          </>
        )}
      </button>

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-full max-w-2xl min-h-[600px] bg-white/90 text-black backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-all duration-300 ease-in-out border border-gray-200">
          {/* Top Description */}
          <p className="text-gray-500 font-medium text-sm text-center mb-10">
            To get the best ecom results, we create workspace apps for more automation
          </p>

          {/* Grid of Brands */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
            {brands.map((brand, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 text-center">
                <Link
                  href={brandIcons[brand].link}
                  target={brandIcons[brand].link.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-xl shadow-sm overflow-hidden flex items-center justify-center bg-white hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <img
                    src={brandIcons[brand].src}
                    alt={brand}
                    className="w-12 h-12 object-contain p-1"
                    onError={(e) => {
                      e.target.src = '/default-icon.svg'; // Fallback image
                    }}
                  />
                </Link>
                <span className="text-sm font-medium text-gray-800">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperPageWithSidebar;