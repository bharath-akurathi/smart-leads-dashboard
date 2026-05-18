# Smart Leads Dashboard - Client

This is the frontend portion of the Smart Leads Dashboard, built with React, Vite, and Tailwind CSS v4.

## Features
- **Responsive UI:** Fully responsive design that works perfectly on desktop and mobile.
- **Dark Mode:** System-aware and manually toggleable dark mode with persistent state.
- **Charts & Metrics:** Visualization of lead sources and status distributions using Recharts.
- **Role-Based Views:** UI dynamically adjusts based on whether the logged-in user is an `admin` or `sales` user.

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) (or 5174) to view it in the browser.

### `npm run build`
Builds the app for production to the `dist` folder.

### `npm run test`
Launches the test runner (Vitest) in watch mode.
The frontend uses `jsdom` and `@testing-library/react` to test component rendering, state changes, and utility functions.

### `npm run test:coverage`
Runs the tests and generates a code coverage report.

## Tech Stack Details
- **Styling:** Tailwind CSS v4 + native CSS variables for theme generation.
- **Animations:** Framer Motion for smooth modal and dropdown transitions.
- **API Communication:** Axios with interceptors for token attachment and automatic logout on 401.
- **Icons:** Lucide React.
