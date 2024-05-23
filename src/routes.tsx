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
      path="/displays/:displayReferenceId/hmi-screens/:screenId"
      element={<HmiScreenPage />}
    />

    {/* react-router v6 doesn't want us putting redirects here, and instead wants us to configure
      the server to send 404s.  There are good reasons for this, but with stationeers we don't
      need to bother and its too complicated to make the backend aware of the frontend's routing.*/}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;
