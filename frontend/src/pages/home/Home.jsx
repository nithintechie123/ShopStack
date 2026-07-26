import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { searchProducts, getCategories, addReview } from '../../api/products';
import { Search, Filter, Star, Package, ShoppingBag, TrendingUp, X, Laptop, Shirt, Home as HomeIcon, BookOpen, Trophy, Sparkles, Gamepad2, Apple, HelpCircle, Heart } from 'lucide-react';

const categoryMeta = {
  electronics: {
    icon: Laptop,
    gradient: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20',
    borderColor: 'hover:border-blue-500/30',
    activeBg: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-blue-600',
  },
  fashion: {
    icon: Shirt,
    gradient: 'from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20',
    borderColor: 'hover:border-pink-500/30',
    activeBg: 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-pink-600',
  },
  'home-kitchen': {
    icon: HomeIcon,
    gradient: 'from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20',
    borderColor: 'hover:border-amber-500/30',
    activeBg: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-amber-600',
  },
  books: {
    icon: BookOpen,
    gradient: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20',
    borderColor: 'hover:border-emerald-500/30',
    activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-emerald-600',
  },
  'sports-outdoors': {
    icon: Trophy,
    gradient: 'from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20',
    borderColor: 'hover:border-violet-500/30',
    activeBg: 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-violet-600',
  },
  'beauty-care': {
    icon: Sparkles,
    gradient: 'from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20',
    borderColor: 'hover:border-rose-500/30',
    activeBg: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-rose-600',
  },
  'toys-games': {
    icon: Gamepad2,
    gradient: 'from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20',
    borderColor: 'hover:border-red-500/30',
    activeBg: 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-red-600',
  },
  groceries: {
    icon: Apple,
    gradient: 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20',
    borderColor: 'hover:border-green-500/30',
    activeBg: 'bg-green-600 text-white border-green-600 shadow-md shadow-green-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-green-600',
  },
};

const getCategoryMeta = (slug) => {
  return categoryMeta[slug] || {
    icon: HelpCircle,
    gradient: 'from-gray-500/10 to-slate-500/10 hover:from-gray-500/20 hover:to-slate-500/20',
    borderColor: 'hover:border-gray-500/30',
    activeBg: 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-500/20',
    activeIconColor: 'text-white',
    iconColor: 'text-slate-600',
  };
};

function ProductCard({ product, onSelect }) {
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  const showAddToCart = !user || (user.role !== 'ADMIN' && user.role !== 'VENDOR');
  const showWishlist = !user || (user.role !== 'ADMIN' && user.role !== 'VENDOR');
  const isLiked = isInWishlist(product.id);

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary-glow/10 cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-bg-tertiary overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Package size={40} />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-yellow-400/100 backdrop-blur-md text-text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {product.category?.name || 'Uncategorized'}
        </span>
        {showWishlist && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) {
                navigate('/login');
                return;
              }
              try {
                await toggleWishlist(product);
              } catch (err) {
                alert(err.message);
              }
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md shadow-md border ${isLiked
              ? 'bg-accent-primary border-accent-primary text-white scale-110'
              : 'bg-black/40 border-white/20 text-white hover:bg-black/60 hover:scale-105'
              }`}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col gap-2">
        <p className="text-[11px] text-accent-primary font-bold uppercase tracking-wider">{product.vendor?.storeName}</p>
        <h3 className="text-sm font-bold text-text-primary line-clamp-2 min-h-[40px]">{product.name}</h3>
        {product.brand && <p className="text-xs text-text-muted">{product.brand}</p>}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-glass-border gap-2">
          <div className="flex flex-col">
            <span className="font-display text-sm font-extrabold text-accent-secondary">₹{parseFloat(product.price).toFixed(2)}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-accent-warning mt-0.5">
              <Star size={11} fill={avgRating ? "currentColor" : "none"} className={avgRating ? "text-accent-warning" : "text-text-muted"} />
              {avgRating ? avgRating : "No ratings"}
            </span>
          </div>

          {product.stockQuantity > 0 ? (
            showAddToCart ? (
              cartQty > 0 ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center border border-accent-primary/40 rounded-lg bg-accent-primary/10 p-0.5"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(product, cartQty - 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent-primary/20 text-accent-primary font-bold text-xs cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-extrabold text-accent-primary">{cartQty}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(product, cartQty + 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent-primary/20 text-accent-primary font-bold text-xs cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    addToCart(product, 1);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/20 hover:bg-accent-primary hover:text-white text-[10px] font-bold text-accent-primary transition-all duration-300 cursor-pointer"
                >
                  Add to Cart
                </button>
              )
            ) : (
              <span className="text-[10px] font-bold text-accent-secondary">In Stock</span>
            )
          ) : (
            <span className="text-[10px] font-bold text-accent-danger">Out of Stock</span>
          )}
        </div>
        {product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <p className="text-[11px] text-accent-warning font-semibold mt-1">Only {product.stockQuantity} left!</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const showAddToCart = !user || (user.role !== 'ADMIN' && user.role !== 'VENDOR');
  const showWishlist = !user || (user.role !== 'ADMIN' && user.role !== 'VENDOR');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Review Submission State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setModalQty(1);
      setAddedFeedback(false);
    }
  }, [selectedProduct]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await searchProducts(params);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => { });
    fetchProducts();
  }, [fetchProducts]);

  // Review Form Submit Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);
    try {
      const res = await addReview(selectedProduct.id, newRating, newComment);

      // Update selected product reviews locally
      const updatedReview = {
        ...res.data,
        user: {
          firstName: user.firstName,
          lastName: user.lastName || ''
        }
      };

      const updatedReviews = [updatedReview, ...(selectedProduct.reviews || [])];
      const updatedProduct = {
        ...selectedProduct,
        reviews: updatedReviews
      };

      setSelectedProduct(updatedProduct);

      // Update main products array state
      setProducts((prev) =>
        prev.map((p) => p.id === selectedProduct.id ? updatedProduct : p)
      );

      // Reset review form
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-6">
            <TrendingUp size={12} /> Multi-Vendor Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
            Discover Products from<br />
            <span className="gradient-text">Thousands of Vendors</span>
          </h1>
          <p className="text-base text-text-secondary max-w-xl mx-auto mb-10">Shop the world&apos;s best vendors in one enterprise marketplace platform</p>

          <div className="flex justify-center">
            <div className="flex items-center bg-bg-secondary border border-glass-border rounded-full p-1.5 pl-5 w-full max-w-2xl backdrop-blur-xl shadow-lg focus-within:border-accent-primary focus-within:ring-4 focus-within:ring-accent-primary-glow transition-all duration-300">
              <Search size={18} className="text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands, categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm px-3.5 placeholder-text-muted"
              />
              <button
                className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-accent-primary/15 transition-all duration-300 cursor-pointer"
                onClick={fetchProducts}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider">Shop by Category</h2>
            <p className="text-xs text-text-muted mt-1 font-medium">Explore curated collections from verified vendors</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const meta = getCategoryMeta(category.slug);
              const IconComponent = meta.icon;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    const newCategory = isSelected ? '' : category.id;
                    setSelectedCategory(newCategory);
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer text-center h-28 relative overflow-hidden ${isSelected
                    ? meta.activeBg
                    : `bg-glass/10 border-glass-border ${meta.gradient} ${meta.borderColor} hover:shadow-lg hover:-translate-y-1`
                    }`}
                >
                  {/* Decorative background shape */}
                  <span className={`absolute -right-3 -bottom-3 w-10 h-10 rounded-full opacity-[0.04] transition-transform duration-500 group-hover:scale-150 ${isSelected ? 'bg-white' : 'bg-current'}`} />

                  <IconComponent
                    size={24}
                    className={`mb-2.5 transition-transform duration-300 group-hover:scale-110 ${isSelected ? meta.activeIconColor : meta.iconColor
                      }`}
                  />
                  <span className="text-[11px] font-bold tracking-tight leading-snug line-clamp-2">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters section */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col md:flex-row md:items-end justify-between gap-5">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary uppercase tracking-wider shrink-0 pb-1.5 md:pb-3">
            <Filter size={15} /> Filters
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row md:items-center gap-4 flex-1 w-full">
            {/* Category dropdown */}
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
              <select
                className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3.5 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Price Range</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary placeholder-text-muted"
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min={0}
                />
                <span className="text-text-muted text-xs">—</span>
                <input
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg text-text-primary text-sm px-3 py-2.5 outline-none transition-colors duration-300 focus:border-accent-primary placeholder-text-muted"
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              className="flex-1 md:flex-initial bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold px-5 py-3 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
              onClick={fetchProducts}
            >
              Apply Filters
            </button>
            <button
              className="flex-1 md:flex-initial bg-transparent hover:bg-bg-tertiary border border-glass-border hover:border-text-secondary text-text-primary text-xs font-bold px-5 py-3 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => {
                setQuery(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice('');
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Products grid */}
        <main className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              {query ? `Results for "${query}"` : 'All Products'}
              <span className="ml-3 text-[11px] font-bold text-text-muted bg-bg-tertiary px-3 py-1 rounded-full">{products.length} items</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-xl border border-glass-border bg-glass/10 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
              <ShoppingBag size={48} className="text-text-muted opacity-50" />
              <h3 className="text-base font-bold text-text-secondary">No products found</h3>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
              ))}
            </div>
          )}
        </main>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-bg-secondary border border-glass-border rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl text-text-primary grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Left Column: Product Image */}
            <div className="relative bg-bg-tertiary aspect-[4/3] md:aspect-auto flex items-center justify-center p-8 overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/10 to-accent-secondary/5 blur-[50px] pointer-events-none" />

              {selectedProduct.images?.find((i) => i.isPrimary)?.imageUrl || selectedProduct.images?.[0]?.imageUrl ? (
                <img
                  src={selectedProduct.images?.find((i) => i.isPrimary)?.imageUrl || selectedProduct.images?.[0]?.imageUrl}
                  alt={selectedProduct.name}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300 z-10"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2 z-10">
                  <Package size={64} className="opacity-30" />
                  <span className="text-xs font-semibold uppercase tracking-wider">No Image Available</span>
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="p-8 sm:p-10 flex flex-col justify-between max-h-[90vh] md:max-h-[600px] overflow-y-auto">
              <div>
                {/* Category & Vendor Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-accent-primary/15 text-accent-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedProduct.category?.name || 'Uncategorized'}
                  </span>
                  {selectedProduct.brand && (
                    <span className="bg-bg-tertiary text-text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedProduct.brand}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h2 className="text-2xl font-extrabold text-text-primary tracking-tight leading-tight mb-2 font-display">
                  {selectedProduct.name}
                </h2>

                {/* Vendor Store Info */}
                <p className="text-xs text-text-secondary font-medium mb-4 flex items-center gap-1">
                  Sold by:{' '}
                  <span className="text-accent-primary font-bold">
                    {selectedProduct.vendor?.storeName || 'Verified Merchant'}
                  </span>
                </p>

                {/* Rating & reviews header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-0.5 text-accent-warning">
                    {[...Array(5)].map((_, i) => {
                      const avg = selectedProduct.reviews?.length
                        ? selectedProduct.reviews.reduce((s, r) => s + r.rating, 0) / selectedProduct.reviews.length
                        : 0;
                      return (
                        <Star
                          key={i}
                          size={15}
                          fill={i < Math.round(avg) ? "currentColor" : "none"}
                          className={i < Math.round(avg) ? "text-accent-warning" : "text-text-muted"}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    {selectedProduct.reviews?.length
                      ? (selectedProduct.reviews.reduce((s, r) => s + r.rating, 0) / selectedProduct.reviews.length).toFixed(1)
                      : '0.0'}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({selectedProduct.reviews?.length || 0} reviews)
                  </span>
                </div>

                <div className="h-px bg-glass-border mb-6" />

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-text-secondary leading-relaxed max-h-32 overflow-y-auto pr-2">
                    {selectedProduct.description || 'No description provided by the vendor.'}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-glass-border flex items-center justify-between gap-4 mt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Price</span>
                    <span className="font-display text-2xl font-extrabold text-accent-secondary">
                      ₹{parseFloat(selectedProduct.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Stock Status</span>
                    {selectedProduct.stockQuantity > 0 ? (
                      <span className="bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        In Stock ({selectedProduct.stockQuantity})
                      </span>
                    ) : (
                      <span className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Selector & Add to Cart */}
                {showAddToCart && selectedProduct.stockQuantity > 0 && (
                  <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-glass-border">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Quantity</span>
                        <div className="flex items-center border border-glass-border rounded-lg bg-bg-tertiary/30 p-1">
                          <button
                            type="button"
                            onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-tertiary text-text-primary font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={selectedProduct.stockQuantity}
                            value={modalQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                setModalQty(Math.min(selectedProduct.stockQuantity, Math.max(1, val)));
                              }
                            }}
                            className="w-12 text-center bg-transparent border-none outline-none text-xs font-bold text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setModalQty(Math.min(selectedProduct.stockQuantity, modalQty + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-tertiary text-text-primary font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          if (addToCart(selectedProduct, modalQty)) {
                            setAddedFeedback(true);
                            setTimeout(() => setAddedFeedback(false), 1500);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs font-bold py-3 rounded-lg shadow-md shadow-accent-primary/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer mt-4"
                      >
                        {addedFeedback ? 'Added to Cart ✓' : 'Add to Cart'}
                      </button>
                    </div>

                    {showWishlist && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          try {
                            await toggleWishlist(selectedProduct);
                          } catch (err) {
                            alert(err.message);
                          }
                        }}
                        className={`w-12 h-11 flex items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer ${isInWishlist(selectedProduct.id)
                          ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                          : 'bg-transparent border-glass-border hover:border-text-secondary text-text-primary'
                          }`}
                        title={isInWishlist(selectedProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart size={18} fill={isInWishlist(selectedProduct.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                )}

                {/* Reviews List */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Customer Reviews</h4>
                  <div className="flex flex-col gap-3.5 max-h-40 overflow-y-auto pr-2">
                    {!selectedProduct.reviews?.length ? (
                      <p className="text-xs text-text-muted italic py-2">No reviews yet for this product.</p>
                    ) : (
                      selectedProduct.reviews.map((r, idx) => (
                        <div key={r.id || idx} className="p-3 bg-bg-tertiary/40 border border-glass-border rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-xs text-text-primary">
                              {r.user?.firstName} {r.user?.lastName || ''}
                            </span>
                            <div className="flex items-center gap-0.5 text-accent-warning">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star
                                  key={starIdx}
                                  size={10}
                                  fill={starIdx < r.rating ? "currentColor" : "none"}
                                  className={starIdx < r.rating ? "text-accent-warning" : "text-text-muted"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submit Review Form */}
                <div className="mt-6 pt-4 border-t border-glass-border">
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="p-4 border border-glass-border rounded-2xl bg-bg-tertiary/20 flex flex-col gap-3">
                      <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider">Write a Review</h5>
                      {reviewError && (
                        <p className="text-xs text-accent-danger font-medium">{reviewError}</p>
                      )}

                      {/* Interactive Star Picker */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-secondary font-medium">Rating:</span>
                        <div className="flex gap-1 text-accent-warning">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                              onClick={() => setNewRating(star)}
                            >
                              <Star
                                size={18}
                                fill={star <= newRating ? "currentColor" : "none"}
                                className={star <= newRating ? "text-accent-warning" : "text-text-muted"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs p-2.5 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary-glow transition-all duration-300 resize-none"
                        rows={2}
                        required
                      />

                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="w-full py-2 rounded-md bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-text-muted italic text-center py-2">
                      Please{' '}
                      <Link to="/login" className="text-accent-primary hover:text-indigo-600 font-semibold transition-colors">
                        Sign In
                      </Link>{' '}
                      to rate and review this product.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
