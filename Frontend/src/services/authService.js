import api from "./api";

const persistAuth = (payload) => {
  const token = payload?.access_token;
  const user = payload?.user;
  if (token) {
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
  }
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem("user", serialized);
    sessionStorage.setItem("user", serialized);
  }
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
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

export const getToken = () => localStorage.getItem("token");
export const isAuthenticated = () => !!localStorage.getItem("token");
