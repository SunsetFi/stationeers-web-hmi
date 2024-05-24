import React from "react";
import { createRoot } from "react-dom/client";

import { CssBaseline } from "@mui/material";

import "./index.css";

import ThemeProvider from "./services/theme/theme";
import AppRouter from "./services/history/AppRouter";

import { ContainerProvider } from "./container";
import AppRoutes from "./routes";

const Root = () => (
  <ThemeProvider>
    <ContainerProvider>
      <AppRouter>
        <CssBaseline />
        <AppRoutes />
      </AppRouter>
    </ContainerProvider>
  </ThemeProvider>
);

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
