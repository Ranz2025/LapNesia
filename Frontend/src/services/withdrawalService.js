import api from "./api";

export const getWithdrawals = async () => {
  const response = await api.get("/v1/withdrawals");
  return response.data;
};

export const getWithdrawal = async (id) => {
  const response = await api.get(`/v1/withdrawals/${id}`);
  return response.data;
};

export const createWithdrawal = async (data) => {
  const response = await api.post("/v1/withdrawals", data);
  return response.data;
};