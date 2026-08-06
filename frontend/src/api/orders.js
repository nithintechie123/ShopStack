import api from './client';

// Create Razorpay payment session
export const createPaymentSession = (data) =>
  api.post('/api/orders/create-payment-session', typeof data === 'object' ? data : { items: [] });

// Place Checkout Order
export const checkoutOrder = (data) =>
  api.post('/api/orders/checkout', data);

// Customer: Get logged in user orders
export const getMyOrders = () =>
  api.get('/api/orders/my-orders');

// Get specific order details
export const getOrderById = (id) =>
  api.get(`/api/orders/${id}`);

// Update Order Status (Vendor / Admin)
export const updateOrderStatus = (id, status) =>
  api.put(`/api/orders/${id}/status`, { status });

// Vendor: Get orders containing vendor's products
export const getVendorOrders = () =>
  api.get('/api/vendor/orders');

// Admin: Get all platform orders
export const getAdminOrders = () =>
  api.get('/api/admin/orders');

// Validate Coupon Code
export const validateCoupon = (code) =>
  api.get(`/api/coupons/validate/${code}`);

// Submit Return Request
export const submitReturnRequest = (orderId, data) =>
  api.post(`/api/returns/${orderId}`, data);

// Get Return / Refund Status
export const getReturnRequest = (orderId) =>
  api.get(`/api/returns/${orderId}`);

// Vendor: Get all return requests
export const getVendorReturnRequests = () =>
  api.get("/api/vendor/returns");

// Vendor: Update return request status
export const updateReturnStatus = (orderId, status) =>
  api.put(`/api/returns/${orderId}/status`, { status });
