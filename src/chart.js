import {
  calculateEmissionsByCategory,
  formatEmissions,
} from "./calculations.js";
import Chart from "chart.js/auto";

const CATEGORY_COLORS = {
  Transport: "#ff5722",
  Food: "#ff9800",
  Energy: "#9c27b0",
  Waste: "#795548",
  Water: "#00bcd4",
  Shopping: "#e91e63",
};

let dashboardChartInstance = null;
let averageChartInstance = null;

export const renderEmissionsChart = (logs, chartContainer, legendContainer) => {
  if (logs.length === 0) {
    renderNoDataMessage(chartContainer, legendContainer, false);
    return;
  }

  const categoryTotals = calculateEmissionsByCategory(logs);
  const categories = Object.keys(categoryTotals);

  if (categories.length === 0) {
    renderNoDataMessage(chartContainer, legendContainer, false);
    return;
  }

  // Prepare data for Chart.js
  const data = {
    labels: categories,
    datasets: [
      {
        data: categories.map((category) => categoryTotals[category]),
        backgroundColor: categories.map(
          (category) => CATEGORY_COLORS[category]
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBackgroundColor: categories.map((category) => {
          // Create a lighter version of the color for hover
          const color = CATEGORY_COLORS[category];
          return color + "CC"; // Add transparency
        }),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 4,
        hoverOffset: 15,
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false, // Create custom legend instead
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const category = context.label;
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${category}: ${formatEmissions(value)} (${percentage}%)`;
            },
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#4caf50",
          borderWidth: 1,
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: "easeOutQuart",
        delay: (context) => {
          return context.dataIndex * 100;
        },
      },
    },
  };

  // Get canvas element
  const canvas = chartContainer.querySelector("#emissions-chart");
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
  }

  // Add shadow effect to the chart
  const ctx = canvas.getContext("2d");
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  dashboardChartInstance = new Chart(canvas, config);
  renderCustomLegend(categoryTotals, legendContainer);
};

const renderCustomLegend = (categoryTotals, legendContainer) => {
  const total = Object.values(categoryTotals).reduce(
    (sum, value) => sum + value,
    0
  );

  const legendHTML = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => {
      const percentage = ((value / total) * 100).toFixed(1);
      return `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${
            CATEGORY_COLORS[category]
          }"></div>
          <span class="legend-text">${category}: ${formatEmissions(
        value
      )} (${percentage}%)</span>
        </div>
      `;
    })
    .join("");

  legendContainer.innerHTML = legendHTML;
};

const renderNoDataMessage = (
  chartContainer,
  legendContainer,
  isAverage = false
) => {
  // Determine which chart instance to destroy and which canvas to clear
  const chartSelector = isAverage
    ? "#average-emissions-chart"
    : "#emissions-chart";

  if (isAverage && averageChartInstance) {
    averageChartInstance.destroy();
    averageChartInstance = null;
  } else if (!isAverage && dashboardChartInstance) {
    dashboardChartInstance.destroy();
    dashboardChartInstance = null;
  }

  const canvas = chartContainer.querySelector(chartSelector);
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Show no data message
  legendContainer.innerHTML = `
    <div class="no-data-message">
      <i class="fa-solid fa-chart-pie"></i>
      <p>No emissions data available. Start logging activities to see your breakdown!</p>
    </div>
  `;
};

export const renderAverageEmissionsChart = (
  averageEmissionsData,
  chartContainer,
  legendContainer
) => {
  console.log(
    "Starting renderAverageEmissionsChart with data:",
    averageEmissionsData
  );

  if (!averageEmissionsData || averageEmissionsData.length === 0) {
    console.warn("No average emissions data provided");
    renderNoDataMessage(chartContainer, legendContainer, true);
    return;
  }

  // Convert array of objects to category-based object
  const categoryAverages = {};
  averageEmissionsData.forEach((item) => {
    categoryAverages[item.category] = item.averageEmission;
  });

  const categories = Object.keys(categoryAverages);
  console.log("Categories from average data:", categories);

  if (categories.length === 0) {
    console.warn("No categories found in average emissions data");
    renderNoDataMessage(chartContainer, legendContainer, true);
    return;
  }

  // Prepare data for Chart.js
  const data = {
    labels: categories,
    datasets: [
      {
        data: categories.map((category) => categoryAverages[category]),
        backgroundColor: categories.map(
          (category) => CATEGORY_COLORS[category] || "#999999"
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBackgroundColor: categories.map((category) => {
          // Create a lighter version of the color for hover
          const color = CATEGORY_COLORS[category] || "#999999";
          return color + "CC"; // Add transparency
        }),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 4,
        hoverOffset: 15,
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false, // Create custom legend instead
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const category = context.label;
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${category}: ${formatEmissions(value)} (${percentage}%)`;
            },
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#4caf50",
          borderWidth: 1,
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: "easeOutQuart",
        delay: (context) => {
          return context.dataIndex * 100;
        },
        onProgress: function (animation) {
          // Add progress animation for the average chart
          const chart = animation.chart;
          const ctx = chart.ctx;
          const centerX = chart.width / 2;
          const centerY = chart.height / 2;

          ctx.save();
          ctx.fillStyle = "#4caf5044";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "20px Quicksand";

          const progress = Math.min(
            Math.floor((animation.currentStep / animation.numSteps) * 100),
            100
          );
          if (progress < 100) {
            ctx.fillText(`${progress}%`, centerX, centerY);
          }
          ctx.restore();
        },
      },
    },
  };

  const canvas = document.getElementById("average-emissions-chart");
  if (!canvas) {
    console.error("Average emissions chart canvas not found!");
    return;
  }
  console.log("Found canvas:", canvas);

  if (averageChartInstance) {
    console.log("Destroying previous average chart instance");
    averageChartInstance.destroy();
  }

  // Add shadow effect to the chart
  const ctx = canvas.getContext("2d");
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  console.log(
    "Creating new average chart with data:",
    categories,
    categoryAverages
  );
  averageChartInstance = new Chart(canvas, config);
  renderAverageLegend(categoryAverages, legendContainer);
};

const renderAverageLegend = (categoryAverages, legendContainer) => {
  const total = Object.values(categoryAverages).reduce(
    (sum, value) => sum + value,
    0
  );

  const legendHTML = Object.entries(categoryAverages)
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => {
      const percentage = ((value / total) * 100).toFixed(1);
      return `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${
            CATEGORY_COLORS[category] || "#999999"
          }"></div>
          <span class="legend-text">${category}: ${formatEmissions(
        value
      )} (${percentage}%)</span>
        </div>
      `;
    })
    .join("");

  legendContainer.innerHTML = legendHTML;
};

export { CATEGORY_COLORS };
