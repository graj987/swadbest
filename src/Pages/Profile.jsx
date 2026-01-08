import { useEffect, useRef, useState } from "react";
import useAuth from "@/Hooks/useAuth";
import API from "@/api";
import SafeImage from "@/Components/SafeImage";
import Address from "./Address";

export default function ManageProfile() {
  const { user, getAuthHeader, refreshUser } = useAuth();

  const uploadRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    avatar: "", // final URL from backend
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
      setPreview(user.avatar || "");
    }
  }, [user]);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE SELECT ================= */
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file)); // instant preview
  };

  /* ================= SAVE PROFILE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = form.avatar;

      // upload avatar if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append("image", avatarFile);

        const uploadRes = await API.post(
          "/api/users/upload-avatar",
          fd,
          {
            headers: {
              ...getAuthHeader(),
              "Content-Type": "multipart/form-data",
            },
          }
        );

        avatarUrl = uploadRes.data?.url;
      }

      await API.put(
        "/api/users/profile",
        {
          name: form.name,
          phone: form.phone,
          avatar: avatarUrl,
        },
        {
          headers: getAuthHeader(),
        }
      );

      setSuccess("Profile updated successfully");
      setAvatarFile(null);
      refreshUser();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <h1 className="text-xl font-semibold mb-4">Manage Profile</h1>

      {/* ================= AVATAR UPLOAD ================= */}
      <input
        type="file"
        accept="image/*"
        ref={uploadRef}
        className="hidden"
        onChange={handleAvatarSelect}
      />

      <div
        className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center cursor-pointer shadow-sm"
        onClick={() => uploadRef.current.click()}
      >
        {!preview ? (
          <p className="text-gray-500 text-sm">Click to upload</p>
        ) : (
          <img
            src={preview}
            alt="Avatar preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email (cannot be changed)
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* OPTIONAL: Address section */}
        <Address />

        {/* STATUS */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-orange-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                name: user.name || "",
                phone: user.phone || "",
                avatar: user.avatar || "",
              });
              setPreview(user.avatar || "");
              setAvatarFile(null);
            }}
            className="px-5 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
