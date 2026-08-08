const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

let warehouses = [
  {
    id: createId(),
    warehouseName: 'North Ridge Fulfillment',
    warehouseCode: 'NRF-01',
    address: '4127 Timberline Park',
    city: 'Denver',
    state: 'Colorado',
    country: 'USA',
    pincode: '80216',
    capacity: '86,000 units',
    managerName: 'Riley Hart',
    managerEmail: 'riley.hart@shopstack.com',
    contactNumber: '+1 303 555 0117',
    status: 'Active',
  },
  {
    id: createId(),
    warehouseName: 'South Harbor Distribution',
    warehouseCode: 'SHD-03',
    address: '98 Marina Plaza',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    pincode: '33101',
    capacity: '104,500 units',
    managerName: 'Avery Chen',
    managerEmail: 'avery.chen@shopstack.com',
    contactNumber: '+1 305 555 0195',
    status: 'Active',
  },
  {
    id: createId(),
    warehouseName: 'Central Logistics Hub',
    warehouseCode: 'CLH-09',
    address: '2200 Commerce Blvd',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    pincode: '60601',
    capacity: '120,000 units',
    managerName: 'Jordan Patel',
    managerEmail: 'jordan.patel@shopstack.com',
    contactNumber: '+1 312 555 0148',
    status: 'Maintenance',
  },
];

export const getWarehouses = () => warehouses.slice();

export const getWarehouseById = (id) => warehouses.find((warehouse) => warehouse.id === id);

export const createWarehouse = (warehouse) => {
  const newWarehouse = {
    id: createId(),
    ...warehouse,
  };

  warehouses = [newWarehouse, ...warehouses];
  return newWarehouse;
};

export const updateWarehouse = (id, update) => {
  warehouses = warehouses.map((warehouse) =>
    warehouse.id === id ? { ...warehouse, ...update } : warehouse
  );
  return getWarehouseById(id);
};

export const deleteWarehouse = (id) => {
  warehouses = warehouses.filter((warehouse) => warehouse.id !== id);
};

export const inventoryItems = [
  {
    id: createId(),
    product: 'Pro Active Camera',
    category: 'Electronics',
    availableStock: 420,
    reserved: 40,
  },
  {
    id: createId(),
    product: 'Urban Trek Backpack',
    category: 'Apparel',
    availableStock: 82,
    reserved: 22,
  },
  {
    id: createId(),
    product: 'Kitchen Smart Scale',
    category: 'Home',
    availableStock: 18,
    reserved: 6,
  },
  {
    id: createId(),
    product: 'Luxe Noise Headphones',
    category: 'Electronics',
    availableStock: 300,
    reserved: 110,
  },
  {
    id: createId(),
    product: 'Peak Performance Jacket',
    category: 'Apparel',
    availableStock: 8,
    reserved: 5,
  },
];

export const inboundOrders = [
  {
    id: createId(),
    customer: 'Harper Mellor',
    items: 5,
    status: 'Pending',
  },
  {
    id: createId(),
    customer: 'Sofia Grant',
    items: 2,
    status: 'Pending',
  },
  {
    id: createId(),
    customer: 'Liam Carter',
    items: 9,
    status: 'Packed',
  },
  {
    id: createId(),
    customer: 'Mia Thompson',
    items: 3,
    status: 'Pending',
  },
];

export const shipments = [
  {
    id: createId(),
    orderId: createId().slice(0, 8).toUpperCase(),
    customer: 'Noah Rivera',
    courier: 'RapidX',
    status: 'Ready',
  },
  {
    id: createId(),
    orderId: createId().slice(0, 8).toUpperCase(),
    customer: 'Emma Bailey',
    courier: 'ShipPoint',
    status: 'Ready',
  },
  {
    id: createId(),
    orderId: createId().slice(0, 8).toUpperCase(),
    customer: 'Aiden Brooks',
    courier: 'FleetWave',
    status: 'Dispatched',
  },
];

export const stockMovements = [
  {
    id: createId(),
    product: 'Pro Active Camera',
    movement: 'IN',
    quantity: 120,
    warehouse: 'North Ridge Fulfillment',
    date: '2026-08-02',
    handledBy: 'Riley Hart',
  },
  {
    id: createId(),
    product: 'Luxe Noise Headphones',
    movement: 'OUT',
    quantity: 72,
    warehouse: 'Central Logistics Hub',
    date: '2026-08-03',
    handledBy: 'Jordan Patel',
  },
  {
    id: createId(),
    product: 'Urban Trek Backpack',
    movement: 'IN',
    quantity: 60,
    warehouse: 'South Harbor Distribution',
    date: '2026-08-04',
    handledBy: 'Avery Chen',
  },
  {
    id: createId(),
    product: 'Peak Performance Jacket',
    movement: 'OUT',
    quantity: 14,
    warehouse: 'South Harbor Distribution',
    date: '2026-08-04',
    handledBy: 'Avery Chen',
  },
  {
    id: createId(),
    product: 'Kitchen Smart Scale',
    movement: 'IN',
    quantity: 180,
    warehouse: 'North Ridge Fulfillment',
    date: '2026-08-01',
    handledBy: 'Riley Hart',
  },
];

export const analyticsData = {
  totalInventory: 14520,
  receivedToday: 256,
  ordersPacked: 38,
  shipmentsDispatched: 18,
  lowStockItems: 6,
  inventoryByCategory: [
    { category: 'Electronics', value: 5400 },
    { category: 'Apparel', value: 2800 },
    { category: 'Home', value: 1900 },
    { category: 'Accessories', value: 1300 },
    { category: 'Health', value: 1120 },
  ],
  shipmentStatus: [
    { name: 'Ready', value: 46 },
    { name: 'Dispatched', value: 28 },
    { name: 'Delayed', value: 8 },
  ],
  topInventory: [
    { product: 'Pro Active Camera', stock: 420, movement: 'IN' },
    { product: 'Luxe Noise Headphones', stock: 300, movement: 'OUT' },
    { product: 'Urban Trek Backpack', stock: 82, movement: 'IN' },
  ],
};
