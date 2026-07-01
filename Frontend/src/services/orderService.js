import api from "./api";

export const getOrders = async () => {
  const response = await api.get("/v1/orders");
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/v1/orders/${id}`);
  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post("/v1/orders", data);
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`/v1/orders/${id}/cancel`);
  return response.data;
};

export const confirmReceived = async (id) => {
  const response = await api.put(`/v1/orders/${id}/confirm-received`);
  return response.data;
};

export const payOrder = async (orderId) => {
  const response = await api.post(`/v1/orders/${orderId}/pay`);
  return response.data;
};

export const shipOrder = async (orderId, resiNumber) => {
  const response = await api.put(`/v1/orders/${orderId}/ship`, { resi_number: resiNumber });
  return response.data;
};

export const updateShippingAddress = async (orderId, shippingAddress) => {
  const response = await api.put(`/v1/orders/${orderId}/shipping-address`, { shipping_address: shippingAddress });
  return response.data;
};
