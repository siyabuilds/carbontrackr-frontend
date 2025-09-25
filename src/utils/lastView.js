const LAST_VIEW_KEY = "carbontrackr_last_view";
const VALID_VIEWS = [
  "dashboard",
  "average",
  "leaderboard",
  "streak",
  "summaries",
  "targets",
];
const DEFAULT_VIEW = "dashboard";

// Save the last viewed section to localStorage
export const saveLastView = (viewType) => {
  // Only save if it's a valid view type
  if (VALID_VIEWS.includes(viewType)) {
    localStorage.setItem(LAST_VIEW_KEY, viewType);
  }
};

// Get the last viewed section from localStorage
export const getLastView = () => {
  const lastView = localStorage.getItem(LAST_VIEW_KEY);
  // Return the saved view if it's valid, otherwise return default
  return VALID_VIEWS.includes(lastView) ? lastView : DEFAULT_VIEW;
};

// Clear the last view from localStorage
export const clearLastView = () => {
  localStorage.removeItem(LAST_VIEW_KEY);
};

// Get all valid views
export const getValidViews = () => {
  return [...VALID_VIEWS];
};
