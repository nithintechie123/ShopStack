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

// Vendor: Get vendor earnings summary (Total sales, Commission deducted, Final payout)
export const getVendorEarningsSummary = () =>
  api.get('/api/vendor/earnings-summary');

// Admin: Get all platform orders
export const getAdminOrders = () =>
  api.get('/api/admin/orders');

// Admin reports
export const getAdminDashboardStats = () =>
  api.get('/api/admin/dashboard');

export const getCommissionSummary = () =>
  api.get('/api/admin/commission');

export const getVendorEarnings = () =>
  api.get('/api/admin/vendor-earnings');

// Validate Coupon Code
export const validateCoupon = (code) =>
  api.get(`/api/coupons/validate/${code}`);
