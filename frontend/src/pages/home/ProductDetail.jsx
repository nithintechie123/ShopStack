import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug, addReview } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Star,
  Package,
  Heart,
  ChevronLeft,
  Store,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Review submission
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res.data);
        const primary = res.data.images?.find((i) => i.isPrimary)?.imageUrl || res.data.images?.[0]?.imageUrl || '';
        setSelectedImage(primary);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Product not found.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);
    try {
      const res = await addReview(product.id, newRating, newComment);
      const newReviewItem = {
        ...res.data,
        user: {
          firstName: user.firstName,
          lastName: user.lastName || '',
        },
      };

      const updatedReviews = [newReviewItem, ...(product.reviews || [])];
      setProduct({ ...product, reviews: updatedReviews });
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center py-20">
        <p className="text-sm text-text-muted">Loading product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center gap-4 py-20 px-4">
        <XCircle size={48} className="text-accent-danger opacity-70" />
        <h2 className="text-xl font-bold text-text-primary">Product Not Found</h2>
        <p className="text-sm text-text-secondary">{error || 'The requested product could not be found.'}</p>
        <Link
          to="/"
          className="mt-2 bg-gradient-to-r from-accent-primary to-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md hover:from-indigo-600 hover:to-accent-primary transition-all"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const showAddToCart = !user || (user.role !== 'ADMIN' && user.role !== 'VENDOR');
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <Link to="/" className="hover:text-accent-primary flex items-center gap-1 transition-colors">
            <ChevronLeft size={14} /> Marketplace
          </Link>
          <span>/</span>
          <span className="text-text-muted">{product.category?.name || 'Category'}</span>
          <span>/</span>
          <span className="text-text-primary truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-glass/10 border border-glass-border rounded-2xl p-6 sm:p-8 backdrop-blur-md">

          {/* Left: Images */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-xl bg-bg-tertiary border border-glass-border overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <Package size={48} className="opacity-40" />
                  <span className="text-xs font-semibold">No Image Available</span>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-16 h-16 rounded-lg bg-bg-tertiary border overflow-hidden shrink-0 transition-all cursor-pointer ${selectedImage === img.imageUrl ? 'border-accent-primary ring-2 ring-accent-primary-glow' : 'border-glass-border opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img.imageUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category?.name || 'General'}
                </span>
                {product.brand && (
                  <span className="bg-bg-tertiary border border-glass-border text-text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
                {product.name}
              </h1>

              <div className="flex items-center justify-between border-b border-glass-border pb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                  <Store size={15} className="text-accent-primary" />
                  <span>Sold by:</span>
                  <span className="font-bold text-text-primary">{product.vendor?.storeName || 'Verified Vendor'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-accent-warning">
                  <Star size={14} fill={parseFloat(avgRating) > 0 ? 'currentColor' : 'none'} />
                  <span>{avgRating}</span>
                  <span className="text-[11px] font-normal text-text-muted">({product.reviews?.length || 0} reviews)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">Price</span>
                  <span className="text-3xl font-extrabold text-accent-secondary font-display">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">Availability</span>
                  {product.stockQuantity > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-secondary bg-accent-secondary/10 border border-accent-secondary/20 px-3 py-1 rounded-full mt-1">
                      <CheckCircle size={12} /> In Stock ({product.stockQuantity})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-danger bg-accent-danger/10 border border-accent-danger/20 px-3 py-1 rounded-full mt-1">
                      <XCircle size={12} /> Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="py-3 border-t border-glass-border">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {product.description || 'No description provided for this product.'}
                </p>
              </div>

              {showAddToCart && product.stockQuantity > 0 && (
                <div className="flex items-center gap-4 py-4 border-t border-glass-border flex-wrap">
                  <div className="flex items-center border border-glass-border rounded-lg bg-bg-tertiary/40 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-text-primary hover:bg-bg-tertiary rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-text-primary">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-text-primary hover:bg-bg-tertiary rounded cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      if (addToCart(product, quantity)) {
                        setAddedFeedback(true);
                        setTimeout(() => setAddedFeedback(false), 1500);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer text-center min-w-[160px]"
                  >
                    {addedFeedback ? 'Added to Cart ✓' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={async () => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      await toggleWishlist(product);
                    }}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${isLiked ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'bg-transparent border-glass-border hover:border-text-secondary text-text-primary'
                      }`}
                    title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Reviews */}
        <div className="mt-12 bg-glass/10 border border-glass-border rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Star size={18} className="text-accent-warning" />
            Customer Reviews ({product.reviews?.length || 0})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-xs text-text-muted italic py-6">No customer reviews yet.</p>
              ) : (
                product.reviews.map((r, idx) => (
                  <div key={r.id || idx} className="p-4 rounded-xl border border-glass-border bg-bg-tertiary/30 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-text-primary">
                        {r.user?.firstName} {r.user?.lastName || ''}
                      </span>
                      <div className="flex items-center gap-0.5 text-accent-warning">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} size={11} fill={s < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="p-5 border border-glass-border rounded-xl bg-bg-tertiary/40 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Write a Review</h4>
                  {reviewError && <p className="text-xs text-accent-danger font-semibold">{reviewError}</p>}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-medium">Rating:</span>
                    <div className="flex gap-1 text-accent-warning">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Star size={16} fill={star <= newRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience…"
                    className="w-full bg-bg-secondary border border-glass-border rounded-lg text-xs p-3 outline-none focus:border-accent-primary resize-none"
                    rows={3}
                    required
                  />

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="p-5 border border-glass-border rounded-xl bg-bg-tertiary/30 text-center">
                  <p className="text-xs text-text-muted">
                    Please{' '}
                    <Link to="/login" className="text-accent-primary font-bold hover:underline">
                      Sign In
                    </Link>{' '}
                    to leave a review.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
