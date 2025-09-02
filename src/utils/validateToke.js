import api from "../api";

const isTokenValid = async () => {
  try {
    const response = await api.get("/api/validate");
    return response.data.valid;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

export { isTokenValid };
