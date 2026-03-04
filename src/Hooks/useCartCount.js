import { useCallback, useEffect, useRef, useState } from "react";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { CART_UPDATED_EVENT } from "@/utils/CartEvent";

export default function useCartCount({ enabled = true } = {}) {
  const { getAuthHeader, isAuthenticated } = useAuth();

  const [counts, setCounts] = useState({
    cartCount: 0,
    wishlistCount: 0,
  });

  const [loading, setLoading] = useState(false);

  // ✅ prevents duplicate API calls (React StrictMode + re-renders)
  const fetchingRef = useRef(false);
  const fetchedOnceRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;

    // stop parallel + repeated calls
    if (fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      setLoading(true);

      const { data } = await API.get("/api/cart/counts", {
        headers: getAuthHeader(),
      });

      setCounts({
        cartCount: data.cartCount || 0,
        wishlistCount: data.wishlistCount || 0,
      });

      fetchedOnceRef.current = true;
    } catch (err) {
      // ignore auth + rate limit noise
      if (
        err?.response?.status !== 401 &&
        err?.response?.status !== 429
      ) {
        console.error("Failed to fetch cart/wishlist counts", err);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [enabled, isAuthenticated, getAuthHeader]);

  // ✅ run only once on mount
  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchCounts();
  }, [fetchCounts]);

  // ✅ refetch only when cart actually updates
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