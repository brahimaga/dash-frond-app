import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '',
  uppercase = false,
  showText = true
}) => {
  // Define the color scheme and icons for each status type
  const statusConfig = {
    shipped: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    delivered: { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    pending: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    cancelled: { 
      bg: 'bg-red-100', 
      text: 'text-red-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    processing: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    confirmed: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    default: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      icon: (
        <svg className="flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    // Word-specific configurations
    wordpress: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: null
    },
    'you can': {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      icon: null
    },
    'whatsapp -call': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: null
    },
    confirmée: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: null
    }
  };

  // Size configuration
  const sizeConfig = {
    xs: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3 mr-1'
    },
    sm: {
      container: 'px-2.5 py-1 text-xs',
      icon: 'w-3.5 h-3.5 mr-1'
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4 mr-1.5'
    },
    lg: {
      container: 'px-3.5 py-1.5 text-base',
      icon: 'w-5 h-5 mr-2'
    },
    xl: {
      container: 'px-4 py-2 text-lg',
      icon: 'w-6 h-6 mr-2.5'
    }
  };

  // Check for special words first
  const getStatusConfig = (status) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('wordpress')) {
      return statusConfig.wordpress;
    }
    if (lowerStatus.includes('you can')) {
      return statusConfig['you can'];
    }
    if (lowerStatus.includes('whatsapp -call')) {
      return statusConfig['whatsapp -call'];
    }
    if (lowerStatus.includes('confirmée')) {
      return statusConfig.confirmée;
    }
    
    return statusConfig[lowerStatus] || statusConfig.default;
  };

  const config = getStatusConfig(status);
  const sizeClass = sizeConfig[size] || sizeConfig.md;

  // Status text transformation
  const statusText = () => {
    if (!showText) return null;
    
    const text = status.toLowerCase() === 'default' ? 'Unknown' : status;
    return uppercase ? text.toUpperCase() : text;
  };

  return (
    <div 
      className={`
        inline-flex items-center rounded-full font-medium 
        ${config.bg} ${config.text} 
        ${sizeClass.container} 
        ${className}
      `}
    >
      {showIcon && config.icon && (
        <span className={sizeClass.icon}>
          {config.icon}
        </span>
      )}
      {showText && (
        <span className={`whitespace-nowrap ${uppercase ? 'uppercase' : 'capitalize'}`}>
          {statusText()}
        </span>
      )}
    </div>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  uppercase: PropTypes.bool,
  showText: PropTypes.bool
};

export default StatusBadge;