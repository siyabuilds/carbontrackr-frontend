import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onTipReceived = null; // Callback for tip display
    this.pendingUserId = null; // Store userId to register user after connection
    this.registeredUserId = null; // Keep track of registered user for reconnections
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
      const userIdToRegister = this.pendingUserId || this.registeredUserId;
      if (userIdToRegister) {
        this.socket.emit("register-user", userIdToRegister);
        console.log(`Registered user: ${userIdToRegister}`);
        this.registeredUserId = userIdToRegister;
        this.pendingUserId = null; // Clear pending registration
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.isConnected = false;
      this.pendingUserId = null; // Clear any pending registration
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
      this.registeredUserId = userId;
    } else if (this.socket) {
      // Store userId to register once connected
      this.pendingUserId = userId;
      console.log(`User registration pending connection: ${userId}`);
    } else {
      console.error("Socket not initialized. Cannot register user.");
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
      this.pendingUserId = null;
      this.registeredUserId = null;
      console.log("Socket disconnected");
    }
  }
}

// Create and export a singleton instance
export const socketManager = new SocketManager();
