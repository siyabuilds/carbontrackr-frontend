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
- **logging.js**: CRUD for activity logs, leaderboard, averages, streaks, and summaries (API sync)
- **ui.js**: UI rendering for logs, totals, breakdowns, leaderboard, and tips
- **chart.js**: Chart.js integration for emissions and averages
- **filter.js**: Category filtering utilities and UI
- **form.js**: Modal activity form (SweetAlert2)
- **socket.js**: WebSocket management for real-time features and activity tips
- **targets.js**: Reduction target management, CRUD operations, and UI integration
- **utils/**: Token management, validation, view persistence, and user ID extraction

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

### Streak Endpoints

- `GET    /api/streaks` → Get 7-day activity streak for authenticated user

### Summary Endpoints

- `GET    /api/summaries/current` → Get current week summary for authenticated user
- `GET    /api/summaries/:weekStart` → Get summary for specific week (ISO date format)

### Reduction Target Endpoints

- `GET    /api/targets` → Get active reduction target for authenticated user
- `POST   /api/targets` → Create a new reduction target
- `PUT    /api/targets/:id` → Update an existing reduction target
- `DELETE /api/targets/:id` → Delete (deactivate) a reduction target
- `GET    /api/targets/history` → Get all reduction targets for user (including inactive)

---

## 🔌 WebSocket Events (via socket.js)

### Real-time Communication

The app includes WebSocket support for real-time features like activity tips and notifications.

### Client Events (Emit)

- `register-user` → Register user ID for personalized events
- `activity-logged` → Notify server of new activity for tip generation

### Server Events (Listen)

- `tip-response` → Receive personalized tips after logging activities
- `connect` → Socket connection established
- `disconnect` → Socket connection lost
- `connect_error` → Socket connection failed

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
- `getCurrentStreak()` — Get 7-day activity streak (GET)
- `getCurrentSummary()` — Get current week summary (GET)
- `getWeeklySummary(weekStart)` — Get summary for specific week (GET)
- `getActiveTarget(period)` — Get active reduction target (GET)
- `createTarget(targetData)` — Create new reduction target (POST)
- `updateTarget(targetId, targetData)` — Update existing target (PUT)
- `deleteTarget(targetId)` — Delete (deactivate) target (DELETE)
- `getTargetHistory(period)` — Get target history (GET)

### ui.js

- `createActivityLogElement(log, index)` — DOM for activity log
- `renderActivityLogs(logs, container)` — Render logs list
- `renderTotalEmissions(total, container)` — Show total
- `renderCategoryBreakdown(logs, container)` — Show breakdown
- `confirmDeleteActivity(activityName)` — SweetAlert2 confirm
- `confirmClearAllActivities()` — SweetAlert2 confirm
- `renderLeaderboard(data, container)` — Leaderboard table
- `renderTargetsView(currentTarget, targetHistory, currentSummary, historicalBaseline)` — Render complete targets view
- `renderTargetsError(message)` — Render error message for targets section

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

### socket.js

- `socketManager` — Singleton WebSocket manager with methods:
  - `connect()` — Establish WebSocket connection
  - `registerUser(userId)` — Register user for personalized events
  - `logActivity(userId, category, activity)` — Emit activity for tip generation
  - `setTipCallback(callback)` — Set callback for tip responses
  - `disconnect()` — Close WebSocket connection

### targets.js

- `initializeTargets()` — Initialize targets functionality and load data
- `showCreateTargetDialog()` — Display SweetAlert2 modal for creating targets
- `showEditTargetDialog()` — Display modal for editing existing targets
- `confirmDeleteTarget()` — Show confirmation dialog for target deletion
- `setupTargetEventListeners()` — Set up event listeners for target buttons
- `getCurrentTarget()` — Get currently active target data
- `getCurrentSummaryData()` — Get current summary data for progress calculations

### utils/

- `getToken()` — Get JWT from localStorage
- `isTokenValid()` — Validate token with backend
- `decodeToken()` — Decode JWT to get payload
- `getCurrentUserId()` — Extract user ID from JWT token
- `saveLastView(viewType)` — Save last viewed section to localStorage
- `getLastView()` — Get last viewed section from localStorage
- `clearLastView()` — Clear last view from localStorage

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

### StreakData

```js
{
  streak: Array<{ date: string, active: boolean }>, // 7-day streak array
  currentStreak: number // Current consecutive streak count
}
```

### SummaryData

```js
{
  summary: {
    _id: string,
    userId: string,
    weekStart: string, // ISO date
    totalEmissions: number,
    categoryBreakdown: { [category: string]: number },
    activityCount: number,
    createdAt: string,
    updatedAt: string
  }
}
```

### TipData

```js
{
  tip: string,
  category: string,
  userId: string
}
```

### ReductionTarget

```js
{
  _id: string,
  userId: string,
  targetType: "percentage" | "absolute", // Type of reduction target
  targetValue: number, // Percentage (0-100) or absolute value in kg CO₂
  description?: string, // Optional target description
  targetPeriod: "weekly" | "monthly", // Target timeframe
  categories?: string[], // Optional array of focus categories
  isActive: boolean, // Whether target is currently active
  createdAt: string, // ISO timestamp
  updatedAt: string  // ISO timestamp
}
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

### Create Reduction Target

```js
const targetData = {
  targetType: "percentage", // or "absolute"
  targetValue: 20, // 20% reduction or 20kg CO₂ reduction
  description: "Reduce transport emissions by cycling more",
  targetPeriod: "weekly",
  categories: ["Transport", "Food"], // Optional focus areas
};
await createTarget(targetData);
```

### Update Target Progress

```js
const activeTarget = await getActiveTarget("weekly");
const currentSummary = await getCurrentSummary();
// Progress calculation handled automatically in UI
renderTargetsView(activeTarget.target, [], currentSummary.summary);
```

---

## 🔄 Event System

- `click` on `#add-activity-btn` → `handleAddActivity()`
- `click` on `#clear-all-btn` → `handleClearAll()`
- `click` on `.delete-btn` → `handleDeleteActivity()`
- `change` on category filter → filter update
- `authStateChanged` (CustomEvent) → login/logout UI switch
- `click` on `#create-target-btn` → `showCreateTargetDialog()`
- `click` on `#edit-target-btn` → `showEditTargetDialog()`
- `click` on `#delete-target-btn` → `confirmDeleteTarget()`

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

## 🎯 Reduction Targets & Progress Tracking

- Set weekly or monthly emission reduction goals
- Choose between percentage reduction (relative to baseline) or absolute reduction (fixed kg CO₂)
- Track progress with visual indicators and calculations
- Target history maintains record of all goals (active and inactive)
- Automatic progress calculations against current week's emissions
- Integration with weekly analysis jobs for automated insights

### Target Types

- **Percentage Target**: Reduce emissions by X% compared to historical baseline
- **Absolute Target**: Reduce emissions by X kg CO₂ from current levels
- **Categories**: Optionally focus on specific emission categories (Transport, Food, etc.)
- **Periods**: Weekly or monthly goal timeframes

---
