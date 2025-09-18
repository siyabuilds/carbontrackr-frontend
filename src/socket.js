import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onTipReceived = null; // Callback for tip display
  }

  setTipCallback(callback) {
    this.onTipReceived = callback;
  }

  connect() {
    // Get the server URL from environment or use default
    const serverUrl = import.meta.env.VITE_API_URL;

    this.socket = io(serverUrl, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.isConnected = false;
    });

    // Listen for tip responses
    this.socket.on("tip-response", (tipData) => {
      if (this.onTipReceived) {
        this.onTipReceived(tipData);
      }
    });

    return this.socket;
  }

  registerUser(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("register-user", userId);
      console.log(`Registered user: ${userId}`);
    } else {
      console.error("Socket not connected. Cannot register user.");
    }
  }

  logActivity(userId, category, activity) {
    if (this.socket && this.isConnected) {
      this.socket.emit("activity-logged", {
        userId,
        category,
        activity,
      });
      console.log(
        `Activity logged: ${category} - ${activity} for user ${userId}`
      );
    } else {
      console.error("Socket not connected. Cannot log activity.");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log("Socket disconnected");
    }
  }
}

// Create and export a singleton instance
export const socketManager = new SocketManager();
