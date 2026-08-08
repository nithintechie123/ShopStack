import api from './client';

// Get all coupons (Admin)
export const getAllCoupons = () => api.get('/api/admin/coupons');

// Get coupon analytics & stats (Admin)
export const getCouponStats = () => api.get('/api/admin/coupons/stats');

// Create a new coupon (Admin)
export const createCoupon = (data) => api.post('/api/admin/coupons', data);

// Update existing coupon (Admin)
export const updateCoupon = (id, data) => api.put(`/api/admin/coupons/${id}`, data);

// Toggle active/inactive status (Admin)
export const toggleCouponStatus = (id) => api.patch(`/api/admin/coupons/${id}/toggle`);

// Delete coupon (Admin)
export const deleteCoupon = (id) => api.delete(`/api/admin/coupons/${id}`);

// Get active coupons available for customers
export const getActiveCoupons = () => api.get('/api/coupons/active');

// Validate coupon for checkout/cart
export const validateCoupon = (code, subtotal) => {
  if (subtotal !== undefined && subtotal !== null) {
    return api.get(`/api/coupons/validate/${code}?subtotal=${subtotal}`);
  }
  return api.get(`/api/coupons/validate/${code}`);
};
