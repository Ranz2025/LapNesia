import api from "./api";

const unwrap = (response) => response.data;

export const getReturns = async () => {
  const res = await api.get("/v1/returns");
  return unwrap(res);
};

export const getReturn = async (id) => {
  const res = await api.get(`/v1/returns/${id}`);
  return unwrap(res);
};

export const requestReturn = async (orderId, reason) => {
  const res = await api.post("/v1/returns", { order_id: orderId, reason });
  return unwrap(res);
};

export const updateReturnStatus = async (id, status, sellerNotes = "") => {
  const res = await api.put(`/v1/returns/${id}/status`, { status, seller_notes: sellerNotes });
  return unwrap(res);
};

export const submitReturnResi = async (id, resi) => {
  const res = await api.put(`/v1/returns/${id}/resi`, { return_resi: resi });
  return unwrap(res);
};
