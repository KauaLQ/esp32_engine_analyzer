# Rotoral Frontend

A modern React dashboard for monitoring industrial motors and devices. This frontend application is completely decoupled from the backend and communicates with it through a REST API.

## Features

- View a list of all devices/motors
- Search and filter devices by name or location
- View detailed information about each device
- Real-time monitoring of device measurements
- Interactive charts for visualizing measurement data
- Alerts for abnormal measurements
- Dark/light mode toggle

## Tech Stack

- **React + Vite**: Fast and modern frontend tooling
- **TypeScript**: Type-safe code
- **Mantine UI**: Component library for all visual elements
- **Recharts**: Chart library for data visualization
- **React Router**: For navigation between pages
- **Axios**: For API requests

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── DeviceCard.tsx
│   ├── MeasurementsChart.tsx
│   └── MeasurementsTable.tsx
├── layout/             # Layout components
│   └── MainLayout.tsx
├── routes/             # Page components
│   ├── DeviceListPage.tsx
│   └── DeviceDetailsPage.tsx
├── services/           # API services
│   └── api.ts
├── App.tsx             # Main application component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rotoral-frontend.git
   cd rotoral-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_BASE_URL=http://your-backend-api-url
   ```

   Note: If you don't set this, the app will default to `http://localhost:5000` and use mock data if the API is not available.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Customization

### API Configuration

The API base URL can be configured in the `.env` file:

```
VITE_API_BASE_URL=http://your-backend-api-url
```

### Alert Thresholds

You can adjust the alert thresholds in `src/routes/DeviceDetailsPage.tsx`:

```typescript
const TEMPERATURE_THRESHOLD = 60; // °C
const CURRENT_THRESHOLD = 12; // A
```

### Theme Customization

The Mantine theme can be customized in `src/App.tsx`:

```typescript
const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Customize colors here
  },
  // Other theme options
});
```

## Mock Data

The application includes mock data for development and testing purposes. If the API is not available, the app will automatically fall back to using mock data.
