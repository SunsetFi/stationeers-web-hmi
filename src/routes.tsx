import React from "react";
import { Routes, Route, Navigate } from "react-router";

import HomePage from "./pages/Home";
import DemoPage from "./pages/Demo/DemoPage";

const AppRoutes = () => (
  <Routes>
    <Route index element={<HomePage />} />
    <Route path="/demo" element={<DemoPage />} />

    {/* react-router v6 doesn't want us putting redirects here, and instead wants us to configure
      the server to send 404s.  There are good reasons for this, but we don't have a server we can configure,
      so screw it.*/}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;
