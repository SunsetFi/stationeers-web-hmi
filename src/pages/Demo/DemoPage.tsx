import React from "react";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { Thermostat, WbSunny } from "@mui/icons-material";

const DemoPageStyle = styled.div({
  boxSizing: "border-box",
  position: "relative",
  border: "2px solid white",
  borderRadius: 28,
  width: "100%",
  height: "100%",
});

const DemoPage = () => {
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 2,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x - 5,
          top: y - 5,
          backgroundColor: "white",
          borderRadius: 5,
          width: 10,
          height: 10,
        }}
      />
      <DemoPageStyle
        onMouseMove={(e) => {
          setX(e.clientX);
          setY(e.clientY);
        }}
      >
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
      </DemoPageStyle>
    </Box>
  );
};

export default DemoPage;
