import api from "./api.js";

export const addActivityLog = async (log) => {
  try {
    const response = await api.post("/api/activities", log);
    return response.data;
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

export const getActivityLogs = async () => {
  try {
    const response = await api.get("/api/activities");
    return response.data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

export const deleteActivityLog = async (logId) => {
  try {
    const response = await api.delete(`/api/activities/${logId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting activity log:", error);
    throw error;
  }
};

export const deleteAllActivityLogs = async () => {
  try {
    const response = await api.delete("/api/activities");
    return response.data;
  } catch (error) {
    console.error("Error deleting all activity logs:", error);
    throw error;
  }
};
