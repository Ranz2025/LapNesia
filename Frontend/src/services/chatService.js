import api from "./api";

export const getChatRooms = () => api.get("/v1/chat");

export const getChatRoom = (roomId) => api.get(`/v1/chat/${roomId}/room`);

export const startChat = (userId, productId = null) =>
  api.post("/v1/chat/start", { user_id: userId, product_id: productId });

export const getMessages = (roomId, page = 1) =>
  api.get(`/v1/chat/${roomId}/messages`, { params: { page } });

export const sendMessage = (roomId, body) =>
  api.post(`/v1/chat/${roomId}/messages`, { body });
