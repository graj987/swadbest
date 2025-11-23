import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const inputFileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const humanDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");
  const orderTotal = (o) =>
    typeof o.totalAmount === "number" ? `₹${o.totalAmount.toFixed(2)}` : o.totalAmount ?? "—";
  const itemsCount = (o) =>
    Array.isArray(o.products) ? o.products.reduce((s, it) => s + (it.quantity ?? 1), 0) : o.items?.length ?? 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setOrdersLoading(true);

        const profileRes = await API.get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled) return;
        const profile = profileRes.data;
        setUser(profile);
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          password: "",
        });
        if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);

        const userId = profile._id ?? profile.id;
        if (userId) {
          const ordersRes = await API.get(`/api/orders/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (cancelled) return;
          const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders ?? [];
          setOrders(ordersData);
        } else {
          setOrders([]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("fetch profile/orders error:", err?.response ?? err);
        const status = err?.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        setMsg({ type: "error", text: err?.response?.data?.message || "Failed to load profile/orders." });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setOrdersLoading(false);
        }
      }
    };

    fetchAll();
    return () => { cancelled = true; };
    
  }, [navigate]);

  useEffect(() => {
    if (!avatarFile) return undefined;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: "error", text: "Avatar must be under 5MB." });
      return;
    }
    setAvatarFile(file);
    setMsg({ type: "", text: "" });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMsg({ type: "", text: "" });
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setSubmitting(true);

    try {
      let res;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("phone", form.phone);
        if (form.password && form.password.trim() !== "") fd.append("password", form.password);
        fd.append("avatar", avatarFile);

        res = await API.put("/api/users/profile", fd, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const payload = { name: form.name, phone: form.phone };
        if (form.password && form.password.trim() !== "") payload.password = form.password;
        res = await API.put("/api/users/profile", payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      const updated = res.data?.user ?? res.data;
      if (updated) {
        setUser(updated);
        setForm((f) => ({ ...f, password: "" }));
        try { localStorage.setItem("user", JSON.stringify(updated)); } catch (err) { console.error(err); }
      }

      setMsg({ type: "success", text: "Profile updated." });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("update error:", err?.response ?? err);
      const status = err?.response?.status;
      if (status === 401) { localStorage.removeItem("token"); navigate("/login"); return; }
      setMsg({ type: "error", text: err?.response?.data?.message || "Update failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };
  const closeModal = () => setSelectedOrder(null);

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-orange-50"><div className="animate-pulse text-gray-600">Loading profile...</div></div>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-orange-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="text-xl font-semibold text-orange-600">My Profile</h2><p className="text-sm text-gray-500">Manage your account</p></div>
            <div className="flex items-center gap-3">
              {avatarPreview ? (<img src={avatarPreview} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-orange-200" />) : (<div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-semibold">{user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}</div>)}
            </div>
          </div>

          {msg.text && (<div className={`p-2 mb-4 rounded-md text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input ref={inputFileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input name="email" value={form.email} readOnly className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 cursor-not-allowed" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">New password</label><input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Leave blank to keep current" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${submitting ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}>
                {submitting ? (<svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>) : (<svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                <span>{submitting ? "Saving..." : "Save changes"}</span>
              </button>

              <button type="button" onClick={() => { setForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", password: "" }); setAvatarFile(null); setAvatarPreview(user?.avatarUrl || ""); setMsg({ type: "", text: "" }); }} className="px-4 py-2 rounded-lg border border-gray-200 bg-white">Reset</button>
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => inputFileRef.current?.click()} className="px-3 py-2 bg-white border rounded-lg text-sm shadow-sm hover:shadow-md transition">Change avatar</button>
              <button onClick={handleLogout} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm shadow-sm hover:bg-red-600 transition">Logout</button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-500">Last updated: <span className="font-medium text-gray-700">{user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}</span></div>
        </section>


        {/* Orders panel */}
        <section  initial="hidden" animate="visible" className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-orange-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Your Orders</h3>
              <p className="text-sm text-gray-500">Track current orders and view history.</p>
            </div>
            <div className="text-sm text-gray-500">{orders.length} orders</div>
          </div>

          {ordersLoading ? (
            <div className="animate-pulse text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders found — start shopping!</div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord._id ?? ord.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">#{(ord._id ?? ord.id)?.toString().slice(0, 8)}</div>
                      <div className="text-sm text-gray-600 font-medium">{ord.orderStatus ?? ord.status ?? "Processing"}</div>
                      <div className="text-sm text-gray-400 ml-2">{humanDate(ord.createdAt ?? ord.created)}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Items: {itemsCount(ord)} • Total: {orderTotal(ord)}</div>
                  </div>

                  <div className="flex gap-2 items-center ml-4">
                    <button onClick={() => setSelectedOrder(ord)} className="px-3 py-1 rounded-md bg-white border text-sm hover:shadow-sm transition">View</button>

                    {ord.trackingUrl ? (
                      <a href={ord.trackingUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm">Track</a>
                    ) : (
                      <button onClick={() => navigate(`/orders/${ord._id ?? ord.id}`)} className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm">Track</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Important user info */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Important account info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Default Shipping</div>
                <div className="mt-1 font-medium">{user?.address?.line1 ? `${user.address.line1}, ${user.address.city ?? ""}` : "Not set"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Payment Method</div>
                <div className="mt-1 font-medium">{user?.cardLast4 ? `•••• ${user.cardLast4}` : "Not saved"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Account Created</div>
                <div className="mt-1 font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Support</div>
                <div className="mt-1 font-medium">support@yourshop.example</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Order modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-semibold">Order #{(selectedOrder._id ?? selectedOrder.id)?.toString().slice(0, 8)}</h5>
                  <div className="text-sm text-gray-500">Placed: {humanDate(selectedOrder.createdAt ?? selectedOrder.created)}</div>
                </div>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium">{selectedOrder.orderStatus ?? selectedOrder.status ?? "Processing"}</div>

                  <div className="mt-3 text-xs text-gray-500">Items</div>
                  <div className="mt-2 space-y-2">
                    {(selectedOrder.products ?? selectedOrder.items ?? []).map((it, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {it.product?.image || it.image ? <img src={it.product?.image ?? it.image} alt={it.product?.name ?? it.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{it.product?.name ?? it.name}</div>
                          <div className="text-xs text-gray-500">Qty: {it.quantity ?? it.qty ?? 1} • ₹{((it.product?.price ?? it.price ?? 0) * (it.quantity ?? it.qty ?? 1)).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Shipping</div>
                  <div className="font-medium">{selectedOrder.shippingAddress?.line1 ?? "—"}</div>

                  <div className="mt-3 text-xs text-gray-500">Total</div>
                  <div className="text-lg font-semibold mt-1">{orderTotal(selectedOrder)}</div>

                  {selectedOrder.trackingUrl ? (
                    <a href={selectedOrder.trackingUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-md">
                      Track on carrier site
                    </a>
                  ) : (
                    <button onClick={() => navigate(`/orders/${selectedOrder._id ?? selectedOrder.id}`)} className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-md">
                      View order page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
