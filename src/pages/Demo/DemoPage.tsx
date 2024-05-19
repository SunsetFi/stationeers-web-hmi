import React from "react";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { Thermostat, WbSunny } from "@mui/icons-material";
import DisplayFrame from "@/components/DisplayFrame";

const DemoPage = () => {
  return (
    <DisplayFrame>
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            left: 50,
            top: 55,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            fontSize: 72,
          }}
        >
          <Thermostat fontSize="inherit" />
          <Typography variant="h3" fontSize="inherit">
            78° F
          </Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: 50,
            top: 50,
            display: "flex",
            fontSize: 240,
          }}
        >
          <WbSunny fontSize="inherit" />
        </Box>
      </Box>
    </DisplayFrame>
  );
};

export default DemoPage;
