import api from './client';

// Warehouse Management (Admin / Staff)
export const getWarehouses = () =>
  api.get('/api/warehouse');

export const getWarehouseById = (id) =>
  api.get(`/api/warehouse/${id}`);

export const createWarehouse = (data) =>
  api.post('/api/warehouse', data);

export const updateWarehouse = (id, data) =>
  api.put(`/api/warehouse/${id}`, data);

export const deleteWarehouse = (id) =>
  api.delete(`/api/warehouse/${id}`);

// Warehouse Inventory (Staff)
export const getWarehouseInventory = () =>
  api.get('/api/warehouse/inventory');

export const addWarehouseInventory = (data) =>
  api.post('/api/warehouse/inventory', data);

export const updateWarehouseInventory = (id, data) =>
  api.put(`/api/warehouse/inventory/${id}`, data);

export const deleteWarehouseInventory = (id) =>
  api.delete(`/api/warehouse/inventory/${id}`);

// Warehouse Fulfillment (Staff)
export const getWarehouseOrders = () =>
  api.get('/api/warehouse/orders');

export const pickOrder = (orderId) =>
  api.put(`/api/warehouse/orders/${orderId}/pick`);

export const packOrder = (orderId) =>
  api.put(`/api/warehouse/orders/${orderId}/pack`);

export const readyForShipment = (orderId) =>
  api.put(`/api/warehouse/orders/${orderId}/ready`);

// Warehouse Stock Movements (Staff)
export const getStockMovements = () =>
  api.get('/api/warehouse/stock-movement');

export const createStockMovement = (data) =>
  api.post('/api/warehouse/stock-movement', data);

// Warehouse Analytics (Staff)
export const getWarehouseAnalytics = () =>
  api.get('/api/warehouse/analytics');

// Shipments (Staff / Admin)
export const getShipments = () =>
  api.get('/api/shipment');

export const createShipment = (data) =>
  api.post('/api/shipment', data);

export const updateShipmentStatus = (shipmentId, status) =>
  api.put(`/api/shipment/${shipmentId}/status`, { shipmentStatus: status });
