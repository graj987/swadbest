import { useEffect, useRef, useState } from "react";
import useAuth from "@/Hooks/useAuth";
import API from "@/api";
import Address from "./Address";
import {
  Camera,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Save,
} from "lucide-react";

/* ── field wrapper ── */
function Field({ label, id, icon: Icon, children, note }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-stone-400" strokeWidth={2} />
          </div>
        )}
        {children}
      </div>
      {note && <p className="text-[11px] text-stone-400">{note}</p>}
    </div>
  );
}

export default function ManageProfile() {
  const { user, getAuthHeader, refreshUser } = useAuth();
  const uploadRef = useRef(null);

  const [form, setForm] = useState({ name: "", phone: "", avatar: "" });
  const [avatarFile, setAvatarFile]   = useState(null);
  const [preview,    setPreview]      = useState("");
  const [loading,    setLoading]      = useState(false);
  const [success,    setSuccess]      = useState("");
  const [error,      setError]        = useState("");
  const [focused,    setFocused]      = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* ── load user ── */
  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", avatar: user.avatar || "" });
      setPreview(user.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  /* ── avatar select ── */
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeAvatar = (ev) => {
    ev.stopPropagation();
    setAvatarFile(null);
    setPreview(user?.avatar || "");
  };

  /* ── save ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = form.avatar;

      if (avatarFile) {
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append("image", avatarFile);
        const uploadRes = await API.post("/api/users/upload-avatar", fd, {
          headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
        });
        avatarUrl = uploadRes.data?.url;
        setUploadingAvatar(false);
      }

      await API.put(
        "/api/users/profile",
        { name: form.name, phone: form.phone, avatar: avatarUrl },
        { headers: getAuthHeader() }
      );

      setSuccess("Profile updated successfully");
      setAvatarFile(null);
      refreshUser?.();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
    setPreview(user?.avatar || "");
    setAvatarFile(null);
    setError("");
    setSuccess("");
  };

  const inputCls = (field) =>
    `w-full h-11 pl-10 pr-4 rounded-xl border text-sm text-stone-800 bg-white outline-none transition-all duration-150
     placeholder:text-stone-300
     ${focused === field
       ? "border-orange-400 ring-3 ring-orange-400/15 shadow-sm"
       : "border-stone-200 hover:border-stone-300"
     }`;

  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";
  const isDirty = form.name !== (user?.name || "") || form.phone !== (user?.phone || "") || !!avatarFile;

  /* ─────────── RENDER ─────────── */
  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* ── Page heading ── */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold mb-1">Account</p>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Manage Profile</h1>
        <p className="text-sm text-stone-400 mt-1">Update your personal details and photo</p>
      </div>

      {/* ── Avatar ── */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={uploadRef}
            className="hidden"
            onChange={handleAvatarSelect}
          />

          {/* Avatar circle */}
          <div
            onClick={() => uploadRef.current?.click()}
            className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 cursor-pointer shadow-sm group-hover:border-orange-400 transition-all duration-200 relative"
          >
            {preview ? (
              <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                style={{ background: "linear-gradient(135deg, #431407, #c2410c)" }}
              >
                {avatarLetter}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" strokeWidth={2} />
              }
            </div>
          </div>

          {/* Remove new avatar button */}
          {avatarFile && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors"
        >
          {avatarFile ? "Change photo" : "Upload photo"}
        </button>
        <p className="text-[11px] text-stone-400 mt-0.5">JPG, PNG or WEBP · Max 5 MB</p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <Field label="Full Name" id="name" icon={User}>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            placeholder="Your full name"
            required
            className={inputCls("name")}
          />
        </Field>

        {/* Email (read-only) */}
        <Field label="Email Address" id="email" icon={Mail} note="Email address cannot be changed">
          <input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-100 text-sm text-stone-400 bg-stone-50 outline-none cursor-not-allowed"
          />
        </Field>

        {/* Phone */}
        <Field label="Phone Number" id="phone" icon={Phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            placeholder="+91 XXXXX XXXXX"
            className={inputCls("phone")}
          />
        </Field>

        {/* Divider + Address section */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-stone-100" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
              Saved Addresses
            </p>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <Address />
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm text-emerald-700 font-medium leading-snug">{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className={`
              flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2
              transition-all duration-200
              ${loading || !isDirty
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 active:scale-[0.99]"}
            `}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || !isDirty}
            className="h-11 px-5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}