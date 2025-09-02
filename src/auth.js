import axios from "axios";
import { getToken } from "./utils/getToken";
const apiUrl = import.meta.env.VITE_API_URL;

export const register = async (email, username, password) => {
  try {
    const response = await axios.post(`${apiUrl}/api/register`, {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (identifier, password) => {
  try {
    const response = await axios.post(`${apiUrl}/api/login`, {
      identifier,
      password,
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const isCurrentUserLoggedIn = () => {
  return !!getToken();
};
