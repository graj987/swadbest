// src/pages/Profile.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {  AnimatePresence } from "framer-motion";

import { Loader2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, getAuthHeader, logout } = useAuth();

  /* GLOBAL STATE */
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  /* ORDER STATE */
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ADDRESS STATE */
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    house: "",
    street: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });

  /* ================== LOAD PROFILE + ORDERS ================== */
  useEffect(() => {
    const load = async () => {
      try {
        // profile
        const profileRes = await API.get("/api/users/profile", {
          headers: getAuthHeader(),
        });
        setUser(profileRes.data);

        // orders
        const orderRes = await API.get("/api/orders/my", {
          headers: getAuthHeader(),
        });
        setOrders(orderRes.data.data || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getAuthHeader, logout, navigate, setUser]);

  /* ================== LOAD ADDRESSES ================== */
  const loadAddresses = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd", {
        headers: getAuthHeader(),
      });
      setAddresses(res.data.data || []);
    } catch {
      console.error("Failed to load addresses");
    } finally {
      setAddressesLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /* ================== PROFILE UPDATE ================== */
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      password: "",
    });
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;

      const res = await API.put("/api/users/profile", payload, {
        headers: getAuthHeader(),
      });

      setUser(res.data.user);
      setMsg("Profile updated successfully.");
      setForm((p) => ({ ...p, password: "" }));
    } catch {
      setMsg("Profile update failed.");
    }

    setSubmitting(false);
  };

  /* ================== SAVE ADDRESS ================== */
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      if (editAddress) {
        await API.put(`/api/address/${editAddress._id}`, addressForm, {
          headers: getAuthHeader(),
        });
      } else {
        await API.post("/api/address/add", addressForm, {
          headers: getAuthHeader(),
        });
      }

      setShowAddressModal(false);
      setEditAddress(null);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================== DELETE ADDRESS ================== */
  const handleDeleteAddress = async () => {
    try {
      await API.delete(`/api/address/${deleteAddressId}`, {
        headers: getAuthHeader(),
      });
      setShowDeleteModal(false);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== LOADING SCREEN =============== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  /* ============================================================= */
  /*                              UI                               */
  /* ============================================================= */
  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          {/* ================== PROFILE ================== */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>

              <CardContent>
                {msg && (
                  <Alert className="mb-4">
                    <AlertDescription>{msg}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={updateProfile} className="space-y-4">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full Name"
                  />

                  <Input value={user?.email} readOnly className="bg-gray-100" />

                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone Number"
                  />

                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="New Password"
                  />

                  <Button disabled={submitting} className="w-full">
                    {submitting ? "Saving…" : "Save Changes"}
                  </Button>

                  <Button
                    type="button"
                    className="w-full bg-red-600 text-white"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================== ORDERS ================== */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>

              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div
                        key={o._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border p-4 rounded-lg cursor-pointer"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              Order #{o._id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(o.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <span className="font-medium text-orange-600">
                            {o.orderStatus || "Processing"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mt-1">
                          {o.products.length} items • ₹{o.totalAmount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* =============== ORDER MODAL =============== */}
            <AnimatePresence>
              {selectedOrder && (
                <div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedOrder(null)}
                >
                  <div
                    className="bg-white p-6 rounded-xl w-full max-w-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-semibold text-lg mb-3">
                      Order Details
                    </h4>

                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Order ID:</strong> {selectedOrder._id}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>

                      <strong>Items:</strong>
                      <ul className="pl-4 list-disc">
                        {selectedOrder.products.map((p) => (
                          <li key={p.product?._id}>
                            {p.product?.name} × {p.quantity} — ₹
                            {p.priceAtPurchase}
                          </li>
                        ))}
                      </ul>

                      <p>
                        <strong>Subtotal:</strong> ₹{selectedOrder.subtotal}
                      </p>
                      <p>
                        <strong>Tax:</strong> ₹{selectedOrder.tax}
                      </p>
                      <p>
                        <strong>Delivery:</strong> ₹
                        {selectedOrder.deliveryCharge}
                      </p>
                      <p>
                        <strong>COD Fee:</strong> ₹{selectedOrder.codCharge}
                      </p>

                      <p className="font-bold text-lg mt-2">
                        Total: ₹{selectedOrder.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ================== ADDRESS MANAGER ================== */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>My Addresses</CardTitle>
              </CardHeader>

              <CardContent>
                {addressesLoading ? (
                  <p className="text-gray-500">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No addresses saved.</p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setEditAddress(null);
                        setAddressForm({
                          name: "",
                          phone: "",
                          house: "",
                          street: "",
                          landmark: "",
                          pincode: "",
                          city: "",
                          state: "",
                        });
                        setShowAddressModal(true);
                      }}
                    >
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((a) => (
                      <div
                        key={a._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border p-4 rounded-lg flex justify-between"
                      >
                        <div>
                          <p className="font-semibold">{a.name}</p>
                          <p className="text-sm">{a.phone}</p>
                          <p className="text-sm">
                            {a.house}, {a.street}
                          </p>
                          <p className="text-sm">
                            {a.city} – {a.pincode}
                          </p>
                          <p className="text-xs text-gray-500">{a.state}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditAddress(a);
                              setAddressForm(a);
                              setShowAddressModal(true);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteAddressId(a._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      className="w-full mt-3"
                      onClick={() => {
                        setEditAddress(null);
                        setAddressForm({
                          name: "",
                          phone: "",
                          house: "",
                          street: "",
                          landmark: "",
                          pincode: "",
                          city: "",
                          state: "",
                        });
                        setShowAddressModal(true);
                      }}
                    >
                      + Add Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ADDRESS MODAL */}
            <AnimatePresence>
              {showAddressModal && (
                <div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddressModal(false)}
                >
                  <div
                    className="bg-white p-6 rounded-xl w-full max-w-md"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      {editAddress ? "Edit Address" : "Add Address"}
                    </h3>

                    <form className="space-y-3" onSubmit={handleSaveAddress}>
                      {Object.keys(addressForm).map((key) => (
                        <Input
                          key={key}
                          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                          value={addressForm[key]}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              [key]: e.target.value,
                            })
                          }
                        />
                      ))}

                      <Button className="w-full" type="submit">
                        Save Address
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* DELETE CONFIRM */}
            <AnimatePresence>
              {showDeleteModal && (
                <div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteModal(false)}
                >
                  <div
                    className="bg-white p-6 rounded-xl w-full max-w-sm"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold mb-3">
                      Delete address?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAddress}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
