// API functionality for interacting with backend for logs
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
import { getToken } from "./utils/getToken.js";

// Request interceptor: attach auth token if available
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
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

const addActivityLog = async (log) => {
  try {
    const response = await axios.post(`${apiUrl}/activities`, log);
    return response.data;
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

const getActivityLogs = async () => {
  try {
    const response = await axios.get(`${apiUrl}/activities`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

const deleteActivityLog = async (logId) => {
  try {
    await axios.delete(`${apiUrl}/activities/${logId}`);
  } catch (error) {
    console.error("Error deleting activity log:", error);
    throw error;
  }
};

const deleteAllActivityLogs = async () => {
  try {
    await axios.delete(`${apiUrl}/activities`);
  } catch (error) {
    console.error("Error deleting all activity logs:", error);
    throw error;
  }
};
