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
} from "lucide-react";

import { getOrderById } from "../../api/orders";

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
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      orderId: id,
      reason,
      description,
      refundMethod,
      images,
    });

    navigate(`/refund/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-10">
        <div className="max-w-5xl mx-auto px-4">

          <div className="p-16 rounded-2xl border border-glass-border bg-glass/10 text-center">

            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-text-secondary">
              Loading Order...
            </p>

          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary py-10">
        <div className="max-w-5xl mx-auto px-4">

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-accent-primary font-semibold mb-8"
          >
            <ChevronLeft size={18} />
            Back to Orders
          </Link>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center">

            <AlertCircle
              className="mx-auto text-red-400 mb-4"
              size={48}
            />

            <h2 className="text-xl font-bold">
              Failed to Load Order
            </h2>

            <p className="mt-2 text-text-secondary">
              {error}
            </p>

          </div>

        </div>
      </div>
    );
  }

  if (!order) return null;

  const items = order.items || order.orderItems || [];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">

      <div className="max-w-5xl mx-auto px-4">

        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-accent-primary hover:underline mb-8"
        >
          <ChevronLeft size={18} />
          Back to Orders
        </Link>

        <div className="mb-8">

          <h1 className="gradient-text text-3xl font-extrabold flex items-center gap-3">

            <RotateCcw
              className="text-orange-400"
              size={28}
            />

            Return Request

          </h1>

          <p className="text-text-secondary mt-2">
            Submit a return request for your delivered order.
          </p>

        </div>
                {/* Order Summary */}

        <div className="bg-glass/10 border border-glass-border rounded-2xl p-6 mb-8">

          <div className="flex items-center gap-3 mb-6">

            <Package
              size={22}
              className="text-accent-primary"
            />

            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

          </div>

          <div className="grid gap-4">

            {items.length > 0 ? (
              items.map((item, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between bg-bg-secondary rounded-xl p-4 border border-glass-border"
                >

                  <div className="flex gap-4 items-center">

                    <img
                      src={
                        item.product?.image ||
                        item.product?.imageUrl ||
                        "/placeholder.png"
                      }
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-xl object-cover border"
                    />

                    <div>

                      <h3 className="font-bold text-lg">
                        {item.product?.name || "Product"}
                      </h3>

                      <p className="text-sm text-text-secondary">
                        Quantity : {item.quantity}
                      </p>

                      <p className="text-sm text-text-secondary">
                        Price :
                        ₹
                        {item.price ??
                          item.product?.price ??
                          0}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <div className="text-xs text-text-secondary">
                      Order ID
                    </div>

                    <div className="font-semibold">
                      #{order.id}
                    </div>

                    <div className="mt-3 inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">

                      {order.status}

                    </div>

                  </div>

                </div>

              ))
            ) : (

              <div className="text-center py-8 text-text-secondary">
                No products found.
              </div>

            )}

          </div>

        </div>

        {/* Return Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-glass/10 border border-glass-border rounded-2xl p-6"
        >
        <div className="space-y-6">

  {/* Return Reason */}

  <div>
    <label className="block text-sm font-semibold mb-2">
      Return Reason *
    </label>

    <select
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      required
      className="w-full rounded-xl border border-glass-border bg-bg-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary"
    >
      <option value="">Select a reason</option>
      <option value="DAMAGED">Damaged Product</option>
      <option value="WRONG_ITEM">Wrong Item Received</option>
      <option value="DEFECTIVE">Defective Product</option>
      <option value="SIZE_ISSUE">Size/Fit Issue</option>
      <option value="NOT_AS_DESCRIBED">Not as Described</option>
      <option value="OTHER">Other</option>
    </select>
  </div>

  {/* Description */}

  <div>
    <label className="block text-sm font-semibold mb-2">
      Describe the Issue *
    </label>

    <textarea
      rows={5}
      required
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Explain why you're requesting a return..."
      className="w-full rounded-xl border border-glass-border bg-bg-secondary px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
    />
  </div>

  {/* Upload Images */}

  <div>

    <label className="block text-sm font-semibold mb-2">
      Upload Images (Optional)
    </label>

    <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-glass-border py-8 hover:border-accent-primary transition">

      <Upload size={24} />

      <span>
        Click to upload images
      </span>

      <input
        type="file"
        multiple
        hidden
        accept="image/*"
        onChange={handleImageUpload}
      />

    </label>

    {images.length > 0 && (

      <div className="mt-4 space-y-2">

        {images.map((file, index) => (

          <div
            key={index}
            className="text-sm text-text-secondary"
          >
            📷 {file.name}
          </div>

        ))}

      </div>

    )}

  </div>

  {/* Refund Method */}

  <div>

    <label className="block text-sm font-semibold mb-4">
      Refund Method
    </label>

    <div className="grid md:grid-cols-2 gap-4">

      <label className="border border-glass-border rounded-xl p-4 cursor-pointer">

        <input
          type="radio"
          value="ORIGINAL"
          checked={refundMethod === "ORIGINAL"}
          onChange={(e) => setRefundMethod(e.target.value)}
          className="mr-3"
        />

        <CreditCard
          className="inline mr-2"
          size={18}
        />

        Original Payment Method

      </label>

      <label className="border border-glass-border rounded-xl p-4 cursor-pointer">

        <input
          type="radio"
          value="WALLET"
          checked={refundMethod === "WALLET"}
          onChange={(e) => setRefundMethod(e.target.value)}
          className="mr-3"
        />

        <Wallet
          className="inline mr-2"
          size={18}
        />

        Shop Wallet

      </label>

    </div>

  </div>
            {/* Submit Button */}

          <div className="pt-4 border-t border-glass-border">

            <button
              type="submit"
              disabled={!reason || !description}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Submit Return Request
            </button>

            <p className="text-xs text-text-secondary mt-3">
              Your request will be reviewed by our support team. Once approved,
              the refund will be processed to your selected refund method.
            </p>

          </div>

        </div>

      </form>

    </div>

  </div>
);
}
