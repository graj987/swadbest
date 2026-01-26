import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { CART_UPDATED_EVENT } from "@/utils/CartEvent";




export default function useCartCount({ enabled = true } = {}) {
  const { getAuthHeader, isAuthenticated } = useAuth();
const [counts, setCounts] = useState({ cartCount: 0, wishlistCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;

    try {
      setLoading(true);
      const { data } = await API.get("/api/cart/counts", {
        headers: getAuthHeader(),
      });
     setCounts({
  cartCount: data.cartCount || 0,
  wishlistCount: data.wishlistCount || 0,
});

    } catch (err) {
      // DO NOT spam console for auth issues
      if (err?.response?.status !== 401) {
        console.error("Failed to fetch cart/wishlist counts", err);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, getAuthHeader]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);
  useEffect(() => {
  const handler = () => {
    fetchCounts();
  };

  window.addEventListener(CART_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handler);
  };
}, [fetchCounts]);

  return {
    ...counts,
    loading,
    refetch: fetchCounts,
  };
}
