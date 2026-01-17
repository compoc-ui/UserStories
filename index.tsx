"homepage": "user-stories-roan.vercel.app",
"scripts": {
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
