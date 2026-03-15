// src/api/shipping.js
import API from "@/api";

/* ─────────────────────────────────────────────
   All paths match your backend shiprocketRoutes.js:
   router is mounted at /api/shipping
───────────────────────────────────────────── */

/**
 * Create a Shiprocket order for an internal order
 * POST /api/shipping/order/:orderId/create
 * Admin only
 */
export const createShiprocketOrder = (orderId) =>
  API.post(`/api/shipping/order/${orderId}/create`);

/**
 * Assign courier and generate AWB
 * POST /api/shipping/order/:orderId/awb
 * Admin only
 */
export const generateAWB = (orderId) =>
  API.post(`/api/shipping/order/${orderId}/awb`);

/**
 * Bulk generate manifest
 * POST /api/shipping/manifest
 * Body: { shipmentIds: [123, 456] }
 * Admin only
 */
export const generateManifest = (shipmentIds) =>
  API.post(`/api/shipping/manifest`, { shipmentIds });

/**
 * Cancel a shipment
 * POST /api/shipping/order/:orderId/cancel
 * Admin only
 */
export const cancelShipment = (orderId) =>
  API.post(`/api/shipping/order/${orderId}/cancel`);

/**
 * Generate shipping label PDF
 * GET /api/shipping/label/:shipmentId
 * Admin only
 */
export const generateLabel = (shipmentId) =>
  API.get(`/api/shipping/label/${shipmentId}`);

/**
 * Get full shipment details for an order
 * GET /api/shipping/order/:orderId
 * Admin only
 */
export const getShipment = (orderId) =>
  API.get(`/api/shipping/order/${orderId}`);

/**
 * Live tracking by AWB — user facing
 * GET /api/shipping/track/:awb
 * Authenticated
 */
export const getTracking = (awb) =>
  API.get(`/api/shipping/track/${awb}`);

// Alias used in OrderDetails and TrackOrder components
export const trackShipment = getTracking;

/**
 * Get stored tracking timeline for an order
 * GET /api/shipping/order/:orderId/timeline
 * Authenticated
 */
export const getTrackingTimeline = (orderId) =>
  API.get(`/api/shipping/order/${orderId}/timeline`);

/**
 * Manually refresh tracking from Shiprocket (admin)
 * POST /api/shipping/track/refresh/:awb
 * Admin only
 */
export const refreshTracking = (awb) =>
  API.post(`/api/shipping/track/refresh/${awb}`);

/**
 * Check serviceability for a pincode pair (admin)
 * GET /api/shipping/serviceability?pickup=&delivery=&weight=&cod=
 * Admin only
 */
export const checkServiceability = ({ pickup, delivery, weight = 0.5, cod = false }) =>
  API.get(`/api/shipping/serviceability`, {
    params: { pickup, delivery, weight, cod },
  });