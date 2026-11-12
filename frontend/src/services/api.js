import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("moviemate-token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export function listFrom(response) {
  return Array.isArray(response.data) ? response.data : response.data.results || [];
}

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
  }
  return error?.message || "Something went wrong. Please try again.";
}

export default api;
