import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";

export default function Address() {
  const { getAuthHeader } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  /* ================== LOAD ADDRESSES ================== */
  const loadAddresses = useCallback(async () => {
    try {
      const res = await API.get("/api/address/getadd", {
        headers: getAuthHeader(),
      });
      setAddresses(res.data?.data || []);
    } catch {
      console.error("Failed to load addresses");
    } finally {
      setAddressesLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /* ================== FORM HANDLING ================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditAddress(null);
    setAddressForm({
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
    setShowAddressModal(true);
  };

  const openEditForm = (address) => {
    setEditAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setShowAddressModal(true);
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
      console.error("Failed to save address", err);
    }
  };

  /* ================== DELETE ADDRESS ================== */
  const handleDeleteAddress = async () => {
    try {
      await API.delete(`/api/address/${deleteAddressId}`, {
        headers: getAuthHeader(),
      });
      setDeleteAddressId(null);
      loadAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  if (addressesLoading) {
    return <div className="p-4">Loading addresses...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">My Addresses</h1>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg"
        >
          + Add Address
        </button>
      </div>

      {/* ADDRESS LIST */}
      {addresses.length === 0 ? (
        <p className="text-gray-500">No addresses added yet.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div className="text-sm">
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p>{addr.country}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(addr)}
                  className="px-3 py-1 text-sm border rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteAddressId(addr._id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveAddress}
            className="bg-white w-full max-w-md rounded-xl p-5 space-y-3"
          >
            <h2 className="text-lg font-semibold">
              {editAddress ? "Edit Address" : "Add Address"}
            </h2>

            <input
              name="street"
              placeholder="Street"
              value={addressForm.street}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              name="city"
              placeholder="City"
              value={addressForm.city}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              name="state"
              placeholder="State"
              value={addressForm.state}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              name="zip"
              placeholder="ZIP Code"
              value={addressForm.zip}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              name="country"
              placeholder="Country"
              value={addressForm.country}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(false);
                  setEditAddress(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteAddressId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <p className="mb-4">Delete this address?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteAddressId(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAddress}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
