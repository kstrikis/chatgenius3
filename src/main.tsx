import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

console.log('Starting application...')

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Failed to find root element')
}

console.log('Root element found, mounting app...')

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('App mounted successfully')
} catch (error) {
  console.error('Failed to mount app:', error)
}
