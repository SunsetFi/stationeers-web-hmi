import React from "react";
import { Routes, Route, Navigate } from "react-router";

import HomePage from "./pages/Home";
import HmiScreenPage from "./pages/HmiScreen";
import DisplayHomePage from "./pages/DisplayHome";

const AppRoutes = () => (
  <Routes>
    <Route index element={<HomePage />} />
    <Route path="/displays/:displayReferenceId" element={<DisplayHomePage />} />
    <Route
      path="/displays/:displayReferenceId/screens/:screenId"
      element={<HmiScreenPage />}
    />

    {/* react-router v6 doesn't want us putting redirects here, and instead wants us to configure
      the server to send 404s.  There are good reasons for this, but we don't have a server we can configure,
      so screw it.*/}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;
