import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import React from "react";

const theme = createTheme({
  palette: { mode: "dark" },
});

export interface AppThemeProviderProps {
  children: React.ReactNode;
}
const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default AppThemeProvider;
