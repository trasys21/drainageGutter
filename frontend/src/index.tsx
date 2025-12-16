import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './MainApp'; // Import MainApp
import './index.scss';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MainApp /> {/* Render MainApp */}
  </React.StrictMode>
);

reportWebVitals();