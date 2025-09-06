import { activityData } from "./activity-data";
import { showActivityForm } from "../form";
import { calculateTotalEmissions } from "./calculations";
import {
  addActivityLog,
  getActivityLogs,
  deleteActivityLog,
  deleteAllActivityLogs,
  getAverageEmissions,
} from "./logging.js";
import {
  renderActivityLogs,
  renderTotalEmissions,
  renderCategoryBreakdown,
  confirmDeleteActivity,
  confirmClearAllActivities,
} from "./ui";
import {
  getCategories,
  filterLogsByCategory,
  createFilterComponent,
} from "./filter";
import { renderEmissionsChart, renderAverageEmissionsChart } from "./chart.js";
import { register, login, logout, isCurrentUserLoggedIn } from "./auth.js";
import {
  setupAuthEventListeners,
  setupLogoutEventListener,
} from "./authEvents.js";
import { isTokenValid } from "./utils/validateToke.js";
import Swal from "sweetalert2";

let activityLogs = [];
let selectedCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

const initializeApp = async () => {
  // Setup auth event listeners
  const authContainer = document.getElementById("auth-container");
  const logoutBtn = document.getElementById("logout-btn");

  setupAuthEventListeners(authContainer);
  setupLogoutEventListener(logoutBtn);

  if (isCurrentUserLoggedIn()) {
    const valid = await isTokenValid();
    if (valid) {
      showMainApp();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
      }).then(() => {
        localStorage.removeItem("token");
        showAuthUI();
      });
    }
  } else {
    showAuthUI();
  }

  // Listen for auth state changes
  window.addEventListener("authStateChanged", (event) => {
    if (event.detail.loggedIn) {
      showMainApp();
    } else {
      showAuthUI();
    }
  });
};

const showAuthUI = () => {
  document.body.className = "show-auth";
};

const showMainApp = () => {
  document.body.className = "show-main";
  setupEventListeners();
  setupFilterComponent();

  // Hide all views initially
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
  });

  // load activity logs from backend and update UI
  fetchAndUpdateLogs();

  // Initialize dashboard view as active
  toggleView("dashboard");
};

const fetchAndUpdateLogs = async () => {
  try {
    activityLogs = await getActivityLogs();
    activityLogs = activityLogs.map((log) => ({ ...log, co2: log.value }));
  } catch (error) {
    console.error("Failed to load activity logs from backend:", error);
    activityLogs = [];
  }
  updateDisplay();
};

const setupEventListeners = () => {
  // Add activity button
  document
    .getElementById("add-activity-btn")
    .addEventListener("click", handleAddActivity);

  // Clear all data button
  document
    .getElementById("clear-all-btn")
    .addEventListener("click", handleClearAll);

  // Activity log delete buttons (event delegation)
  document
    .getElementById("activity-logs")
    .addEventListener("click", handleDeleteActivity);

  /**
   * View toggle buttons
   */

  // Dashboard view
  document
    .getElementById("dashboard-btn")
    .addEventListener("click", () => toggleView("dashboard"));

  // Average emissions view
  document
    .getElementById("average-btn")
    .addEventListener("click", () => toggleView("average"));
};

const handleAddActivity = async () => {
  const log = await showActivityForm(activityData);
  if (log) {
    log.date = new Date().toISOString();
    try {
      await addActivityLog(log);
      await fetchAndUpdateLogs();
    } catch (error) {
      console.error("Failed to add activity log:", error);
    }
  }
};

const handleDeleteActivity = async (event) => {
  if (event.target.closest(".delete-btn")) {
    const index = parseInt(event.target.closest(".delete-btn").dataset.index);
    const activity = activityLogs[index];
    const confirmed = await confirmDeleteActivity(activity.activity);

    if (confirmed) {
      try {
        const id = activity.id || activity._id || null;
        if (id) {
          await deleteActivityLog(id);
        } else {
          // fallback: request server to clear then reload (or just reload)
          console.warn("Activity missing id; reloading logs from backend");
        }
        await fetchAndUpdateLogs();
      } catch (error) {
        console.error("Failed to delete activity log:", error);
      }
    }
  }
};

const handleClearAll = async () => {
  const confirmed = await confirmClearAllActivities();

  if (confirmed) {
    try {
      await deleteAllActivityLogs();
      await fetchAndUpdateLogs();
    } catch (error) {
      console.error("Failed to clear all activity logs:", error);
    }
  }
};

const updateDisplay = () => {
  const totalEmissions = calculateTotalEmissions(activityLogs);
  renderTotalEmissions(
    totalEmissions,
    document.getElementById("total-emissions")
  );

  const filteredLogs = filterLogsByCategory(activityLogs, selectedCategory);
  renderActivityLogs(filteredLogs, document.getElementById("activity-logs"));
  renderCategoryBreakdown(
    filteredLogs,
    document.getElementById("category-breakdown")
  );

  // Toggle visual summary section based on filtered logs
  const visualSummarySection = document.getElementById("visual-summary");
  if (filteredLogs.length === 0) {
    visualSummarySection.style.display = "none";
  } else {
    visualSummarySection.style.display = "block";
    const chartContainer = document.querySelector(".chart-container");
    const legendContainer = document.getElementById("chart-legend");
    if (chartContainer && legendContainer) {
      renderEmissionsChart(filteredLogs, chartContainer, legendContainer);
    }
  }
};

// Setup filter component
const setupFilterComponent = () => {
  const activitiesSection = document.querySelector(".activities-section");
  const activitiesHeading = activitiesSection.querySelector("h2");

  const categories = getCategories();
  const filterComponent = createFilterComponent(categories, (category) => {
    selectedCategory = category;
    updateDisplay();
  });

  activitiesHeading.insertAdjacentElement("afterend", filterComponent);
};

// Toggle between dashboard and average emissions views
const toggleView = async (viewType) => {
  console.log(`Switching to view: ${viewType}`);

  // Hide all view sections first
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Update toggle buttons - remove active class from all
  document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (viewType === "dashboard") {
    // Activate dashboard
    document.getElementById("dashboard-btn").classList.add("active");
    const dashboardView = document.getElementById("dashboard-view");
    dashboardView.classList.add("active");
    console.log("Dashboard view activated:", dashboardView);
    updateDisplay();
  } else if (viewType === "average") {
    // Activate average emissions
    document.getElementById("average-btn").classList.add("active");
    const averageView = document.getElementById("average-view");
    averageView.classList.add("active");
    console.log("Average view activated:", averageView);

    // Force a small delay to ensure the view is rendered before we try to access the canvas
    setTimeout(() => {
      fetchAndDisplayAverageEmissions();
    }, 100);
  }
};

// Fetch and display average emissions data
const fetchAndDisplayAverageEmissions = async () => {
  // Show loading state
  const legendContainer = document.getElementById("average-chart-legend");
  legendContainer.innerHTML = `
    <div class="loading-indicator">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>Loading average emissions data...</p>
    </div>
  `;

  try {
    let averageData = await getAverageEmissions();
    // Get the chart container
    const chartContainer = document.querySelector(
      "#average-view .chart-container"
    );
  } catch (error) {
    console.error("Failed to fetch average emissions:", error);
    // Show error message in the average view
    document.getElementById("average-chart-legend").innerHTML = `
      <div class="no-data-message">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Failed to load average emissions data.</p>
      </div>
    `;
  }
};
