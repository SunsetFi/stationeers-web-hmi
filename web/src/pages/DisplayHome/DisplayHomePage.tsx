import React from "react";

import { Stack, CircularProgress, Typography, Paper } from "@mui/material";

import { useDIDependency } from "@/container";

import { useHmiDisplay } from "@/services/hmi/HmiContext";
import { HmiScreenRepository } from "@/services/hmi/screens/ScreenRepository";
import { DeviceApiObject } from "@/services/stationeers/api-types";

import { usePromise } from "@/hooks/use-promise";

import DisplayFrame from "@/components/DisplayFrame";
import ButtonLink from "@/components/ButtonLink";
import Center from "@/components/Center";

const DisplayHomePage: React.FC = () => {
  const display = useHmiDisplay();

  let content: React.ReactNode;
  if (display === undefined) {
    content = (
      <Center>
        <CircularProgress size="large" />
      </Center>
    );
  } else if (display === null) {
    content = (
      <Center>
        <Typography variant="h2">Display not found</Typography>
      </Center>
    );
  } else {
    content = (
      <Stack alignItems="center">
        <Typography variant="h2" sx={{ mb: 4 }}>
          {display.displayName}
        </Typography>
        <DisplayLoadedContent display={display} />
      </Stack>
    );
  }

  return <DisplayFrame>{content}</DisplayFrame>;
};

export default DisplayHomePage;

const DisplayLoadedContent: React.FC<{ display: DeviceApiObject }> = ({
  display,
}) => {
  const screenRepo = useDIDependency(HmiScreenRepository);
  const screens = usePromise(
    () => screenRepo.getScreensForDisplay(display.referenceId),
    [display.referenceId]
  );

  if (!screens) {
    return (
      <Stack alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={2}>
      {screens.map(({ title, id, error }) => (
        <ButtonLink
          key={id}
          to={`hmi-screens/${id}`}
          variant="outlined"
          color={error != null ? "error" : undefined}
        >
          {title ?? id}
        </ButtonLink>
      ))}
    </Stack>
  );
};
