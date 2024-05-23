import React from "react";
import { useParams } from "react-router";
import { CircularProgress, Stack, Typography } from "@mui/material";

import { useDIDependency } from "@/container";

import { HmiScreenRepository } from "@/services/hmi/screens/ScreenRepository";
import { WidgetRenderer } from "@/services/hmi/widgets";

import { usePromise } from "@/hooks/use-promise";

import DisplayFrame from "@/components/DisplayFrame";

const HmiScreenPage = () => {
  const screenRepository = useDIDependency(HmiScreenRepository);
  const { screenId } = useParams();
  const screen = usePromise(
    () =>
      screenId ? screenRepository.getScreen(screenId) : Promise.resolve(null),
    [screenId]
  );

  let content: React.ReactNode;

  if (screen === undefined) {
    content = (
      <Stack alignItems="center" justifyContent="center">
        <CircularProgress size="large" />
      </Stack>
    );
  } else if (screen === null) {
    content = (
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="h2">Screen not found</Typography>
      </Stack>
    );
  } else {
    content = (
      <WidgetRenderer
        widget={screen.root}
        sx={{ width: "100%", height: "100%" }}
      />
    );
  }

  return <DisplayFrame>{content}</DisplayFrame>;
};

export default HmiScreenPage;
