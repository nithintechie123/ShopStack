import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProtectedRoute, RoleRoute } from './components/guards/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/home/Home';
import ProductDetail from './pages/home/ProductDetail'; 
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import Reports from './pages/admin/Reports';
import RevenueReport from './pages/admin/RevenueReport';
import SalesReport from './pages/admin/SalesReport';
import VendorPerformanceReport from './pages/admin/VendorPerformanceReport';
import CategoryAnalyticsReport from './pages/admin/CategoryAnalyticsReport';
import WarehouseList from './pages/admin/WarehouseList';
import WarehouseCreate from './pages/admin/WarehouseCreate';
import WarehouseEdit from './pages/admin/WarehouseEdit';
import WarehouseLayout from './pages/warehouse/WarehouseLayout';
import WarehouseLogin from './pages/warehouse/WarehouseLogin';
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import WarehouseInventory from './pages/warehouse/WarehouseInventory';
import WarehouseReceive from './pages/warehouse/WarehouseReceive';
import WarehousePickPack from './pages/warehouse/WarehousePickPack';
import WarehouseShipment from './pages/warehouse/WarehouseShipment';
import WarehouseStockMovement from './pages/warehouse/WarehouseStockMovement';
import WarehouseAnalytics from './pages/warehouse/WarehouseAnalytics';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Profile from './pages/customer/Profile';
import Orders from './pages/customer/Orders';
import OrderTrackPage from './pages/customer/OrderTrackPage';
import Wishlist from './pages/customer/Wishlist';
import Checkout from './pages/customer/Checkout';
import Cart from './pages/customer/Cart';
import { Unauthorized, NotFound } from './pages/misc/Fallback';
import './index.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
              <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />

              {/* Vendor Routes */}
              <Route element={<RoleRoute role="VENDOR" />}>
                <Route path="/vendor" element={<Layout><VendorDashboard /></Layout>} />
                <Route path="/vendor/profile" element={<Layout><VendorProfile /></Layout>} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute role="ADMIN" />}>
                <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
                <Route path="/admin/profile" element={<Layout><AdminProfile /></Layout>} />
                <Route path="/admin/reports" element={<Layout><Reports /></Layout>} />
                <Route path="/admin/reports/revenue" element={<Layout><RevenueReport /></Layout>} />
                <Route path="/admin/reports/sales" element={<Layout><SalesReport /></Layout>} />
                <Route path="/admin/reports/vendor" element={<Layout><VendorPerformanceReport /></Layout>} />
                <Route path="/admin/reports/category" element={<Layout><CategoryAnalyticsReport /></Layout>} />
                <Route path="/admin/warehouses" element={<Layout><WarehouseList /></Layout>} />
                <Route path="/admin/create-warehouse" element={<Layout><WarehouseCreate /></Layout>} />
                <Route path="/admin/edit-warehouse/:id" element={<Layout><WarehouseEdit /></Layout>} />
              </Route>

              <Route path="/warehouse/login" element={<Layout><WarehouseLogin /></Layout>} />
              <Route path="/warehouse" element={<WarehouseLayout />}>
                <Route path="dashboard" element={<WarehouseDashboard />} />
                <Route path="inventory" element={<WarehouseInventory />} />
                <Route path="receive" element={<WarehouseReceive />} />
                <Route path="pick-pack" element={<WarehousePickPack />} />
                <Route path="shipment" element={<WarehouseShipment />} />
                <Route path="stock-movement" element={<WarehouseStockMovement />} />
                <Route path="analytics" element={<WarehouseAnalytics />} />
              </Route>

              {/* Authenticated Customer Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout><CustomerDashboard /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/orders" element={<Layout><Orders /></Layout>} />
                <Route path="/orders/:id/track" element={<Layout><OrderTrackPage /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              </Route>

              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}