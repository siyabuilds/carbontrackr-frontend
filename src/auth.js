import api from "./api.js";
import { getToken } from "./utils/getToken";
import { clearLastView } from "./utils/lastView.js";

export const register = async (email, username, password, fullName) => {
  try {
    const response = await api.post("/api/register", {
      email,
      username,
      password,
      fullName,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const login = async (identifier, password) => {
  try {
    const response = await api.post("/api/login", {
      email: identifier,
      username: identifier,
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
  clearLastView();
};

export const isCurrentUserLoggedIn = () => {
  return !!getToken();
};
