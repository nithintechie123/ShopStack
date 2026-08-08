import { useEffect, useState } from "react";
import {
  getVendorReturnRequests,
  updateReturnStatus
} from "../../api/orders";
import {
  RotateCcw,
  Check,
  X,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  User,
  HelpCircle,
  DollarSign
} from "lucide-react";

function VendorReturnManagement() {
  const [returns, setReturns] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success"); // "success" or "error"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = () => {
    setLoading(true);
    getVendorReturnRequests()
      .then((res) => {
        setReturns(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const handleStatusUpdate = (orderId, status) => {
    const actionText = status === "APPROVED" ? "approve this return request" : status === "REJECTED" ? "reject this return request" : "process the refund";
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    updateReturnStatus(orderId, status)
      .then(() => {
        setMsgType("success");
        setMessage(
          status === "APPROVED"
            ? "Return request approved successfully!"
            : status === "REJECTED"
            ? "Return request rejected successfully."
            : "Refund transaction completed successfully."
        );
        loadReturns();
        setTimeout(() => {
          setMessage("");
        }, 4000);
      })
      .catch((err) => {
        console.error(err);
        setMsgType("error");
        setMessage(err.response?.data?.error || "Failed to update return status.");
        setTimeout(() => {
          setMessage("");
        }, 4000);
      });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <RotateCcw className="text-orange-500" size={28} />
            <span>Return & Refund Management</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 font-medium">
            Review customer return claims, evaluate reasons, and process refund payouts.
          </p>
        </div>

        {/* Notifications */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
            msgType === "success" 
              ? "bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary" 
              : "bg-accent-danger/10 border-accent-danger/20 text-accent-danger"
          }`}>
            {msgType === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {/* Returns Table Card */}
        <div className="rounded-2xl border border-glass-border bg-glass/10 backdrop-blur-md overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-text-secondary">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold">Loading returns and refunds queue...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center gap-3">
              <Package size={44} className="opacity-50" />
              <h3 className="font-bold text-text-secondary">No return requests</h3>
              <p className="text-xs max-w-xs leading-relaxed">Customers haven't submitted any return requests for your products yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-glass-border text-sm text-left">
                <thead className="bg-bg-tertiary/70 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Return Reason</th>
                    <th className="px-6 py-4">Process Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40">
                  {returns.map((request) => {
                    const status = (request.status || "PENDING").toUpperCase();
                    
                    return (
                      <tr key={request.returnId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                              <User size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-text-primary text-xs truncate">{request.customerName}</div>
                              <div className="text-[10px] text-text-muted mt-0.5 font-mono">Order: #{request.orderId?.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary text-xs max-w-[200px] truncate" title={request.productName}>
                            {request.productName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary font-medium">
                            <HelpCircle size={13} className="text-text-muted" />
                            {request.reason?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            status === "PENDING"
                              ? "bg-accent-warning/10 border-accent-warning/20 text-accent-warning"
                              : status === "APPROVED"
                              ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary"
                              : status === "REJECTED"
                              ? "bg-accent-danger/10 border-accent-danger/20 text-accent-danger"
                              : "bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary"
                          }`}>
                            {status === "PENDING" && <Clock size={10} />}
                            {status === "APPROVED" && <CheckCircle2 size={10} />}
                            {status === "REJECTED" && <XCircle size={10} />}
                            {status === "REFUND_PROCESSED" && <DollarSign size={10} />}
                            <span>{status.replace(/_/g, " ")}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(request.orderId, "APPROVED")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-secondary hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-accent-secondary/10"
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.orderId, "REJECTED")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-danger/10 hover:bg-accent-danger border border-accent-danger/30 text-accent-danger hover:text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                  <X size={13} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {status === "APPROVED" && (
                              <button
                                onClick={() => handleStatusUpdate(request.orderId, "REFUND_PROCESSED")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-accent-primary/15"
                              >
                                <CreditCard size={13} />
                                <span>Process Refund</span>
                              </button>
                            )}

                            {status === "REFUND_PROCESSED" && (
                              <span className="text-accent-secondary text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={14} /> Settle Closed
                              </span>
                            )}

                            {status === "REJECTED" && (
                              <span className="text-text-muted text-xs font-semibold flex items-center gap-1">
                                <XCircle size={14} /> Claim Closed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default VendorReturnManagement;