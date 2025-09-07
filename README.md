# CarbonTrackr

Track, visualize, and reduce your personal carbon footprint with CarbonTrackr—a modern, responsive web app for eco-conscious living.

## 🚀 Features

- **Activity Logging:** Log daily activities across six categories: Transport, Food, Energy, Waste, Water, and Shopping.
- **Real-Time Calculations:** Instantly see your total and category-based CO₂ emissions.
- **Interactive Charts:** Visualize your impact with dynamic charts powered by Chart.js.
- **Filtering:** Filter your activity logs by category for focused insights.
- **Leaderboard:** See how your emissions compare to others.
- **Authentication:** Secure login and registration with JWT-based sessions.
- **Persistent Storage:** All data is saved and loaded from a backend API.
- **Responsive UI:** Works seamlessly on desktop and mobile devices.
- **Modern UX:** Modal forms, smooth transitions, and a clean, accessible design.

## 🏗️ Project Structure

```
carbontrackr-frontend/
├── index.html           # Main HTML file
├── form.js              # Modal form logic
├── package.json         # Project dependencies
├── public/              # Static assets (images, icons)
└── src/                 # Source code
    ├── activity-data.js   # Emissions data for activities
    ├── api.js            # Axios instance and API interceptors
    ├── auth.js           # Authentication logic
    ├── authEvents.js     # Auth event listeners
    ├── calculations.js   # Emission calculation functions
    ├── chart.js          # Chart rendering
    ├── filter.js         # Category filtering
    ├── logging.js        # Activity log CRUD and backend sync
    ├── main.js           # App entry point and flow
    ├── style.css         # App styling
    ├── ui.js             # UI rendering helpers
    └── utils/            # Utility functions (token, validation)
```

## 🛠️ Tech Stack

- **JavaScript (ES6 modules)**
- **Vite** (build tool)
- **Chart.js** (visualization)
- **SweetAlert2** (modals)
- **Axios** (API requests)
- **CSS3** (custom properties, responsive design)

## 📊 How It Works

1. **Sign Up / Log In:** Authenticate securely to access your dashboard.
2. **Log Activities:** Add activities via a user-friendly modal form.
3. **Visualize Impact:** See your total and per-category emissions, plus interactive charts.
4. **Filter & Analyze:** Filter logs by category, view averages, and compare on the leaderboard.
5. **Data Sync:** All changes are saved to and loaded from the backend API.

## � API & Core Modules

See [API_DOCS.md](API_DOCS.md) for detailed module and function documentation.

## 🖥️ Getting Started

```bash
git clone https://github.com/siyabuilds/carbon-footprint-tracker
cd carbon-footprint-tracker
npm install
npm run dev
```

## � Data Model Example

```js
{
  category: "Transport",      // Activity category
  activity: "Car (10km)",     // Description
  co2: 2.4,                   // CO₂ emissions in kg
  timestamp: "2025-07-03T..." // ISO timestamp
}
```

## � Styling

- CSS custom properties for color and spacing
- Flexbox/Grid for layout
- Quicksand font for a modern look
- Smooth transitions and hover effects

## 🌱 Future Plans

- SCSS/Tailwind CSS refactor
- Redis for caching leaderboard and average emissions data
- Smart suggestions to help with emissions

## 🤝 Contributing

This project is developed under [@Umuzi-org](https://github.com/umuzi-org). Suggestions and pull requests are welcome!

## 📄 License

Open source under the [MIT License](LICENSE).
