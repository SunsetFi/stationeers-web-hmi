import React from "react";
import { useParams } from "react-router";
import { CircularProgress, Typography } from "@mui/material";

import { useDIDependency } from "@/container";

import { HmiScreenRepository } from "@/services/hmi/screens/ScreenRepository";
import { WidgetRenderer } from "@/services/hmi/widgets";

import { usePromise } from "@/hooks/use-promise";

import DisplayFrame from "@/components/DisplayFrame";
import Center from "@/components/Center";
import ErrorBoundary from "@/components/ErrorBoundary";
import HmiScreenRenderer from "@/services/hmi/screens/HmiScreenRenderer/HmiScreenRenderer";

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
      <Center>
        <CircularProgress size="large" />
      </Center>
    );
  } else if (screen === null) {
    content = (
      <Center>
        <Typography variant="h2">Screen not found</Typography>
      </Center>
    );
  } else {
    content = (
      <ErrorBoundary>
        <HmiScreenRenderer
          sx={{ width: "100%", height: "100%" }}
          screen={screen}
        />
      </ErrorBoundary>
    );
  }

  return <DisplayFrame>{content}</DisplayFrame>;
};

export default HmiScreenPage;
