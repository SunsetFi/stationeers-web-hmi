import React from "react";

import { Stack, CircularProgress, Typography } from "@mui/material";

import { useHmiDisplay } from "@/services/hmi/HmiContext";

import DisplayFrame from "@/components/DisplayFrame";

const DisplayHomePage: React.FC = () => {
  const display = useHmiDisplay();

  let content: React.ReactNode;
  if (display === undefined) {
    content = (
      <Stack alignItems="center" justifyContent="center">
        <CircularProgress size="large" />
      </Stack>
    );
  } else if (display === null) {
    content = (
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="h2">Display not found</Typography>
      </Stack>
    );
  } else {
    content = (
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="h2">Hello from {display.referenceId}</Typography>
        <code>
          <pre>{JSON.stringify(display, null, 2)}</pre>
        </code>
      </Stack>
    );
  }

  return <DisplayFrame>{content}</DisplayFrame>;
};

export default DisplayHomePage;
