import React from "react";
import { useParams } from "react-router";
import { Box, Typography } from "@mui/material";

import { useDIDependency } from "@/container";

import { HmiScreenRepository } from "@/services/hmi/screens/ScreenRepository";
import { WidgetRenderer } from "@/services/hmi/widgets";

import DisplayFrame from "@/components/DisplayFrame";

const HmiScreenPage = () => {
  const screenRepository = useDIDependency(HmiScreenRepository);
  const { screenId } = useParams();

  const screen = React.useMemo(() => {
    if (!screenId) {
      return null;
    }

    return screenRepository.getScreen(screenId);
  }, [screenId]);

  if (!screen) {
    return (
      <DisplayFrame>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h2">Screen Not Found</Typography>
        </Box>
      </DisplayFrame>
    );
  }

  return (
    <DisplayFrame>
      <WidgetRenderer
        widget={screen.root}
        sx={{ width: "100%", height: "100%" }}
      />
    </DisplayFrame>
  );
};

export default HmiScreenPage;
