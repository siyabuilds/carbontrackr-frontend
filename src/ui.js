// UI rendering for activity logs and emissions display
import {
  formatEmissions,
  calculateEmissionsByCategory,
} from "./calculations.js";
import Swal from "sweetalert2";

export const displayActivityTip = (tipData) => {
  const { emissionLevel, tipType, message, allTips, category, activity } =
    tipData;

  // Determine SWAL type based on emission level
  const isPositive = emissionLevel === "low";
  const swalType = isPositive ? "success" : "info";
  const title = isPositive ? "Great Choice! 🌱" : "Eco-Friendly Tip 💡";

  // Create the main message
  let htmlContent = `
    <div style="text-align: left;">
      <p><strong>Activity:</strong> ${category} - ${activity}</p>
      <p><strong>Tip:</strong> ${message}</p>
  `;

  // If there are multiple tips (improvement case), show them
  if (Array.isArray(allTips) && allTips.length > 1) {
    htmlContent += `
      <details style="margin-top: 15px;">
        <summary style="cursor: pointer; font-weight: bold; color: #3085d6;">
          View All Tips
        </summary>
        <ul style="margin-top: 10px; padding-left: 20px;">
          ${allTips
            .map((tip) => `<li style="margin: 5px 0;">${tip}</li>`)
            .join("")}
        </ul>
      </details>
    `;
  }

  htmlContent += "</div>";

  Swal.fire({
    title: title,
    html: htmlContent,
    icon: swalType,
    confirmButtonText: "Got it!",
    confirmButtonColor: isPositive ? "#28a745" : "#3085d6",
    timer: isPositive ? 6000 : 8000,
    timerProgressBar: true,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
    customClass: {
      container: "tip-alert-container",
      popup: "tip-alert-popup",
    },
  });
};

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

// Summary rendering functions
export const renderCurrentSummary = (summaryData, container) => {
  const loadingIndicator = container.querySelector(".loading-indicator");
  const summaryCards = container.querySelector(".summary-cards-grid");
  const categorySection = container.querySelector(".category-analysis-section");
  const tipCard = container.querySelector(".tip-card");
  const noDataMessage = container.querySelector(".no-data-message");

  // Hide loading indicator
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }

  if (!summaryData || !summaryData.summary) {
    // Show no data message
    if (noDataMessage) {
      noDataMessage.style.display = "block";
    }
    return;
  }

  const summary = summaryData.summary;

  // Render basic summary cards
  renderSummaryCards(summary, summaryCards);

  // Render category analysis
  renderCategoryAnalysis(summary, categorySection);

  // Render personalized tip
  renderPersonalizedTip(summary, tipCard);
};

const renderSummaryCards = (summary, container) => {
  if (!container) return;

  // Update total emissions
  const totalEmissionsEl = document.getElementById("summary-total-emissions");
  if (totalEmissionsEl) {
    totalEmissionsEl.textContent = `${summary.totalValue.toFixed(2)} kg`;
  }

  // Update activities count
  const activitiesCountEl = document.getElementById("summary-activities-count");
  if (activitiesCountEl) {
    activitiesCountEl.textContent = summary.activitiesCount.toString();
  }

  // Update week period
  const weekPeriodEl = document.getElementById("summary-week-period");
  if (weekPeriodEl) {
    const startDate = new Date(summary.weekStart).toLocaleDateString();
    const endDate = new Date(summary.weekEnd).toLocaleDateString();
    weekPeriodEl.textContent = `${startDate} - ${endDate}`;
    weekPeriodEl.style.fontSize = "1.2rem";
  }

  container.style.display = "grid";
};

const renderCategoryAnalysis = (summary, container) => {
  if (!container) return;

  const highestCard = document.getElementById("highest-category-card");
  const lowestCard = document.getElementById("lowest-category-card");

  // Render highest emission category
  if (summary.highestEmissionCategory && highestCard) {
    const highest = summary.highestEmissionCategory;

    document.getElementById("highest-category-name").textContent =
      highest.category;
    document.getElementById("highest-category-emissions").textContent =
      highest.emissions.toFixed(2);
    document.getElementById("highest-category-count").textContent =
      highest.activityCount.toString();

    highestCard.style.display = "block";
  }

  // Render lowest emission category
  if (summary.lowestEmissionCategory && lowestCard) {
    const lowest = summary.lowestEmissionCategory;

    document.getElementById("lowest-category-name").textContent =
      lowest.category;
    document.getElementById("lowest-category-emissions").textContent =
      lowest.emissions.toFixed(2);
    document.getElementById("lowest-category-count").textContent =
      lowest.activityCount.toString();

    lowestCard.style.display = "block";
  }

  // Show the category analysis section if we have data
  if (summary.highestEmissionCategory || summary.lowestEmissionCategory) {
    container.style.display = "grid";
  }
};

const renderPersonalizedTip = (summary, container) => {
  if (!container || !summary.personalizedTip) return;

  const tip = summary.personalizedTip;

  // Update tip category badge
  const tipCategoryEl = document.getElementById("tip-category");
  if (tipCategoryEl) {
    tipCategoryEl.textContent = tip.category;
  }

  // Update tip title with appropriate icon
  const tipTitleEl = document.getElementById("tip-title");
  if (tipTitleEl) {
    const icon =
      tip.tipType === "positive"
        ? '<i class="fa-solid fa-thumbs-up"></i>'
        : '<i class="fa-solid fa-lightbulb"></i>';
    const title = tip.tipType === "positive" ? "Great Job!" : "Improvement Tip";
    tipTitleEl.innerHTML = `${icon} ${title}`;
  }

  // Update tip message
  const tipMessageEl = document.getElementById("tip-message");
  if (tipMessageEl) {
    tipMessageEl.textContent = tip.message;
  }

  // Apply appropriate styling based on tip type
  if (tip.tipType === "improvement") {
    container.classList.add("improvement");
  } else {
    container.classList.remove("improvement");
  }

  container.style.display = "block";
};

export const renderSummaryError = (
  container,
  errorMessage = "Failed to load summary data"
) => {
  const loadingIndicator = container.querySelector(".loading-indicator");
  const noDataMessage = container.querySelector(".no-data-message");

  // Hide loading indicator
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }

  // Show error message
  if (noDataMessage) {
    noDataMessage.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${errorMessage}</p>
      <p>Please try again later or contact support if the problem persists.</p>
    `;
    noDataMessage.style.display = "block";
  }
};

// Target rendering functions
export const renderTargetsView = (
  currentTarget,
  targetHistory,
  currentSummary,
  historicalBaseline = null
) => {
  const container = document.getElementById("targets-content");
  if (!container) return;

  // Hide loading indicator
  const loadingIndicator = container.querySelector(".loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }

  // Render current target section
  renderCurrentTarget(container, currentTarget);

  // Render progress section
  renderTargetProgress(
    container,
    currentTarget,
    currentSummary,
    historicalBaseline
  );

  // Render history section
  renderTargetHistory(container, targetHistory);
};

const renderCurrentTarget = (container, currentTarget) => {
  const currentTargetSection = container.querySelector(
    ".current-target-section"
  );
  if (!currentTargetSection) return;

  if (!currentTarget) {
    currentTargetSection.innerHTML = `
      <div class="no-target-message">
        <i class="fa-solid fa-bullseye"></i>
        <h3>No Active Target</h3>
        <p>Set a weekly reduction target to start tracking your progress!</p>
        <button id="create-target-btn" class="create-target-btn">
          <i class="fa-solid fa-plus"></i> Set Weekly Target
        </button>
      </div>
    `;
  } else {
    const typeIcon =
      currentTarget.targetType === "percentage"
        ? "fa-percentage"
        : "fa-weight-hanging";
    const typeLabel =
      currentTarget.targetType === "percentage"
        ? "Percentage Reduction"
        : "Absolute Reduction";
    const valueText =
      currentTarget.targetType === "percentage"
        ? `${currentTarget.targetValue}%`
        : `${currentTarget.targetValue} kg CO₂`;

    currentTargetSection.innerHTML = `
      <div class="active-target-card">
        <div class="target-header">
          <h3><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</h3>
          <div class="target-actions">
            <button id="edit-target-btn" class="edit-btn" title="Edit Target">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button id="delete-target-btn" class="delete-btn" title="Delete Target">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="target-details">
          <div class="target-value">
            <span class="value">${valueText}</span>
            <span class="label">Weekly Target</span>
          </div>
          
          ${
            currentTarget.description
              ? `
            <div class="target-description">
              ${currentTarget.description}
            </div>
          `
              : ""
          }
          
          ${
            currentTarget.categories && currentTarget.categories.length > 0
              ? `
            <div class="target-categories">
              <strong>Focus Areas:</strong>
              <div class="category-tags">
                ${currentTarget.categories
                  .map(
                    (cat) => `<span class="category-tag ${cat}">${cat}</span>`
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <div class="target-meta">
            Created: ${new Date(currentTarget.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }
};

const renderTargetProgress = (
  container,
  currentTarget,
  currentSummary,
  historicalBaseline = null
) => {
  const progressSection = container.querySelector(".target-progress-section");
  if (!progressSection || !currentTarget) {
    if (progressSection) progressSection.style.display = "none";
    return;
  }

  const progress = calculateTargetProgress(
    currentTarget,
    currentSummary,
    historicalBaseline
  );
  if (!progress) {
    progressSection.innerHTML = `
      <div class="progress-placeholder">
        <i class="fa-solid fa-chart-line"></i>
        <p>Progress tracking will appear here once you log some activities this week.</p>
      </div>
    `;
    progressSection.style.display = "block";
    return;
  }

  // Determine colors and status based on progress and negative reduction
  let progressColor = "#4caf50"; // Green for good progress
  let statusText = "In Progress";
  let statusIcon = "fa-clock";
  let reductionCardClass = "";

  if (progress.isNegativeReduction) {
    progressColor = "#f44336"; // Red for negative reduction (more emissions than baseline - target)
    statusText = "Above Baseline ⚠️";
    statusIcon = "fa-exclamation-triangle";
    reductionCardClass = "negative-reduction";
  } else if (progress.isOnTrack) {
    statusText = "Target Achieved ✨";
    statusIcon = "fa-check-circle";
  } else if (progress.progress > 100) {
    statusText = "Exceeding Target 🚀";
    statusIcon = "fa-trophy";
    progressColor = "#2196f3"; // Blue for exceeding
  } else if (progress.progress < 50) {
    progressColor = "#ff9800"; // Orange for behind target
  }

  // Determine the type of target for display
  const targetTypeText =
    currentTarget.targetType === "percentage"
      ? `${currentTarget.targetValue}% Reduction`
      : `${currentTarget.targetValue} kg Reduction`;

  progressSection.innerHTML = `
    <div class="progress-card">
      <div class="progress-header">
        <h3><i class="fa-solid fa-chart-line"></i> Weekly Progress</h3>
        <div class="progress-status ${
          progress.isNegativeReduction ? "negative" : ""
        }">
          <i class="fa-solid ${statusIcon}"></i> ${statusText}
        </div>
      </div>
      
      <div class="progress-content">
        <div class="target-info">
          <div class="target-type">
            <i class="fa-solid fa-bullseye"></i>
            <span>${targetTypeText}</span>
          </div>
          <div class="progress-percentage ${
            progress.isNegativeReduction ? "negative" : ""
          }">${progress.progress.toFixed(1)}%</div>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(
              Math.abs(progress.progress),
              100
            )}%; background: ${progressColor}"></div>
          </div>
        </div>
        
        <div class="progress-metrics">
          <div class="progress-metric">
            <span class="metric-value">${progress.currentEmissions} kg</span>
            <span class="metric-label">Current Emissions</span>
          </div>
          <div class="progress-metric">
            <span class="metric-value">${progress.targetEmissions} kg</span>
            <span class="metric-label">Target Emissions</span>
          </div>
          <div class="progress-metric">
            <span class="metric-value">${progress.baseline} kg</span>
            <span class="metric-label">${
              historicalBaseline ? "Historical Avg" : "Baseline"
            }</span>
          </div>
          <div class="progress-metric ${reductionCardClass}">
            <span class="metric-value ${
              progress.isNegativeReduction ? "negative" : ""
            }">${progress.reductionAchieved >= 0 ? "+" : ""}${
    progress.reductionAchieved
  } kg</span>
            <span class="metric-label">Reduction Achieved</span>
          </div>
        </div>
      </div>
    </div>
  `;

  progressSection.style.display = "block";
};

const renderTargetHistory = (container, targetHistory) => {
  const historySection = container.querySelector(".target-history-section");
  if (!historySection) return;

  if (!targetHistory || targetHistory.length === 0) {
    historySection.innerHTML = `
      <div class="no-history-message">
        <i class="fa-solid fa-history"></i>
        <p>No target history available yet.</p>
      </div>
    `;
    return;
  }

  const historyItems = targetHistory
    .slice(0, 5)
    .map((target) => {
      const typeIcon =
        target.targetType === "percentage"
          ? "fa-percentage"
          : "fa-weight-hanging";
      const valueText =
        target.targetType === "percentage"
          ? `${target.targetValue}%`
          : `${target.targetValue} kg CO₂`;
      const statusIcon = target.isActive ? "fa-check-circle" : "fa-circle";
      const statusText = target.isActive ? "Active" : "Completed";

      return `
      <div class="history-item ${target.isActive ? "active" : ""}">
        <div class="history-icon">
          <i class="fa-solid ${typeIcon}"></i>
        </div>
        <div class="history-content">
          <div class="history-main">
            <span class="history-value">${valueText}</span>
            <span class="history-period">${target.targetType} reduction</span>
          </div>
          <div class="history-meta">
            <span class="history-date">${new Date(
              target.createdAt
            ).toLocaleDateString()}</span>
            <span class="history-status ${
              target.isActive ? "active" : "completed"
            }">
              <i class="fa-solid ${statusIcon}"></i> ${statusText}
            </span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  historySection.innerHTML = `
    <h3><i class="fa-solid fa-history"></i> Target History</h3>
    <div class="history-list">
      ${historyItems}
    </div>
  `;
};

const calculateTargetProgress = (
  currentTarget,
  currentSummary,
  historicalBaseline = null
) => {
  if (!currentTarget || !currentSummary) return null;

  const currentEmissions = currentSummary.totalValue || 0;
  let progress = 0;
  let targetEmissions = 0;
  let baseline = 0;

  if (currentTarget.targetType === "percentage") {
    // For percentage reduction, use historical baseline or reasonable fallback
    baseline = historicalBaseline || Math.max(currentEmissions * 1.2, 10); // At least 20% higher than current or minimum 10kg

    // Calculate target emissions based on percentage reduction from baseline
    targetEmissions = baseline * (1 - currentTarget.targetValue / 100);

    // Calculate progress: how much reduction we've achieved vs target reduction
    const actualReduction = baseline - currentEmissions; // Can be negative
    const targetReduction = baseline - targetEmissions;

    if (targetReduction > 0) {
      progress = (actualReduction / targetReduction) * 100;
    } else {
      progress = currentEmissions <= targetEmissions ? 100 : 0;
    }
  } else {
    // Absolute target - targetValue is the amount to reduce
    baseline =
      historicalBaseline || currentEmissions + currentTarget.targetValue;
    targetEmissions = Math.max(0, baseline - currentTarget.targetValue);

    const actualReduction = baseline - currentEmissions; // Can be negative
    progress =
      currentTarget.targetValue > 0
        ? (actualReduction / currentTarget.targetValue) * 100
        : 0;
  }

  // Allow negative progress to show when emissions exceed baseline
  progress = Math.max(-100, Math.min(200, progress));

  const actualReduction = baseline - currentEmissions;
  const targetReduction = baseline - targetEmissions;
  const isNegativeReduction = actualReduction < 0; // More emissions than baseline

  return {
    progress: Math.round(progress * 10) / 10, // Round to 1 decimal place
    currentEmissions: Math.round(currentEmissions * 100) / 100,
    targetEmissions: Math.round(Math.max(0, targetEmissions) * 100) / 100,
    baseline: Math.round(baseline * 100) / 100,
    isOnTrack: currentEmissions <= targetEmissions,
    reductionAchieved: Math.round(actualReduction * 100) / 100, // Can be negative
    reductionTarget: Math.round(targetReduction * 100) / 100,
    isNegativeReduction: isNegativeReduction,
  };
};

export const renderTargetsError = (message = "Failed to load targets data") => {
  const container = document.getElementById("targets-content");
  if (!container) return;

  const loadingIndicator = container.querySelector(".loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }

  container.innerHTML = `
    <div class="error-message">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${message}</p>
      <button onclick="window.location.reload()" class="retry-btn">
        <i class="fa-solid fa-refresh"></i> Try Again
      </button>
    </div>
  `;
};
