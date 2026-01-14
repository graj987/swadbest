import { useEffect, useState, useCallback } from "react";
import API from "@/api";
import useAuth from "@/Hooks/useAuth";

export default function useCartCount() {
  const { user, getAuthHeader } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const { data } = await API.get("/api/cart/counts", {
        headers: getAuthHeader(),
      });

      setCartCount(data.cartCount || 0);
      setWishlistCount(data.wishlistCount || 0);
    } catch (err) {
      console.error("Failed to fetch cart/wishlist counts", err);
    }
  }, [user, getAuthHeader]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    cartCount,
    wishlistCount,
    refetch: fetchCounts,
  };
}
