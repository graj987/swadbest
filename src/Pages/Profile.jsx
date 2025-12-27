// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import API from "@/api";
import useAuth from "../Hooks/useAuth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/Components/ui/card.jsx";

import { Input } from "@/Components/ui/input.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs.jsx";
import { Alert, AlertDescription } from "@/Components/ui/alert.jsx";

import { Loader2, Camera, LogOut } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const { setUser, getAuthHeader, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [orders, setOrders] = useState([]); // ALWAYS ARRAY
  const [selectedOrder, setSelectedOrder] = useState(null);

  const humanDate = (iso) =>
    iso ? new Date(iso).toLocaleString() : "—";

  /* ================= LOAD PROFILE + ORDERS ================= */
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        // PROFILE
        const profileRes = await API.get("/api/users/profile", {
          headers: getAuthHeader(),
        });

        if (cancelled) return;

        const profile = profileRes.data;
        setUser(profile);

        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          password: "",
        });

        setAvatarPreview(profile.avatarUrl || "");

        // ORDERS (NORMALIZED)
        const ordersRes = await API.get("/api/orders/my", {
          headers: getAuthHeader(),
        });

        const ordersData = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : [];

        if (!cancelled) setOrders(ordersData);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setOrdersLoading(false);
        }
      }
    };

    fetchAll();
    return () => (cancelled = true);
  }, [getAuthHeader, logout, navigate, setUser]);

  /* ================= AVATAR PREVIEW ================= */
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setMsg("Avatar must be under 5MB.");
      return;
    }

    setAvatarFile(f);
  };

  /* ================= UPDATE PROFILE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      let res;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("phone", form.phone);
        if (form.password) fd.append("password", form.password);
        fd.append("avatar", avatarFile);

        res = await API.put("/api/users/profile", fd, {
          headers: getAuthHeader(),
        });
      } else {
        const payload = {
          name: form.name,
          phone: form.phone,
        };
        if (form.password) payload.password = form.password;

        res = await API.put("/api/users/profile", payload, {
          headers: getAuthHeader(),
        });
      }

      setUser(res.data.user);
      setForm((p) => ({ ...p, password: "" }));
      setMsg("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setMsg("Profile update failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading profile…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                {msg && (
                  <Alert className="mb-4">
                    <AlertDescription>{msg}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          avatarPreview ||
                          "https://ui-avatars.com/api/?name=User"
                        }
                        className="h-28 w-28 rounded-full object-cover border"
                        alt="avatar"
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full border"
                        onClick={() => fileInput.current.click()}
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                    <input ref={fileInput} type="file" hidden onChange={handleFile} />
                  </div>

                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
                  <Input value={form.email} readOnly className="bg-gray-100" />
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New Password" />

                  <Button disabled={submitting} className="w-full">
                    {submitting ? "Saving…" : "Save Changes"}
                  </Button>

                  <Button type="button" className="w-full bg-red-600 text-white" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDERS */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p>Loading orders…</p>
                ) : orders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(orders) &&
                      orders.map((o) => (
                        <div
                          key={o._id}
                          className="border p-4 rounded cursor-pointer"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="font-semibold">
                                Order #{o._id.slice(0, 8)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {humanDate(o.createdAt)}
                              </div>
                            </div>
                            <div className="text-orange-600 font-medium">
                              {o.orderStatus || "Processing"}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ORDER MODAL */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-xl w-full max-w-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <div className="flex justify-between mb-4">
                  <h4 className="font-semibold">Order Details</h4>
                  <button onClick={() => setSelectedOrder(null)}>✕</button>
                </div>

                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedOrder, null, 2)}
                </pre>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
