export const CART_UPDATED_EVENT = "cart-updated";

export const emitCartUpdate = () => {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};
