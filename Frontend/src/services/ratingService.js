import api from "./api";

export const submitRating = (data) => api.post("/v1/ratings", data).then(r => r.data);
export const getRatingByOrder = (orderId) => api.get(`/v1/ratings/${orderId}`).then(r => r.data);
export const getRatingsByProduct = (productId) => api.get(`/v1/ratings?product_id=${productId}`).then(r => r.data);

