import { useContext }
from "react";

import {
  CartContext
} from "./cart-context";

const useCart = () =>
  useContext(CartContext);

export default useCart;