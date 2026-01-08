import { useCallback, useEffect, useState } from "react";
import API from "@/api";
import useAuth from "./useAuth";

export default function useCartCount() {
  const [count, setCount] = useState(0);
  const { user, getAuthHeader } = useAuth();

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }

    try {
      const res = await API.get("/api/cart/count", {
        headers: getAuthHeader(),
      });
      setCount(res.data?.count ?? 0);
    } catch (err) {
      console.error("Failed to fetch cart count", err);
      setCount(0);
    }
  }, [getAuthHeader, user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // 🔑 IMPORTANT: return BOTH
  return {
    count,
    refetch: fetchCount,
  };
}
