import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  AlertCircle,
  Upload,
  RotateCcw,
  CreditCard,
  Wallet,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

import {
  getOrderById,
  submitReturnRequest,
} from "../../api/orders";

export default function ReturnRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getOrderById(id)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            "Unable to load order details."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitReturnRequest(id, {
        reason,
        description,
        refundMethod,
      });

      alert("Return request submitted successfully!");
      navigate(`/refund/${id}`);
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to submit return request."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-10 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="p-10 rounded-2xl border border-glass-border bg-glass/5 backdrop-blur-xl text-center shadow-xl">
            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-text-secondary">
              Retrieving order information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary py-10 flex items-center justify-center">
        <div className="max-w-lg w-full px-4">
          <div className="p-8 rounded-2xl border border-accent-danger/20 bg-accent-danger/5 backdrop-blur-xl text-center shadow-xl">
            <AlertCircle className="mx-auto text-accent-danger mb-4" size={48} />
            <h2 className="text-xl font-bold text-text-primary">Failed to Load Order</h2>
            <p className="mt-2 text-xs text-text-secondary">{error}</p>
            <div className="mt-6">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-glass-border text-xs font-bold text-text-primary hover:bg-glass/10 transition-all"
              >
                <ChevronLeft size={16} /> Back to My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const items = order.items || order.orderItems || [];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Navigation & Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:underline mb-3"
            >
              <ChevronLeft size={14} /> Back to My Orders
            </Link>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <RotateCcw className="text-orange-500" size={28} />
              <span>Return Request</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 font-medium">
              Submit a return request for your delivered order items.
            </p>
          </div>
          <div className="flex flex-col items-end text-xs bg-bg-tertiary/40 border border-glass-border p-3.5 rounded-xl max-w-[200px] w-full">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Order Reference</span>
            <span className="font-mono font-bold text-text-primary mt-0.5 truncate max-w-full">#{order.id}</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Order Items Summary */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-glass/10 border border-glass-border rounded-2xl p-5 backdrop-blur-md">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-glass-border pb-3 mb-4">
                <Package size={16} className="text-accent-primary" />
                <span>Order Summary</span>
              </h2>

              <div className="flex flex-col gap-4">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-bg-secondary/40 border border-glass-border/40 rounded-xl text-xs"
                    >
                      <div className="w-14 h-14 rounded-lg bg-bg-tertiary overflow-hidden border border-glass-border/50 shrink-0 flex items-center justify-center">
                        <img
                          src={
                            item.product?.image ||
                            item.product?.imageUrl ||
                            item.product?.images?.[0]?.imageUrl ||
                            "/placeholder.png"
                          }
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-text-primary truncate" title={item.product?.name}>
                          {item.product?.name || "Marketplace Product"}
                        </h3>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {item.product?.brand ? `${item.product.brand} • ` : ""}Qty {item.quantity}
                        </p>
                        <p className="font-bold text-accent-secondary mt-1 text-[11px]">
                          ₹{(item.price ?? item.product?.price ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-text-muted text-xs">
                    No items in this order.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Return Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-glass/10 border border-glass-border rounded-2xl p-6 sm:p-8 backdrop-blur-md flex flex-col gap-6"
            >
              {/* Return Reason Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-accent-primary" />
                  <span>Return Reason *</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-glass-border bg-bg-tertiary text-sm text-text-primary px-4 py-3 outline-none focus:border-accent-primary transition-colors cursor-pointer"
                >
                  <option value="">Select a reason</option>
                  <option value="DAMAGED">Damaged Product</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="DEFECTIVE">Defective Product</option>
                  <option value="SIZE_ISSUE">Size / Fit Issue</option>
                  <option value="NOT_AS_DESCRIBED">Not as Described</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Describe the Issue *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us why you are returning this product so we can expedite your refund..."
                  className="w-full rounded-xl border border-glass-border bg-glass/5 text-sm text-text-primary px-4 py-3 focus:outline-none focus:border-accent-primary transition-colors resize-none"
                />
              </div>

              {/* Dynamic Image Upload Zone */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Upload Product Images (Optional)
                </label>
                <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-glass-border hover:border-accent-primary hover:bg-accent-primary/5 py-6 transition duration-300 cursor-pointer">
                  <Upload size={22} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    Click or drag images to upload
                  </span>
                  <input
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-glass-border bg-bg-tertiary">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent-danger hover:bg-accent-danger/90 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Refund Method Selector Cards */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent-secondary animate-pulse" />
                  <span>Refund Method</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original Payment */}
                  <label
                    onClick={() => setRefundMethod("ORIGINAL")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      refundMethod === "ORIGINAL"
                        ? "bg-accent-primary/10 border-accent-primary shadow-lg shadow-accent-primary/5 scale-[1.01]"
                        : "bg-bg-secondary/40 border-glass-border hover:border-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        refundMethod === "ORIGINAL" ? "bg-accent-primary text-white" : "bg-bg-tertiary text-text-secondary"
                      }`}>
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-text-primary block">Original Method</span>
                        <span className="text-[10px] text-text-muted">Return to original card/UPI</span>
                      </div>
                    </div>
                    {refundMethod === "ORIGINAL" && (
                      <CheckCircle2 size={16} className="text-accent-primary shrink-0" />
                    )}
                  </label>

                  {/* Shop Wallet */}
                  <label
                    onClick={() => setRefundMethod("WALLET")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      refundMethod === "WALLET"
                        ? "bg-accent-primary/10 border-accent-primary shadow-lg shadow-accent-primary/5 scale-[1.01]"
                        : "bg-bg-secondary/40 border-glass-border hover:border-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        refundMethod === "WALLET" ? "bg-accent-primary text-white" : "bg-bg-tertiary text-text-secondary"
                      }`}>
                        <Wallet size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-text-primary block">Shop Wallet</span>
                        <span className="text-[10px] text-text-muted">Instant credit to user wallet</span>
                      </div>
                    </div>
                    {refundMethod === "WALLET" && (
                      <CheckCircle2 size={16} className="text-accent-primary shrink-0" />
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-glass-border flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={!reason || !description}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/15 hover:shadow-lg hover:shadow-accent-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Submit Return Request
                </button>
                <p className="text-[10px] text-text-muted leading-relaxed text-center">
                  Your return request will be evaluated by our merchant team. Once confirmed, the refund will be released directly to your chosen refund method.
                </p>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
