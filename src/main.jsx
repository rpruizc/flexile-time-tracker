import { invoke } from '@tauri-apps/api/tauri';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

document.addEventListener('DOMContentLoaded', () => {
  // Call the close_splashscreen command when the main content is loaded
  invoke('close_splashscreen')
    .then(() => console.log('Splashscreen closed'))
    .catch((error) => console.error('Error closing splashscreen:', error));
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)