import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tailwind.css';
import TarotReading from './TarotReading.jsx';
import Journal from './components/Journal.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TarotReading />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="*" element={<TarotReading />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
