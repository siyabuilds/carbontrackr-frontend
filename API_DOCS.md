# API & Module Documentation

This document provides a complete reference for the CarbonTrackr frontend app, including all modules, public functions, and API endpoints.

---

## 📦 Modules Overview

- **main.js**: App entry point, event flow, and initialization
- **activity-data.js**: Emission factors for all activities
- **calculations.js**: Emission calculations and formatting
- **api.js**: Axios instance, request/response interceptors, auth token handling
- **auth.js**: User authentication (register, login, logout, session check)
- **authEvents.js**: Auth form validation, event listeners, and state management
- **logging.js**: CRUD for activity logs, leaderboard, and averages (API sync)
- **ui.js**: UI rendering for logs, totals, breakdowns, and leaderboard
- **chart.js**: Chart.js integration for emissions and averages
- **filter.js**: Category filtering utilities and UI
- **form.js**: Modal activity form (SweetAlert2)
- **utils/**: Token management and validation

---

## 🌐 API Endpoints (via logging.js & auth.js)

### Activity Log Endpoints

- `POST   /api/activities` → Add a new activity log
- `GET    /api/activities` → Get all activity logs for user
- `DELETE /api/activities/:id` → Delete a specific activity log
- `DELETE /api/activities` → Delete all activity logs
- `GET    /api/activities/average-emissions` → Get average emissions by category (all users)
- `GET    /api/activities/leaderboard` → Get leaderboard data

### Auth Endpoints

- `POST   /api/register` → Register a new user
- `POST   /api/login` → Login (returns JWT token)
- `GET    /api/validate` → Validate JWT token

---

## 🛠️ Public Functions by Module

### main.js

- `initializeApp()` — App startup, auth check, and event listeners
- `setupEventListeners()` — Button and view event bindings
- `setupFilterComponent()` — Renders category filter dropdown
- `updateDisplay()` — Updates all UI with current data
- `handleAddActivity()` — Modal form for new activity
- `handleDeleteActivity(event)` — Delete activity by index
- `handleClearAll()` — Clear all activities

### activity-data.js

- `activityData` — Object of all categories and activities with emission factors

### calculations.js

- `calculateTotalEmissions(logs)` — Sum total CO₂ for logs
- `calculateEmissionsByCategory(logs)` — Group emissions by category
- `formatEmissions(value)` — Format value as "X.XX kg CO₂"

### api.js

- `api` — Preconfigured Axios instance with:
  - Auth token injection (request interceptor)
  - 401 auto-logout (response interceptor)

### auth.js

- `register(email, username, password, fullName)` — Register user
- `login(identifier, password)` — Login (username or email)
- `logout()` — Remove token
- `isCurrentUserLoggedIn()` — Check for token

### authEvents.js

- `setupAuthEventListeners(container)` — Tab switching, form submit
- `setupLogoutEventListener(logoutBtn)` — Logout button

### logging.js

- `addActivityLog(log)` — Add activity (POST)
- `getActivityLogs()` — Get all activities (GET)
- `deleteActivityLog(logId)` — Delete by ID (DELETE)
- `deleteAllActivityLogs()` — Delete all (DELETE)
- `getAverageEmissions()` — Get average emissions (GET)
- `getLeaderboard()` — Get leaderboard (GET)

### ui.js

- `createActivityLogElement(log, index)` — DOM for activity log
- `renderActivityLogs(logs, container)` — Render logs list
- `renderTotalEmissions(total, container)` — Show total
- `renderCategoryBreakdown(logs, container)` — Show breakdown
- `confirmDeleteActivity(activityName)` — SweetAlert2 confirm
- `confirmClearAllActivities()` — SweetAlert2 confirm
- `renderLeaderboard(data, container)` — Leaderboard table

### chart.js

- `renderEmissionsChart(logs, chartContainer, legendContainer)` — Dashboard chart
- `renderAverageEmissionsChart(data, chartContainer, legendContainer)` — Average chart
- `renderCustomLegend(categoryTotals, legendContainer)` — Custom legend
- `renderNoDataMessage(chartContainer, legendContainer, isAverage)` — No data UI
- `CATEGORY_COLORS` — Category color map

### filter.js

- `getCategories()` — List all categories
- `filterLogsByCategory(logs, selectedCategory)` — Filter logs
- `createFilterComponent(categories, onFilterChange)` — Dropdown UI

### form.js

- `showActivityForm(activityData)` — Modal form (SweetAlert2)

### utils/

- `getToken()` — Get JWT from localStorage
- `isTokenValid()` — Validate token with backend

---

## 🗂️ Data Structures

### ActivityLog

```js
{
  category: string,    // e.g. "Transport"
  activity: string,    // e.g. "Car (10km)"
  co2: number,         // CO₂ in kg
  date: string         // ISO timestamp
}
```

### CategoryTotals

```js
{
  [category: string]: number // e.g. { Transport: 5.2, Food: 3.8 }
}
```

### EmissionFactor

```js
number; // CO₂ in kg per activity unit
```

---

## 💡 Usage Examples

### Add a New Activity

```js
const log = {
  category: "Transport",
  activity: "Car (10km)",
  co2: 2.4,
  date: new Date().toISOString(),
};
await addActivityLog(log);
updateDisplay();
```

### Filter Activities

```js
const transportLogs = filterLogsByCategory(activityLogs, "Transport");
const allLogs = filterLogsByCategory(activityLogs, "All");
```

### Calculate Emissions

```js
const total = calculateTotalEmissions(activityLogs);
const breakdown = calculateEmissionsByCategory(activityLogs);
```

### Render Chart

```js
renderEmissionsChart(activityLogs, chartContainer, legendContainer);
```

---

## 🔄 Event System

- `click` on `#add-activity-btn` → `handleAddActivity()`
- `click` on `#clear-all-btn` → `handleClearAll()`
- `click` on `.delete-btn` → `handleDeleteActivity()`
- `change` on category filter → filter update
- `authStateChanged` (CustomEvent) → login/logout UI switch

---

## 🔐 Authentication Flow

- User submits login or registration form (email/username & password)
- JWT token stored in localStorage
- All API requests include token (see `api.js`)
- 401 responses trigger auto-logout and UI reset

---

## 🏆 Leaderboard & Averages

- `getLeaderboard()` fetches ranked user emissions
- `getAverageEmissions()` fetches average emissions by category
- Both visualized in dashboard views

---
