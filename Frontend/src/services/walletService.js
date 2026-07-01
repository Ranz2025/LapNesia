import api from "./api";

export const walletService = {
  getWallet: async () => {
    const response = await api.get("/v1/wallet");
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get("/v1/wallet/transactions");
    return response.data;
  },

  withdraw: async (data) => {
    const response = await api.post("/v1/withdrawals", data);
    return response.data;
  },
};

export default walletService;
