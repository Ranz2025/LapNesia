import api from "./api";

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)    params.append("search", filters.search);
  if (filters.brand)     params.append("brand", filters.brand);
  if (filters.category)  params.append("category", filters.category);
  if (filters.min_price) params.append("min_price", filters.min_price);
  if (filters.max_price) params.append("max_price", filters.max_price);
  if (filters.sort)      params.append("sort", filters.sort);
  if (filters.page)      params.append("page", filters.page);
  const query = params.toString();
  const response = await api.get(`/v1/products${query ? `?${query}` : ""}`);
  return response.data;
};

export const getAllProducts = async (filters = {}) => {
  // Per-page sudah 50 di backend, satu request cukup untuk semua produk
  const res = await getProducts({ ...filters, page: 1 });
  return res;
};

export const getProductBySlug = (slug) =>
  api.get(`/v1/products/${slug}`).then(r => r.data);

export const getSellerProducts = () =>
  api.get("/v1/seller/products").then(r => r.data);

export const getSellerProduct = (id) =>
  api.get(`/v1/seller/products/${id}`).then(r => r.data);

export const createProduct = (data) =>
  api.post("/v1/seller/products", data).then(r => r.data);

export const updateProduct = (id, data) =>
  api.put(`/v1/seller/products/${id}`, data).then(r => r.data);

/** Archive instead of hard-delete (BR-16) */
export const archiveProduct = (id) =>
  api.put(`/v1/seller/products/${id}/archive`).then(r => r.data);
