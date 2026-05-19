import {
  useEffect,
  useState,
  useCallback,
} from "react";

import API from "@/api";

import {
  CartContext
} from "./cart-context";


export const CartProvider = ({
  children,
}) => {
    
    const [cart, setCart] =
    useState([]);
    
    const [loading, setLoading] =
    useState(false);
    
    const refreshCart =
    useCallback(async () => {
        
        try {
            setLoading(true);
            
            const res =
            await API.get("/api/cart");
            
            setCart(
                res.data?.items || []
            );

      } catch (err) {
          console.error(
          "Cart fetch failed",
          err
        );
      } finally {
          setLoading(false);
        }
        
    }, []);
    
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);
    
  const cartCount =
    cart.reduce(
      (acc, item) =>
        acc + item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        refreshCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

