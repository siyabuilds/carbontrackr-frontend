import { activityData } from "./activity-data";
import { showActivityForm } from "../form";
import { calculateTotalEmissions } from "./calculations";
import {
  addActivityLog,
  getActivityLogs,
  deleteActivityLog,
  deleteAllActivityLogs,
  getAverageEmissions,
  getLeaderboard,
  getCurrentStreak,
  getCurrentSummary,
} from "./logging.js";
import {
  renderActivityLogs,
  renderTotalEmissions,
  renderCategoryBreakdown,
  confirmDeleteActivity,
  confirmClearAllActivities,
  renderLeaderboard,
  renderCurrentSummary,
  renderSummaryError,
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
import { saveLastView, getLastView, clearLastView } from "./utils/lastView.js";
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
        clearLastView(); // Clear last view on session expiry
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

  // Get the last view from localStorage, fallback to dashboard
  const lastView = getLastView();

  // Initialize with the last viewed section
  toggleView(lastView);
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

  // Hamburger menu toggle
  document
    .getElementById("hamburger-menu")
    .addEventListener("click", toggleMobileMenu);

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

  // Leaderboard view
  document
    .getElementById("leaderboard-btn")
    .addEventListener("click", () => toggleView("leaderboard"));

  // Streak view
  document
    .getElementById("streak-btn")
    .addEventListener("click", () => toggleView("streak"));

  // Summaries view
  document
    .getElementById("summaries-btn")
    .addEventListener("click", () => toggleView("summaries"));
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

// Toggle mobile hamburger menu
const toggleMobileMenu = () => {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const headerNav = document.querySelector(".header-nav");
  const headerActions = document.querySelector(".header-actions");

  hamburgerMenu.classList.toggle("open");
  headerNav.classList.toggle("open");
  headerActions.classList.toggle("open");
};

// Toggle between dashboard and average emissions views
const toggleView = async (viewType) => {
  console.log(`Switching to view: ${viewType}`);

  // Save the current view to localStorage for authenticated users
  if (isCurrentUserLoggedIn()) {
    saveLastView(viewType);
  }

  // Close mobile menu when a view is selected
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const headerNav = document.querySelector(".header-nav");
  const headerActions = document.querySelector(".header-actions");

  if (hamburgerMenu.classList.contains("open")) {
    hamburgerMenu.classList.remove("open");
    headerNav.classList.remove("open");
    headerActions.classList.remove("open");
  }

  // Hide all view sections first
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Update toggle buttons - remove active class from all
  document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (viewType === "dashboard") {
    document.getElementById("dashboard-btn").classList.add("active");
    const dashboardView = document.getElementById("dashboard-view");
    dashboardView.classList.add("active");
    updateDisplay();
  } else if (viewType === "average") {
    document.getElementById("average-btn").classList.add("active");
    const averageView = document.getElementById("average-view");
    averageView.classList.add("active");
    setTimeout(() => {
      fetchAndDisplayAverageEmissions();
    }, 100);
  } else if (viewType === "leaderboard") {
    document.getElementById("leaderboard-btn").classList.add("active");
    const leaderboardView = document.getElementById("leaderboard-view");
    leaderboardView.classList.add("active");
    setTimeout(() => {
      fetchAndDisplayLeaderboard();
    }, 100);
  } else if (viewType === "streak") {
    document.getElementById("streak-btn").classList.add("active");
    const streakView = document.getElementById("streak-view");
    streakView.classList.add("active");
    setTimeout(() => {
      fetchAndDisplayStreak();
    }, 100);
  } else if (viewType === "summaries") {
    document.getElementById("summaries-btn").classList.add("active");
    const summariesView = document.getElementById("summaries-view");
    summariesView.classList.add("active");
    setTimeout(() => {
      fetchAndDisplaySummary();
    }, 100);
  }
};

// Fetch and display streak data
const fetchAndDisplayStreak = async () => {
  const streakContent = document.querySelector("#streak-view .streak-content");
  if (!streakContent) return;
  streakContent.innerHTML = `<div class='loading-indicator'><i class='fa-solid fa-circle-notch fa-spin'></i><p>Loading streak...</p></div>`;
  try {
    const data = await getCurrentStreak();
    renderStreak(data, streakContent);
  } catch (error) {
    streakContent.innerHTML = `<div class='no-data-message'><i class='fa-solid fa-triangle-exclamation'></i><p>Failed to load streak data.</p></div>`;
  }
};

// Render streak row
const renderStreak = (data, container) => {
  if (!data || !Array.isArray(data.streak)) {
    container.innerHTML = `<div class='no-data-message'><i class='fa-solid fa-triangle-exclamation'></i><p>No streak data available.</p></div>`;
    return;
  }
  const days = Array.isArray(data.streak) ? data.streak.slice(-7) : [];
  const daysRow = days
    .map(
      (day) => `
  <div class="streak-day${day.active ? " active" : " inactive"}" title="${
        day.date
      }">
          <span class="streak-day-date">${day.date.slice(5)}</span>
          <span class="streak-day-icon">
            <i class="fa-solid ${day.active ? "fa-check" : "fa-xmark"}"></i>
          </span>
        </div>
      `
    )
    .join("");
  container.innerHTML = `
    <div class="streak-row">
      ${daysRow}
    </div>
    <div class="streak-current">
      <span>Current Streak: <strong>${data.currentStreak}</strong> days</span>
    </div>
  `;
};

// Fetch and display leaderboard data
const fetchAndDisplayLeaderboard = async () => {
  const container = document.getElementById("leaderboard-table-container");
  container.innerHTML = `<div class="loading-indicator"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Loading leaderboard...</p></div>`;
  try {
    const leaderboardData = await getLeaderboard();
    renderLeaderboard(leaderboardData, container);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    container.innerHTML = `<div class="no-data-message"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load leaderboard data.</p></div>`;
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

    renderAverageEmissionsChart(averageData, chartContainer, legendContainer);
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

// Fetch and display summary data
const fetchAndDisplaySummary = async () => {
  const summariesContent = document.querySelector(
    "#summaries-view .summaries-content"
  );
  if (!summariesContent) return;

  // Reset all sections to hidden state and show loading
  const loadingIndicator = summariesContent.querySelector(".loading-indicator");
  const summaryCards = summariesContent.querySelector(".summary-cards-grid");
  const categorySection = summariesContent.querySelector(
    ".category-analysis-section"
  );
  const tipCard = summariesContent.querySelector(".tip-card");
  const noDataMessage = summariesContent.querySelector(".no-data-message");

  // Hide all sections and show loading
  if (summaryCards) summaryCards.style.display = "none";
  if (categorySection) categorySection.style.display = "none";
  if (tipCard) tipCard.style.display = "none";
  if (noDataMessage) noDataMessage.style.display = "none";
  if (loadingIndicator) loadingIndicator.style.display = "block";

  try {
    const summaryData = await getCurrentSummary();
    renderCurrentSummary(summaryData, summariesContent);
  } catch (error) {
    console.error("Failed to fetch summary data:", error);
    renderSummaryError(summariesContent, "Unable to load your weekly summary");
  }
};
