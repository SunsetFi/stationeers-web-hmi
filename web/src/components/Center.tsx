import React from "react";
import { Stack } from "@mui/material";

export interface CenterProps {
  children: React.ReactNode;
}

const Center: React.FC<CenterProps> = ({ children }) => {
  return (
    <Stack
      sx={{ width: "100%", height: "100%" }}
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Stack>
  );
};

export default Center;
