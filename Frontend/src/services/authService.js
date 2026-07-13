import api from "./api";

const persistAuth = (payload) => {
  const token = payload?.access_token;
  const user = payload?.user;
  // Simpan ke sessionStorage saja agar tiap tab terisolasi
  // (multi-tab login akun berbeda bisa berjalan bersamaan)
  if (token) sessionStorage.setItem("token", token);
  if (user)  sessionStorage.setItem("user", JSON.stringify(user));
};

export const login = async (credentials) => {
  const response = await api.post("/v1/auth/login", credentials);
  if (response.data.success) persistAuth(response.data.data);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post("/v1/auth/register", data);
  if (response.data.success) persistAuth(response.data.data);
  return response.data;
};


export const forgotPassword = (email) =>
  api.post("/v1/auth/forgot-password", { email }).then(r => r.data);

export const resetPassword = (data) =>
  api.post("/v1/auth/reset-password", data).then(r => r.data);

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; }
};

export const getToken = () => sessionStorage.getItem("token");
export const isAuthenticated = () => !!sessionStorage.getItem("token");
