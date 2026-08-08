import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Package, CheckCircle, Clock, Circle } from "lucide-react";
import { getOrderById, getReturnRequest,} from "../../api/orders";

function RefundStatus() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    Promise.all([
    getOrderById(id),
    getReturnRequest(id),
])
.then(([orderRes, returnRes]) => {
    setOrder(orderRes.data);
    setReturnRequest(returnRes.data);
})
    .catch((err) => {
      setError(
        err.response?.data?.error ||
        "Unable to load order details."
      );
    })
    .finally(() => setLoading(false));
}, [id]);

const items = order?.items || order?.orderItems || [];
if (loading) {
  return (
    <div className="min-h-screen bg-bg-primary py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="p-16 rounded-2xl border border-glass-border bg-glass/10 text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Refund Details...</p>
        </div>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-bg-primary py-10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}

if (!order) return null;

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
        <h1 className="gradient-text text-3xl font-extrabold">
          Refund Status
        </h1>

        <p className="text-text-secondary mt-2">
           Track the progress of your refund request.
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
                Price : ₹
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
  {/* Refund Information */}

<div className="bg-glass/10 border border-glass-border rounded-2xl p-6 mb-8">

  <h2 className="text-xl font-bold mb-6">
    Refund Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-text-secondary text-sm">
        Refund Method
      </p>
      <p className="font-semibold mt-1">
        Original Payment Method
      </p>
    </div>

    <div>
      <p className="text-text-secondary text-sm">
        Refund Amount
      </p>
      <p className="font-semibold mt-1">
        ₹{order.finalAmount ?? order.totalAmount ?? order.total ?? 0}
      </p>
    </div>

    <div>
      <p className="text-text-secondary text-sm">
        Current Status
      </p>

      <span className="inline-flex mt-2 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400">
        {returnRequest?.status || "PENDING"}
      </span>
    </div>

    <div>
      <p className="text-text-secondary text-sm">
        Estimated Refund
      </p>
      <p className="font-semibold mt-1">
        2–3 Business Days
      </p>
    </div>

  </div>

</div>
{/* Refund Timeline */}

<div className="bg-glass/10 border border-glass-border rounded-2xl p-6">

  <h2 className="text-xl font-bold mb-6">
    Refund Timeline
  </h2>

  <div className="space-y-6">

  <div className="flex items-start gap-4">
    <CheckCircle className="text-green-500 mt-1" size={22} />
    <div>
      <p className="font-semibold">Return Request Submitted</p>
      <p className="text-sm text-text-secondary">
        Your return request has been received.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-4">
    <Clock className="text-yellow-500 mt-1" size={22} />
    <div>
      <p className="font-semibold">Under Review</p>
      <p className="text-sm text-text-secondary">
        Our support team is reviewing your request.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-4 opacity-50">
    <Circle size={22} />
    <div>
      <p className="font-semibold">Refund Approved</p>
    </div>
  </div>

  <div className="flex items-start gap-4 opacity-50">
    <Circle size={22} />
    <div>
      <p className="font-semibold">Refund Processed</p>
    </div>
  </div>

  <div className="flex items-start gap-4 opacity-50">
    <Circle size={22} />
    <div>
      <p className="font-semibold">Amount Credited</p>
    </div>
  </div>

</div>

</div>

    </div>
    </div>
    
  );
}

export default RefundStatus;