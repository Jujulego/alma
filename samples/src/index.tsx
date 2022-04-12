import ReactDOM from 'react-dom/client';
import React from 'react';

// Polyfills
import 'regenerator-runtime/runtime';

// App
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    Hello world!
  </React.StrictMode>
);
