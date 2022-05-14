import ReactDOM from 'react-dom/client';
import React from 'react';

import { App } from './App';

// Polyfills
import 'regenerator-runtime/runtime';

// App
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

