import { Link } from "react-router-dom";
import useAuth from "@/Hooks/useAuth";
import SafeImage from "@/Components/SafeImage";

export default function Account() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden border">
          <SafeImage
            src={user?.avatar}
            alt={user?.name}
            fallback="/avatar-placeholder.png"
          />
        </div>

        <div>
          <p className="text-lg font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* ================= ACTION LIST ================= */}
      <div className="bg-white rounded-xl border shadow-sm divide-y text-sm">

        <Link
          to="/profile"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>Manage Profile</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          to="/address"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>Shipping Address</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          to="/privacy"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>Privacy & Confidentiality</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>About Us</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          to="/help"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>Help & Support</span>
          <span className="text-gray-400">›</span>
        </Link>

        <Link
          to="/contact"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
        >
          <span>Contact Us</span>
          <span className="text-gray-400">›</span>
        </Link>
      </div>

      {/* ================= LOGOUT ================= */}
      <button
        onClick={logout}
        className="w-full mt-6 bg-white border border-red-200 text-red-600 py-3 rounded-xl hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  );
}
