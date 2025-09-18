import { getToken } from "./getToken.js";

// Decode JWT token to get payload
export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Get current user ID from decoded token
export const getCurrentUserId = () => {
  const payload = decodeToken();
  /**
   * Because of some inconsistencies in naming conventions, I am checking for both 'userId' and 'id'.
   */
  return payload?.userId || payload?.id || null;
};
