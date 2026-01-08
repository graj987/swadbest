import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import useAuth from "@/Hooks/useAuth";

/* ========= STATUS COLORS ========= */
const primaryGradient =
    "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white";

/* ========= ORDER PAGE ========= */
const OrderDetails = () => {
    const { id } = useParams();
    const { getAuthHeader, logout } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    /* LOAD ORDER */
    useEffect(() => {
        (async () => {
            try {
                const res = await API.get(`/api/orders/${id}`, {
                    headers: getAuthHeader(),
                });
                setOrder(res.data?.data || null);
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [getAuthHeader, id, logout, navigate]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-indigo-700 text-lg">Loading order…</p>
            </div>
        );

    if (!order)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-lg">Order not found</p>
            </div>
        );

    /* DELIVERY STEPS */
    const steps = ["preparing", "shipped", "delivered"];

    const currentIndex = steps.indexOf(order.orderStatus);

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-2 md:px-4 flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-10">

                {/* BACK BUTTON */}
                <Link to="/orders" className="text-indigo-600 font-semibold">
                    ← Back
                </Link>

                {/* HEADER */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-4 text-center">
                    Order Tracking
                </h2>
                <p className="text-center text-gray-500 text-sm">
                    Order #{order._id.slice(-8)}
                </p>

                {/* 🔥 PROGRESS BAR */}
                <div className="mt-8 mb-10">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-3">
                        <span>Preparing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                    </div>

                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                        <div
                            className="absolute h-2 rounded-full bg-indigo-600 transition-all"
                            style={{
                                width:
                                    currentIndex === 0
                                        ? "33%"
                                        : currentIndex === 1
                                            ? "66%"
                                            : "100%",
                            }}
                        ></div>
                    </div>
                </div>

                {/* MAIN CARD */}
                {/* MAIN CARD */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-8 shadow-sm">

                    {/* STATUS BADGE */}
                    <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold w-fit mx-auto ${primaryGradient}`}
                    >
                        {order.orderStatus.toUpperCase()}
                    </div>

                    {/* FILTERS */}
                    <div className="flex justify-center gap-4 text-sm font-semibold">
                        {["delivered", "shipped", "preparing"].map((s) => (
                            <span
                                key={s}
                                className={`cursor-pointer px-3 py-1 rounded-lg ${order.orderStatus === s
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-600 border"
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                        ))}
                    </div>

                    {/* EXPECTED DELIVERY */}
                    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                        <div>
                            <p className="text-gray-600 text-sm">Expected Delivery</p>
                            <p className="text-xl font-bold text-gray-900">
                                {order.expectedDeliveryDate || "3–5 days"}
                            </p>
                        </div>

                        <div className="text-indigo-600 font-semibold text-sm">
                            {order.orderStatus === "delivered" ? "Delivered" : "On the way"}
                        </div>
                    </div>

                    {/* SHIPPING TIMELINE (Amazon-style) */}
                    <div className="space-y-4">

                        {[
                            { label: "Order Placed", key: "placed" },
                            { label: "Preparing", key: "preparing" },
                            { label: "Shipped", key: "shipped" },
                            { label: "Out for Delivery", key: "out" },
                            { label: "Delivered", key: "delivered" },
                        ].map((step, idx) => {
                            const isActive = steps.indexOf(order.orderStatus) >= steps.indexOf(step.key);
                            return (
                                <div key={idx} className="flex items-start gap-4">
                                    <div
                                        className={`w-4 h-4 mt-1 rounded-full border-2 ${isActive ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
                                            }`}
                                    ></div>

                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-semibold ${isActive ? "text-indigo-700" : "text-gray-500"
                                                }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {isActive ? "Completed" : "Pending"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ITEMS + ADDRESS */}
                    <div className="flex flex-col md:flex-row gap-8 pt-4">
                        {/* ADDRESS */}
                        <div className="md:w-1/2">
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">
                                Shipping Address
                            </h3>
                            <p className="text-gray-800 font-medium">{order.address.name}</p>
                            <p className="text-gray-600">{order.address.phone}</p>
                            <p className="text-gray-600">{order.address.line1}</p>
                            <p className="text-gray-600">
                                {order.address.city} - {order.address.pincode}
                            </p>
                        </div>

                        {/* ITEMS */}
                        <div className="md:w-1/2">
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Items</h3>
                            <div className="space-y-4">
                                {order.products.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <SafeImage
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                className="w-14 h-14 rounded-lg border object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {item.product?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} × ₹{item.priceAtPurchase}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="font-semibold text-gray-900">
                                            ₹{item.quantity * item.priceAtPurchase}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                            Payment Summary
                        </h3>

                        <p className="text-gray-700 flex justify-between">
                            Method:{" "}
                            <span className="font-medium">
                                {order.paymentStatus === "paid" ? "Online" : "Cash on Delivery"}
                            </span>
                        </p>

                        <p className="text-gray-900 flex justify-between mt-2 text-lg font-bold">
                            Total: <span>₹{order.totalAmount}</span>
                        </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">

                        {/* INVOICE */}
                        <button
                            onClick={() => console.log("download invoice")}
                            className="bg-white px-6 py-3 border rounded-lg font-semibold shadow text-gray-700"
                        >
                            Download Invoice 📄
                        </button>

                        {/* REORDER */}
                        <button
                            onClick={() => console.log("reorder")}
                            className={`${primaryGradient} px-8 py-3 rounded-lg font-semibold shadow-lg`}
                        >
                            Reorder 🔁
                        </button>
                        <button
                            onClick={async () => {
                                const confirmCancel = window.confirm(
                                    "Are you sure you want to cancel this order?"
                                );
                                if (!confirmCancel) return;

                                try {
                                    const res = await API.put(
                                        `/api/orders/cancel/${order._id}`,
                                        {},
                                        { headers: getAuthHeader() }
                                    );

                                    alert(res.data.message || "Order cancelled successfully");

                                    // Refresh page or go to orders page
                                    navigate("/orders");
                                } catch (err) {
                                    const msg =
                                        err.response?.data?.message || "Unable to cancel order. Try again.";
                                    alert(msg);
                                }
                            }}
                            className={`${primaryGradient} px-8 py-3 rounded-lg font-semibold shadow-lg`}
                        >
                            Cancel Order ❌
                        </button>


                        {/* TRACK */}
                        {order.trackingUrl && (
                            <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${primaryGradient} px-8 py-3 rounded-lg font-semibold shadow-lg`}
                            >
                                Track Shipment 🚚
                            </a>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
