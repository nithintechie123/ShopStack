import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
  ChevronDown,
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems, removeFromCart, cartCount, cartSubtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  const avatar = user?.profilePictureUrl;

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for click outside
  const dropdownRef = useRef(null);
  const cartRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'VENDOR': return '/vendor';
      case 'WAREHOUSE_STAFF': return '/warehouse/dashboard';
      default: return '/dashboard';
    }
  };

  // Close all dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle mobile menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo & Main Nav Links */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-text-primary shrink-0">
              <ShoppingBag size={22} className="text-accent-primary" />
              <span className="gradient-text">ShopStack</span>
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
              <Link
                to="/"
                className="text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300"
              >
                Marketplace
              </Link>

              {user && getDashboardLink() && (
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-1.5 text-text-secondary text-sm font-medium px-3 py-2 rounded-md hover:text-text-primary hover:bg-bg-tertiary transition-all duration-300"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar (Center/Desktop) */}
          {!isAuthPage && (
            <div className="hidden sm:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search products, brands, or stores..."
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 pl-9 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow focus:bg-bg-secondary"
                />
              </div>
            </div>
          )}

          {/* Right side actions: Cart, Wishlist, Theme & Profile */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-accent-primary transition-all duration-300 cursor-pointer select-none"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400 rotate-0 transition-transform duration-500 hover:rotate-45" />
              ) : (
                <Moon size={18} className="text-accent-primary -rotate-12 transition-transform duration-500 hover:rotate-0" />
              )}
            </button>

            {/* Shopping Cart Button & Dropdown */}
            {user && user.role === 'CUSTOMER' && (
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => {
                    setCartOpen(!cartOpen);
                    setDropdownOpen(false);
                    navigate("/cart")
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-accent-primary transition-all duration-300 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                      {cartCount}
                    </span>
                  )}
                </button> 
              </div>
            )}

            {/* Wishlist Button */}
            {user && user.role === 'CUSTOMER' && (
              <Link
                to="/wishlist"
                className="relative flex items-center justify-center w-10 h-10 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-accent-primary transition-all duration-300 cursor-pointer"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setCartOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-primary text-sm font-medium hover:border-accent-primary transition-all duration-300 select-none cursor-pointer"
                >
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-glass-border shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-bold text-xs text-white shrink-0">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-glass-border bg-bg-secondary shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-glass-border flex items-center gap-3">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-glass-border shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-bold text-xs text-white shrink-0">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-sm text-text-primary truncate">{user.firstName} {user.lastName}</span>
                        <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">{user.role}</span>
                      </div>
                    </div>
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {user.role === 'CUSTOMER' && (
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Profile
                      </Link>
                    )}
                    {user.role === 'VENDOR' && (
                      <Link to="/vendor/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Store Profile
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link to="/admin/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Manage Vendors
                      </Link>
                    )}
                    <div className="h-px bg-glass-border my-1" />
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-accent-danger hover:bg-bg-tertiary transition-colors cursor-pointer text-left"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-text-primary hover:bg-bg-tertiary px-3.5 py-2 rounded-md text-sm font-semibold transition-colors duration-300">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/30 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-md border border-glass-border bg-glass backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-accent-primary transition-all duration-300 cursor-pointer select-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-glass-border bg-bg-secondary px-4 pt-2 pb-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Search bar for small screens */}
          {!isAuthPage && (
            <div className="block sm:hidden pt-2">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search products, brands, or stores..."
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-xs px-3 py-2 pl-9 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow focus:bg-bg-secondary"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              className="text-text-secondary text-sm font-medium px-3 py-2.5 rounded-lg hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>

            {user && getDashboardLink() && (
              <Link
                to={getDashboardLink()}
                className="text-text-secondary text-sm font-medium px-3 py-2.5 rounded-lg hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-glass-border/50 flex flex-col gap-1">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Account Menu
                </div>
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <Package size={15} /> My Orders
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                  </>
                )}
                {user.role === 'VENDOR' && (
                  <Link to="/vendor/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <User size={15} /> Store Profile
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <User size={15} /> Manage Vendors
                  </Link>
                )}
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent-danger hover:bg-bg-tertiary transition-colors cursor-pointer text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-glass-border/50">
                <Link 
                  to="/login" 
                  className="text-text-primary hover:bg-bg-tertiary px-3.5 py-2.5 rounded-lg text-sm font-semibold text-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-accent-primary to-indigo-600 text-white text-center shadow-lg shadow-accent-primary/20 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
