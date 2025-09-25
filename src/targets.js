import {
  getActiveTarget,
  createTarget,
  updateTarget,
  deleteTarget,
  getTargetHistory,
  getCurrentSummary,
  getWeeklySummary,
} from "./logging.js";
import { renderTargetsView, renderTargetsError } from "./ui.js";
import Swal from "sweetalert2";

let currentTarget = null;
let targetHistory = [];
let currentSummary = null;
let historicalBaseline = null;

// Initialize targets functionality
export const initializeTargets = async () => {
  console.log("Initializing targets...");
  try {
    await loadActiveTarget();
    await loadTargetHistory();
    await loadCurrentSummary();

    // Calculate historical baseline for progress tracking
    historicalBaseline = await calculateBaselineFromHistory();

    renderTargetsView(
      currentTarget,
      targetHistory,
      currentSummary,
      historicalBaseline
    );

    // Setup event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      setupTargetEventListeners();
    }, 200);

    console.log("Targets initialized successfully", {
      currentTarget,
      targetHistory: targetHistory?.length,
      currentSummary,
      historicalBaseline,
    });
  } catch (error) {
    console.error("Error initializing targets:", error);
    renderTargetsError("Failed to load targets data");
  }
};

// Load active target
const loadActiveTarget = async () => {
  try {
    const response = await getActiveTarget("weekly");
    currentTarget = response.target;
  } catch (error) {
    if (error.response?.status === 404) {
      currentTarget = null;
    } else {
      throw error;
    }
  }
};

// Load target history
const loadTargetHistory = async () => {
  try {
    const response = await getTargetHistory("weekly");
    targetHistory = response.targets || [];
  } catch (error) {
    console.error("Error loading target history:", error);
    targetHistory = [];
  }
};

// Load current summary for progress tracking
const loadCurrentSummary = async () => {
  try {
    const response = await getCurrentSummary();
    currentSummary = response.summary;
  } catch (error) {
    console.error("Error loading current summary:", error);
    currentSummary = null;
  }
};

// Calculate baseline from historical weekly summaries
export const calculateBaselineFromHistory = async (weeksBack = 4) => {
  try {
    const historicalSummaries = [];
    const currentDate = new Date();

    for (let i = 1; i <= weeksBack; i++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(weekDate.getDate() - i * 7);

      // Get the start of that week (Monday)
      const startOfWeek = new Date(weekDate);
      startOfWeek.setDate(weekDate.getDate() - weekDate.getDay() + 1);

      const weekStart = startOfWeek.toISOString().split("T")[0];

      try {
        const response = await getWeeklySummary(weekStart);
        if (response.summary && response.summary.totalValue > 0) {
          historicalSummaries.push(response.summary.totalValue);
        }
      } catch (error) {
        // Skip weeks with no data
        console.log(`No data for week ${weekStart}`);
      }
    }

    // No historical data available
    if (historicalSummaries.length === 0) {
      return null;
    }

    // Calculate average emissions from historical weeks
    const averageEmissions =
      historicalSummaries.reduce((sum, emissions) => sum + emissions, 0) /
      historicalSummaries.length;
    return Math.round(averageEmissions * 100) / 100;
  } catch (error) {
    console.error("Error calculating baseline from history:", error);
    return null;
  }
};

// Show create target dialog
export const showCreateTargetDialog = async () => {
  const { value: formValues } = await Swal.fire({
    title: "Set Weekly Reduction Target",
    html: createTargetForm(),
    showCancelButton: true,
    confirmButtonText: "Create Target",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    width: "500px",
    customClass: { popup: "target-dialog" },
    preConfirm: validateTargetForm,
    didOpen: () => {
      setupTargetTypeHandler();
    },
  });

  if (formValues) {
    try {
      await createTarget(formValues);
      await initializeTargets();

      Swal.fire({
        icon: "success",
        title: "Target Created!",
        text: "Your weekly reduction target has been set successfully.",
        confirmButtonColor: "#10b981",
      });
    } catch (error) {
      console.error("Error creating target:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create target. Please try again.",
      });
    }
  }
};

export const showEditTargetDialog = async () => {
  if (!currentTarget) return;

  const { value: formValues } = await Swal.fire({
    title: "Edit Weekly Target",
    html: createTargetForm(currentTarget),
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    width: "500px",
    customClass: { popup: "target-dialog" },
    preConfirm: validateTargetForm,
    didOpen: () => {
      setupTargetTypeHandler();
    },
  });

  if (formValues) {
    try {
      await updateTarget(currentTarget._id, formValues);
      await initializeTargets();

      Swal.fire({
        icon: "success",
        title: "Target Updated!",
        text: "Your weekly reduction target has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating target:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update target. Please try again.",
      });
    }
  }
};

export const confirmDeleteTarget = async () => {
  if (!currentTarget) return;

  const result = await Swal.fire({
    title: "Delete Target?",
    text: "Are you sure you want to delete your current weekly reduction target?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
  });

  if (result.isConfirmed) {
    try {
      await deleteTarget(currentTarget._id);
      await initializeTargets();

      Swal.fire({
        icon: "success",
        title: "Target Deleted!",
        text: "Your weekly reduction target has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting target:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete target. Please try again.",
      });
    }
  }
};

// Helper functions
const createTargetForm = (target = null) => {
  const isEdit = !!target;
  return `
    <div class="target-form">
      <div class="form-group">
        <label for="target-type">Target Type:</label>
        <select id="target-type" class="swal2-input">
          <option value="percentage" ${
            isEdit && target.targetType === "percentage" ? "selected" : ""
          }>
            Percentage Reduction (%)
          </option>
          <option value="absolute" ${
            isEdit && target.targetType === "absolute" ? "selected" : ""
          }>
            Absolute Reduction (kg CO₂)
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="target-value">Target Value:</label>
        <input id="target-value" type="number" min="0.1" step="0.1" class="swal2-input" 
               placeholder="Enter value" value="${
                 isEdit ? target.targetValue : ""
               }">
        <small class="field-hint">For percentage targets, we'll automatically calculate your baseline from previous weeks' data.</small>
      </div>
      
      <div class="form-group">
        <label for="target-description">Description (optional):</label>
        <textarea id="target-description" class="swal2-textarea" rows="2" 
                  placeholder="e.g., Reduce car usage, eat less meat">${
                    isEdit ? target.description || "" : ""
                  }</textarea>
      </div>
      
      <div class="form-group">
        <label>Focus Categories (optional):</label>
        <div class="category-checkboxes">
          ${["transportation", "energy", "food", "waste", "shopping", "other"]
            .map(
              (cat) =>
                `<label>
              <input type="checkbox" value="${cat}" ${
                  isEdit && target.categories?.includes(cat) ? "checked" : ""
                }> 
              ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </label>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
};

const validateTargetForm = () => {
  const targetType = document.getElementById("target-type").value;
  const targetValue = parseFloat(document.getElementById("target-value").value);
  const description = document.getElementById("target-description").value;
  const categoryCheckboxes = document.querySelectorAll(
    '.category-checkboxes input[type="checkbox"]:checked'
  );
  const categories = Array.from(categoryCheckboxes).map((cb) => cb.value);

  if (!targetValue || targetValue <= 0) {
    Swal.showValidationMessage("Please enter a valid target value");
    return false;
  }

  if (targetType === "percentage" && targetValue > 100) {
    Swal.showValidationMessage("Percentage cannot exceed 100%");
    return false;
  }

  const result = {
    targetType,
    targetValue,
    description: description.trim() || undefined,
    categories: categories.length > 0 ? categories : undefined,
    targetPeriod: "weekly",
  };

  return result;
};

const setupTargetEventListeners = () => {
  console.log("Setting up target event listeners...");

  // Use event delegation on the targets content container
  const targetsContent = document.getElementById("targets-content");
  if (targetsContent) {
    // Remove existing delegated listener
    targetsContent.removeEventListener("click", handleTargetButtonClick);
    targetsContent.addEventListener("click", handleTargetButtonClick);
    console.log("Event delegation listener attached to targets-content");
  }

  // Also try direct listeners as backup
  setTimeout(() => {
    const createBtn = document.getElementById("create-target-btn");
    const editBtn = document.getElementById("edit-target-btn");
    const deleteBtn = document.getElementById("delete-target-btn");

    if (createBtn && !createBtn.hasAttribute("data-listener-attached")) {
      createBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Create button clicked");
        showCreateTargetDialog();
      });
      createBtn.setAttribute("data-listener-attached", "true");
      console.log("Create target button listener attached");
    }

    if (editBtn && !editBtn.hasAttribute("data-listener-attached")) {
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Edit button clicked");
        showEditTargetDialog();
      });
      editBtn.setAttribute("data-listener-attached", "true");
      console.log("Edit target button listener attached");
    }

    if (deleteBtn && !deleteBtn.hasAttribute("data-listener-attached")) {
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Delete button clicked");
        confirmDeleteTarget();
      });
      deleteBtn.setAttribute("data-listener-attached", "true");
      console.log("Delete target button listener attached");
    }
  }, 100);
};

// Event delegation handler for dynamically created buttons
const handleTargetButtonClick = (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  console.log("Button clicked via delegation:", target.id);

  event.preventDefault();
  event.stopPropagation();

  if (target.id === "create-target-btn") {
    console.log("Creating target via delegation");
    showCreateTargetDialog();
  } else if (target.id === "edit-target-btn") {
    console.log("Editing target via delegation");
    showEditTargetDialog();
  } else if (target.id === "delete-target-btn") {
    console.log("Deleting target via delegation");
    confirmDeleteTarget();
  }
};

// Setup target type change handler for form
const setupTargetTypeHandler = () => {
  // No longer needed - baseline field removed
};

// Export current target for use in other modules
export const getCurrentTarget = () => currentTarget;
export const getCurrentSummaryData = () => currentSummary;
