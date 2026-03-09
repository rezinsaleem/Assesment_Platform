import axios from "axios";

/**
 * Axios instance pre-configured with the API base URL.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const api = axios.create({
  baseURL: "https://assesment-platform-0t58.onrender.com/api",
});

// Attach token to every outgoing request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("user");
  if (raw) {
    const user = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
