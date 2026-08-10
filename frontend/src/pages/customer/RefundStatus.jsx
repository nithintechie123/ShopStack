import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Package, 
  CheckCircle, 
  Clock, 
  Circle,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
  XCircle,
  ShieldCheck
} from "lucide-react";
import { getOrderById, getReturnRequest } from "../../api/orders";

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return dateTimeString;
  }
};

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
      <div className="min-h-screen bg-bg-primary py-10 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="p-10 rounded-2xl border border-glass-border bg-glass/5 backdrop-blur-xl text-center shadow-xl">
            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-text-secondary">Retrieving refund tracking details...</p>
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
            <h2 className="text-xl font-bold text-text-primary">Failed to Load Refund Request</h2>
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

  // Process timeline state
  const reqStatus = (returnRequest?.status || "PENDING").toUpperCase();
  const isApproved = reqStatus === "APPROVED" || reqStatus === "COMPLETED" || reqStatus === "SUCCESS" || reqStatus === "REFUND_PROCESSED";
  const isCompleted = reqStatus === "COMPLETED" || reqStatus === "SUCCESS" || reqStatus === "REFUND_PROCESSED";
  const isRejected = reqStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

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
              <TrendingUp className="text-accent-primary" size={28} />
              <span>Refund Status</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 font-medium">
              Real-time monitoring of your refund request and validation.
            </p>
          </div>
          <div className="flex flex-col items-end text-xs bg-bg-tertiary/40 border border-glass-border p-3.5 rounded-xl max-w-[200px] w-full">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Refund Reference</span>
            <span className="font-mono font-bold text-text-primary mt-0.5 truncate max-w-full">#{returnRequest?.id || order.id}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Order details & Refund specs */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Order summary */}
            <div className="bg-glass/10 border border-glass-border rounded-2xl p-5 backdrop-blur-md">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-glass-border pb-3 mb-4">
                <Package size={16} className="text-accent-primary" />
                <span>Order Summary</span>
              </h2>

              <div className="flex flex-col gap-4">
                {items.map((item, index) => (
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
                        Qty {item.quantity} • ₹{(item.price ?? item.product?.price ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Info summary card */}
            <div className="bg-glass/10 border border-glass-border rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-glass-border pb-3">
                <ShieldCheck size={16} className="text-accent-secondary" />
                <span>Refund Details</span>
              </h2>

              <div className="flex flex-col gap-3 text-xs leading-relaxed">
                <div className="flex justify-between py-1 border-b border-glass-border/30">
                  <span className="text-text-secondary font-medium">Refund Target</span>
                  <span className="font-bold text-text-primary flex items-center gap-1">
                    {returnRequest?.refundMethod === "WALLET" ? (
                      <>
                        <Wallet size={12} className="text-accent-primary" /> Shop Wallet
                      </>
                    ) : (
                      <>
                        <CreditCard size={12} className="text-accent-primary" /> Card / UPI
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-glass-border/30">
                  <span className="text-text-secondary font-medium">Refund Amount</span>
                  <span className="font-extrabold text-accent-secondary text-sm">
                    ₹{(order.finalAmount ?? order.totalAmount ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-glass-border/30">
                  <span className="text-text-secondary font-medium">Review Decision</span>
                  <span className={`inline-flex font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full border ${
                    isRejected
                      ? "bg-accent-danger/10 border-accent-danger/25 text-accent-danger"
                      : isApproved
                      ? "bg-accent-secondary/10 border-accent-secondary/25 text-accent-secondary"
                      : "bg-accent-warning/10 border-accent-warning/25 text-accent-warning"
                  }`}>
                    {reqStatus}
                  </span>
                </div>
                {returnRequest?.requestDate && (
                  <div className="flex justify-between py-1 border-b border-glass-border/30">
                    <span className="text-text-secondary font-medium">Requested On</span>
                    <span className="font-semibold text-text-primary font-mono">
                      {formatDateTime(returnRequest.requestDate)}
                    </span>
                  </div>
                )}
                {returnRequest?.updatedAt && (
                  <div className="flex justify-between py-1 border-b border-glass-border/30">
                    <span className="text-text-secondary font-medium">Last Updated</span>
                    <span className="font-semibold text-text-primary font-mono">
                      {formatDateTime(returnRequest.updatedAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-text-secondary font-medium">Est. Processing</span>
                  <span className="font-semibold text-text-primary">
                    {isCompleted ? "Completed" : "2–3 Business Days"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Refund Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-glass/10 border border-glass-border rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <h2 className="text-base font-bold text-text-primary border-b border-glass-border pb-4 mb-6">
                Refund Processing Progress
              </h2>

              <div className="relative pl-8 border-l border-glass-border/60 flex flex-col gap-8">
                
                {/* Step 1: Return Request Submitted */}
                <div className="relative">
                  <div className="absolute left-[-41px] top-0 w-6 h-6 rounded-full bg-accent-secondary border-2 border-bg-primary text-white flex items-center justify-center shadow-lg shadow-accent-secondary/20">
                    <CheckCircle2 size={12} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Return Request Submitted</h3>
                    <p className="text-xs text-text-secondary mt-0.5 font-medium">
                      Your return request has been submitted and registered successfully in our system.
                    </p>
                    {returnRequest?.requestDate && (
                      <span className="text-[10px] text-text-muted mt-1 block font-mono">
                        {formatDateTime(returnRequest.requestDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="relative">
                  <div className={`absolute left-[-41px] top-0 w-6 h-6 rounded-full border-2 border-bg-primary flex items-center justify-center shadow-lg ${
                    isRejected
                      ? "bg-accent-danger text-white shadow-accent-danger/20"
                      : isApproved
                      ? "bg-accent-secondary text-white shadow-accent-secondary/20"
                      : "bg-accent-warning text-white shadow-accent-warning/20 animate-pulse"
                  }`}>
                    {isRejected ? <XCircle size={12} /> : isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">
                      {isRejected ? "Request Rejected" : "Review Process"}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 font-medium">
                      {isRejected
                        ? `The merchant rejected the return: ${returnRequest?.rejectionReason || "Reason not provided."}`
                        : isApproved
                        ? "Merchant verified the request details and approved the return."
                        : "Merchant operations team is evaluating the return reason and description details."}
                    </p>
                    {returnRequest?.updatedAt && (isApproved || isRejected) && (
                      <span className="text-[10px] text-text-muted mt-1 block font-mono">
                        {formatDateTime(returnRequest.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 3: Refund Processed */}
                <div className="relative">
                  <div className={`absolute left-[-41px] top-0 w-6 h-6 rounded-full border-2 border-bg-primary flex items-center justify-center ${
                    isCompleted
                      ? "bg-accent-secondary text-white shadow-lg shadow-accent-secondary/20"
                      : "bg-bg-tertiary text-text-muted"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={12} /> : <Circle size={12} className="opacity-40" />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isCompleted ? "text-text-primary" : "text-text-muted"}`}>
                      Refund Settled
                    </h3>
                    <p className={`text-xs mt-0.5 font-medium ${isCompleted ? "text-text-secondary" : "text-text-muted"}`}>
                      {isCompleted
                        ? "Refund transaction executed. Funds have been sent back to your selected method."
                        : "Awaiting approval approval and transaction confirmation."}
                    </p>
                    {returnRequest?.updatedAt && isCompleted && (
                      <span className="text-[10px] text-text-muted mt-1 block font-mono">
                        {formatDateTime(returnRequest.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default RefundStatus;