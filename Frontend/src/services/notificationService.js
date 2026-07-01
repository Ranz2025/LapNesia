import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/v1/notifications");
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/v1/notifications/unread");
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get("/v1/notifications/unread-count");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/v1/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put("/v1/notifications/read-all");
  return response.data;
};
