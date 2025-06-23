// src/App.jsx (Example)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home"; // Assuming you have these pages
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Drive from "./pages/Drive"; // Assuming Drive is in src/pages/Drive.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="drive" element={<Drive />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
