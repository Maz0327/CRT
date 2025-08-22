import React from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./ui-v2/index.css";
import { UiV2App } from './ui-v2/app/UiV2App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UiV2App />
  </React.StrictMode>
)
