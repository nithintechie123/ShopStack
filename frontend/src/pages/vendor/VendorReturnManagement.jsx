import { useEffect, useState } from "react";
import {
    getVendorReturnRequests,
    updateReturnStatus
} from "../../api/orders";
function VendorReturnManagement() {

    const [returns, setReturns] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {

    loadReturns();

}, []);

const loadReturns = () => {

    getVendorReturnRequests()
        .then((res) => {

            setReturns(res.data);

        })
        .catch((err) => {

            console.error(err);

        });

};
const handleStatusUpdate = (orderId, status) => {

    if (!window.confirm(`Are you sure you want to ${status.replace("_", " ")}?`)) {
        return;
    }

    updateReturnStatus(orderId, status)
    .then(() => {

        setMessage(
            status === "APPROVED"
                ? "✅ Return approved successfully!"
                : status === "REJECTED"
                ? "❌ Return rejected successfully!"
                : "💰 Refund processed successfully!"
        );

        loadReturns();

        setTimeout(() => {
            setMessage("");
        }, 3000);

    })
        .catch((err) => {
            console.error(err);
        });

};

    return (

        <div className="min-h-screen p-8">

            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Return & Refund Management
                </h1>
                {message && (
                    <div className="mb-4 rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-green-700">
                        {message}
                    </div>
                )}

                <p className="mt-2 text-gray-500">
                    Review customer return requests and process refunds.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">

                <table className="w-full">

                    <thead>

                        <tr className="border-b bg-gray-50">

                            <th className="text-left p-3">Customer</th>
                            <th className="text-left p-3">Product</th>
                            <th className="text-left p-3">Reason</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Action</th>

                        </tr>

                    </thead>

                    <tbody>

                    {returns.length === 0 ? (

                    <tr>

                    <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500"
                    >
                    📦 No return requests found.
                    </td>

                    </tr>

                    ) : (

                    returns.map((request) => (

                    <tr
                        key={request.returnId}
                        className="border-b hover:bg-gray-50 transition-colors"
                    >

                    <td className="p-3">
                    {request.customerName}
                    </td>

                    <td className="p-3">
                    {request.productName}
                    </td>

                    <td className="p-3">
                    {request.reason}
                    </td>

                    <td className="p-3">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${
                                request.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : request.status === "APPROVED"
                                    ? "bg-blue-100 text-blue-700"
                                    : request.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {request.status}
                        </span>
                    </td>

                    <td className="p-3">

                        <div className="flex gap-2">

                            {request.status === "PENDING" && (
                                <>
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(request.orderId, "APPROVED")
                                        }
                                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleStatusUpdate(request.orderId, "REJECTED")
                                        }
                                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {request.status === "APPROVED" && (
                                <button
                                    onClick={() =>
                                        handleStatusUpdate(request.orderId, "REFUND_PROCESSED")
                                    }
                                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Process Refund
                                </button>
                            )}

                            {request.status === "REFUND_PROCESSED" && (
                                <span className="text-green-600 font-semibold">
                                    ✅ Refund Completed
                                </span>
                            )}

                            {request.status === "REJECTED" && (
                                <span className="text-red-600 font-semibold">
                                    ❌ Return Rejected
                                </span>
                            )}

                        </div>

                    </td>

                    </tr>

                    ))

                    )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default VendorReturnManagement;