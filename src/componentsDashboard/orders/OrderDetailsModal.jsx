import React from 'react';
import StatusBadge from './StatusBadge';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <p className="text-gray-600">Order ID: {order.id}</p>
              <div className="mt-2 flex items-center">
                <span className="mr-2">Status:</span>
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{order.customerNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{order.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Type</p>
                      <p className="font-medium">{order.contactType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Billing Address</p>
                      <p className="font-medium">{order.billingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Source</p>
                      <p className="font-medium">{order.orderSource}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Campaign</p>
                      <p className="font-medium">{order.campaignName}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Follow-up Notes</p>
                      <p className="font-medium">{order.followUpNotes}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start border-b border-gray-200 pb-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Product
                          </a>
                        </div>
                        <p className="font-medium">{item.price}</p>
                      </div>
                    ))}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between">
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">{order.price}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium">0.00 Dhs</p>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <p className="text-gray-900 font-medium">Total</p>
                        <p className="text-gray-900 font-bold">{order.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`h-2 w-2 mt-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="ml-3">
                          <p className="font-medium">{event.status}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                          <p className="text-sm text-gray-500 mt-1">{event.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;