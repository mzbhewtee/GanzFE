import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import HomePage from "./pages/Home";
import LandPage from "./pages/Land";
import ClimatePage from "./pages/Climate";
import AgriculturePage from "./pages/Agriculture";
import AdminPage from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar /> {/* Sidebar is placed here */}
        <div className="flex-1">
          <Navbar />
          <main className="p-4 md:p-8 lg:p-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/land" element={<LandPage />} />
              <Route path="/climate" element={<ClimatePage />} />
              <Route path="/agriculture" element={<AgriculturePage />} />
              <Route path='/admin' element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
