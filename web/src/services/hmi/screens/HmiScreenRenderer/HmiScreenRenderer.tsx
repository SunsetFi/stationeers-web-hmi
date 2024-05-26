import React from "react";

import { useDIDependency } from "@/container";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { HmiConnectedDevicesSource } from "@/services/hmi/HmiConnectedDeviceSource";

import { HmiScreen } from "@/services/hmi/screens/types";
import { HmiScreenContext } from "@/services/hmi/screens/HmiScreenContext";

import { WidgetRenderer } from "@/services/hmi/widgets";

import { HmiScreenContextProvider } from "./react-context";
import { SxProps } from "@mui/material";

export interface HmiScreenRendererProps {
  sx?: SxProps;
  screen: HmiScreen;
}

function useHmiScreenContext(screen: HmiScreen) {
  const devicesSource = useDIDependency(HmiConnectedDevicesSource);
  const formulaCompiler = useDIDependency(FormulaCompiler);
  return React.useMemo(
    () => new HmiScreenContext(screen, devicesSource, formulaCompiler),
    [screen]
  );
}

const HmiScreenRenderer: React.FC<HmiScreenRendererProps> = ({
  sx,
  screen,
}) => {
  const context = useHmiScreenContext(screen);

  return (
    <HmiScreenContextProvider context={context}>
      <WidgetRenderer widget={screen.root} sx={sx} />
    </HmiScreenContextProvider>
  );
};

export default HmiScreenRenderer;
