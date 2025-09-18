import api from "./api.js";
import { socketManager } from "./socket.js";
import { getCurrentUserId } from "./utils/decodeToken.js";

export const addActivityLog = async (log) => {
  try {
    const response = await api.post("/api/activities", log);

    // Emit socket event for real-time tip display
    const userId = getCurrentUserId();
    if (userId && socketManager.isConnected) {
      socketManager.logActivity(userId, log.category, log.activity);
    }

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

export const getAverageEmissions = async () => {
  try {
    const response = await api.get("/api/activities/average-emissions");
    return response.data;
  } catch (error) {
    console.error("Error fetching average emissions:", error);
    throw error;
  }
};

export const getLeaderboard = async () => {
  try {
    const response = await api.get("/api/activities/leaderboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const getCurrentStreak = async () => {
  try {
    const response = await api.get("/api/streaks");
    return response.data;
  } catch (error) {
    console.error("Error fetching current streak:", error);
    throw error;
  }
};

export const getCurrentSummary = async () => {
  try {
    const response = await api.get("/api/summaries/current");
    return response.data;
  } catch (error) {
    console.error("Error fetching current summary:", error);
    throw error;
  }
};

export const getWeeklySummary = async (weekStart) => {
  try {
    const response = await api.get(`/api/summaries/${weekStart}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    throw error;
  }
};
