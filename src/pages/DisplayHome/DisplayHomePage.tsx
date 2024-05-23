import React from "react";

import { Stack, CircularProgress, Typography, Paper } from "@mui/material";

import { useDIDependency } from "@/container";

import { useHmiDisplay } from "@/services/hmi/HmiContext";
import { HmiScreenRepository } from "@/services/hmi/screens/ScreenRepository";
import { DeviceApiObject } from "@/services/stationeers/api-types";

import { usePromise } from "@/hooks/use-promise";

import DisplayFrame from "@/components/DisplayFrame";
import ButtonLink from "@/components/ButtonLink";

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
        <Typography variant="h2">{display.displayName}</Typography>
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
    <Paper>
      <Stack direction="column" spacing={2}>
        {screens.map(({ title, id }) => (
          <ButtonLink key={id} to={`hmi-screens/${id}`}>
            {title}
          </ButtonLink>
        ))}
      </Stack>
    </Paper>
  );
};
