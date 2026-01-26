import API from "@/api";

export const createShiprocketOrder = (orderId) =>
  API.post(`/shiprocket/${orderId}/create`);

export const generateAWB = (orderId) =>
  API.post(`/shiprocket/${orderId}/awb`);

export const generateManifest = (orderId) =>
  API.post(`/shiprocket/${orderId}/manifest`);

export const trackShipment = (orderId) =>
  API.get(`/shiprocket/${orderId}/track`);
