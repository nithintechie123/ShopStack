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
  IndianRupee,
  ShieldAlert,
  ClipboardList
} from "lucide-react";

function VendorReturnManagement() {
  const [returns, setReturns] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(true);

  // Inspection Modal State
  const [activeInspection, setActiveInspection] = useState(null);
  const [validationChecklist, setValidationChecklist] = useState({
    skuMatched: false,
    defectConfirmed: false,
    policyWindowValid: false,
  });
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

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

  const handleOpenInspection = (request) => {
    setActiveInspection(request);
    setValidationChecklist({
      skuMatched: false,
      defectConfirmed: false,
      policyWindowValid: false,
    });
    setRejectionReasonInput("");
    setShowRejectForm(false);
  };

  const handleCloseInspection = () => {
    setActiveInspection(null);
  };

  const handleChecklistChange = (key) => {
    setValidationChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isChecklistComplete =
    validationChecklist.skuMatched &&
    validationChecklist.defectConfirmed &&
    validationChecklist.policyWindowValid;

  const executeStatusUpdate = (orderId, status, rejectionReason = "") => {
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
        handleCloseInspection();
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

  const handleApprove = () => {
    if (!isChecklistComplete) return;
    executeStatusUpdate(activeInspection.orderId, "APPROVED");
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReasonInput.trim()) {
      alert("Please specify the reason for rejection.");
      return;
    }
    executeStatusUpdate(activeInspection.orderId, "REJECTED", rejectionReasonInput);
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
            Inspect customer return claims, validate product compliance checkpoints, and release refund credits.
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
                            {status === "REFUND_PROCESSED" && <IndianRupee size={10} />}
                            <span>{status.replace(/_/g, " ")}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {status === "PENDING" && (
                              <button
                                onClick={() => handleOpenInspection(request)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-primary hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                <ClipboardList size={13} />
                                <span>Inspect & Validate</span>
                              </button>
                            )}

                            {status === "APPROVED" && (
                              <button
                                onClick={() => {
                                  if (window.confirm("Do you want to process the refund transaction?")) {
                                    executeStatusUpdate(request.orderId, "REFUND_PROCESSED");
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
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

      {/* INSPECTION & VALIDATION MODAL */}
      {activeInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-glass-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-glass-border bg-bg-tertiary flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-accent-primary" size={18} />
                <h3 className="font-bold text-sm text-text-primary">Return Request Inspection</h3>
              </div>
              <button
                onClick={handleCloseInspection}
                className="text-text-muted hover:text-text-primary text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-5">
              
              {/* Product Info */}
              <div className="p-4 bg-glass/5 border border-glass-border rounded-xl">
                <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block">Customer Name</span>
                <span className="font-bold text-xs text-text-primary">{activeInspection.customerName}</span>
                
                <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mt-3">Product Claim</span>
                <span className="font-bold text-xs text-text-primary">{activeInspection.productName}</span>

                <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mt-3">Reported Reason</span>
                <span className="inline-flex mt-1 text-[10px] font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                  {activeInspection.reason?.replace(/_/g, " ")}
                </span>
              </div>

              {/* Customer description statement */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Customer Description Statement</span>
                <div className="p-4 rounded-xl border border-glass-border bg-bg-tertiary text-xs italic text-text-secondary leading-relaxed">
                  "{activeInspection.description || "No description provided."}"
                </div>
              </div>

              {/* Uploaded Verification Photo */}
              {activeInspection.imageUrl && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Uploaded Photo Evidence</span>
                  <div className="rounded-xl overflow-hidden border border-glass-border bg-bg-tertiary max-h-48 flex items-center justify-center">
                    <img
                      src={activeInspection.imageUrl}
                      alt="Return Request Evidence"
                      className="max-h-48 w-full object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => window.open(activeInspection.imageUrl, '_blank')}
                    />
                  </div>
                </div>
              )}

              {/* Interactive Checklist */}
              {!showRejectForm && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-accent-primary" />
                    <span>Product Validation Checklist (All Required)</span>
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {/* Item 1 */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-glass-border/60 hover:bg-glass/5 cursor-pointer transition-colors text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={validationChecklist.skuMatched}
                        onChange={() => handleChecklistChange("skuMatched")}
                        className="mt-0.5 rounded accent-accent-primary cursor-pointer"
                      />
                      <span>Verify returned product matches original order details.</span>
                    </label>

                    {/* Item 2 */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-glass-border/60 hover:bg-glass/5 cursor-pointer transition-colors text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={validationChecklist.defectConfirmed}
                        onChange={() => handleChecklistChange("defectConfirmed")}
                        className="mt-0.5 rounded accent-accent-primary cursor-pointer"
                      />
                      <span>Confirm that defect description corresponds to item state.</span>
                    </label>

                    {/* Item 3 */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-glass-border/60 hover:bg-glass/5 cursor-pointer transition-colors text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={validationChecklist.policyWindowValid}
                        onChange={() => handleChecklistChange("policyWindowValid")}
                        className="mt-0.5 rounded accent-accent-primary cursor-pointer"
                      />
                      <span>Verify return request complies with merchant policies.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Rejection Form Input */}
              {showRejectForm && (
                <form onSubmit={handleRejectSubmit} className="flex flex-col gap-3 animate-in slide-in-from-bottom-2">
                  <span className="text-[10px] uppercase font-bold text-accent-danger tracking-wider">Specify Rejection Reason *</span>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Provide a detailed explanation to the customer explaining why the claim was denied..."
                    className="w-full rounded-xl border border-glass-border bg-glass/5 text-xs text-text-primary px-3 py-2.5 focus:outline-none focus:border-accent-danger transition-colors resize-none"
                  />
                  <div className="flex gap-2.5 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 rounded-lg bg-bg-tertiary border border-glass-border text-xs font-bold text-text-secondary cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-accent-danger hover:opacity-90 text-white text-xs font-bold cursor-pointer"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Modal Footer Controls */}
            {!showRejectForm && (
              <div className="p-5 border-t border-glass-border bg-bg-tertiary flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2.5 rounded-xl bg-accent-danger/10 hover:bg-accent-danger border border-accent-danger/20 text-accent-danger hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Claim
                </button>
                <button
                  type="button"
                  disabled={!isChecklistComplete}
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-accent-secondary hover:opacity-90 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-accent-secondary/15"
                >
                  <Check size={14} />
                  <span>Approve & Close</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default VendorReturnManagement;