// UI rendering for activity logs and emissions display
import {
  formatEmissions,
  calculateEmissionsByCategory,
} from "./calculations.js";
import Swal from "sweetalert2";

export const createActivityLogElement = (log, index) => {
  const logItem = document.createElement("div");
  logItem.className = "activity-log-item";

  // Create activity info section
  const activityInfo = document.createElement("div");
  activityInfo.className = "activity-info";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = `category-badge ${log.category.toLowerCase()}`;
  categoryBadge.textContent = log.category;

  const activityName = document.createElement("span");
  activityName.className = "activity-name";
  activityName.textContent = log.activity;

  const timestamp = document.createElement("span");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date(log.date).toLocaleDateString();

  activityInfo.appendChild(categoryBadge);
  activityInfo.appendChild(activityName);
  activityInfo.appendChild(timestamp);

  // Create emissions section
  const activityEmissions = document.createElement("div");
  activityEmissions.className = "activity-emissions";

  const co2Value = document.createElement("span");
  co2Value.className = "co2-value";
  co2Value.textContent = formatEmissions(log.co2);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.setAttribute("data-index", index);
  deleteBtn.setAttribute("title", "Delete activity");
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

  activityEmissions.appendChild(co2Value);
  activityEmissions.appendChild(deleteBtn);

  logItem.appendChild(activityInfo);
  logItem.appendChild(activityEmissions);

  return logItem;
};

export const renderActivityLogs = (logs, container) => {
  // Clear existing activity items but keep the no-activities message
  const activityItems = container.querySelectorAll(".activity-log-item");
  activityItems.forEach((item) => item.remove());

  const noActivitiesMsg = container.querySelector(".no-activities");

  if (logs.length === 0) {
    if (noActivitiesMsg) {
      noActivitiesMsg.style.display = "block";
    }
    return;
  }

  // Hide no activities message
  if (noActivitiesMsg) {
    noActivitiesMsg.style.display = "none";
  }

  // Add activity items
  logs.forEach((log, index) => {
    container.appendChild(createActivityLogElement(log, index));
  });
};

export const renderTotalEmissions = (totalEmissions, container) => {
  const totalValueElement = container.querySelector(".total-value");
  if (totalValueElement) {
    totalValueElement.textContent = formatEmissions(totalEmissions);
  }
};

export const renderCategoryBreakdown = (logs, container) => {
  const categoryTotals = calculateEmissionsByCategory(logs);
  const categories = Object.keys(categoryTotals);

  if (categories.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Create heading if it doesn't exist
  let heading = container.querySelector("h3");
  if (!heading) {
    heading = document.createElement("h3");
    heading.textContent = "Emissions by Category";
    container.appendChild(heading);
  }

  // Remove existing breakdown if it exists
  const existingBreakdown = container.querySelector(".category-breakdown");
  if (existingBreakdown) {
    existingBreakdown.remove();
  }

  // Create new breakdown
  const breakdownDiv = document.createElement("div");
  breakdownDiv.className = "category-breakdown";

  categories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";

    const categoryName = document.createElement("span");
    categoryName.className = "category-name";
    categoryName.textContent = category;

    const categoryEmissions = document.createElement("span");
    categoryEmissions.className = "category-emissions";
    categoryEmissions.textContent = formatEmissions(categoryTotals[category]);

    categoryItem.appendChild(categoryName);
    categoryItem.appendChild(categoryEmissions);
    breakdownDiv.appendChild(categoryItem);
  });

  container.appendChild(breakdownDiv);
};

export const confirmDeleteActivity = async (activityName) => {
  return Swal.fire({
    title: "Delete Activity?",
    text: `Are you sure you want to delete "${activityName}"? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
  }).then((result) => result.isConfirmed);
};

export const confirmClearAllActivities = async () => {
  return Swal.fire({
    title: "Clear All Data?",
    text: "Are you sure you want to clear all activity data? This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
  }).then((result) => result.isConfirmed);
};

// Render leaderboard table
export const renderLeaderboard = (data, container) => {
  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `<div class="no-data-message"><i class="fa-solid fa-seedling"></i><p>No leaderboard data available.</p></div>`;
    return;
  }
  let html = `<table class="leaderboard-table">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Full Name</th>
        <th>Username</th>
        <th>Total Emissions (kg CO₂)</th>
        <th>Activity Count</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) => `
            <tr>
              <td>${row.rank}</td>
              <td>${row.fullName}</td>
              <td>@${row.username}</td>
              <td>${row.totalEmissions.toFixed(2)}</td>
              <td>${row.activityCount}</td>
            </tr>
          `
        )
        .join("")}
    </tbody>
  </table>`;
  container.innerHTML = html;
};
