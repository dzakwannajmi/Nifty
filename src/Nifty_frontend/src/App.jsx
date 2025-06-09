// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';
import Pricing from './pages/pricing';
import Drive from './pages/drive';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <nav className="flex gap-4 mb-6">
          <Link to="/" className="text-blue-500">Home</Link>
          <Link to="/about" className="text-blue-500">About</Link>
          <Link to="/pricing" className="text-blue-500">Pricing</Link>
          <Link to="/drive" className="text-blue-500">Nifty Drive</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/drive" element={<Drive />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
