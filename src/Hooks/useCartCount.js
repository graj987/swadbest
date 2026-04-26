import { useCallback, useEffect, useRef, useState } from "react";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";
import { CART_UPDATED_EVENT } from "@/utils/CartEvent";

export default function useCartCount({ enabled = true } = {}) {
  const { getAuthHeader, isAuthenticated, logout } = useAuth();

  const [counts, setCounts] = useState({
    cartCount: 0,
    wishlistCount: 0,
  });

  const [loading, setLoading] = useState(false);

  // prevents overlapping requests
  const fetchingRef = useRef(false);

  // prevent setState after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchCounts = useCallback(async () => {

    if (!enabled || !isAuthenticated) {
      // if user logged out, reset counts
      if (mountedRef.current) {
        setCounts({
          cartCount: 0,
          wishlistCount: 0
        });
      }
      return;
    }

    if (fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      if (mountedRef.current) {
        setLoading(true);
      }

      const { data } = await API.get("/api/cart/counts", {
        headers: getAuthHeader(), // should always return fresh token
        timeout: 30000
      });

      if (mountedRef.current) {
        setCounts({
          cartCount: data?.cartCount || 0,
          wishlistCount: data?.wishlistCount || 0
        });
      }

    } catch (err) {

      const status = err?.response?.status;

      if (status === 401) {
        console.warn("Session expired");

        // optional:
        // logout();

        // DO NOT force logout automatically unless you want that behavior.
        // Better to let refresh-token logic handle this if you have it.
      }
      else if (status !== 429) {
        console.error(
          "Failed to fetch cart/wishlist counts:",
          err?.response?.data || err.message
        );
      }

    } finally {

      fetchingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }

  }, [enabled, isAuthenticated, getAuthHeader]);



  // fetch whenever auth becomes ready
  useEffect(() => {
    if (isAuthenticated) {
      fetchCounts();
    } else {
      setCounts({
        cartCount: 0,
        wishlistCount: 0
      });
    }
  }, [isAuthenticated, fetchCounts]);


  // refetch when cart updates
  useEffect(() => {

    const handler = () => {
      fetchCounts();
    };

    window.addEventListener(
      CART_UPDATED_EVENT,
      handler
    );

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        handler
      );
    };

  }, [fetchCounts]);


  return {
    ...counts,
    loading,
    refetch: fetchCounts
  };
}