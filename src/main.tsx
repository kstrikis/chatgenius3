import React from "react";
import ReactDOM from "react-dom/client";
import { logInfo, logError } from "./lib/logger";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

logInfo('Starting application...')

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Failed to find root element')
}

logInfo('Root element found, mounting app...')

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  logInfo('App mounted successfully')
} catch (error) {
  logError(error instanceof Error ? error : new Error('Failed to mount app'), 'main')
}
