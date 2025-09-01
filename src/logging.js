// API functionality for interacting with backend for logs
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// Request interceptor: attach auth token if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: log responses and errors
axios.interceptors.response.use(
  (response) => {
    console.log("API Response:", response);
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    if (error.response && error.response.status === 401) {
    // e.g., clear auth token and reload page to trigger re-auth
    localStorage.removeItem("authToken");
    window.location.reload();
    }
    return Promise.reject(error);
  }
);

