import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/ingredient/:id" element={<App />} />
    </Routes>
  );
}
