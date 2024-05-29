import React from "react";

import { useHmiScreenTemplateStringObservation } from "../../screens/HmiScreenRenderer/hooks";

import { useDIDependency } from "@/container";

import { usePromise } from "@/hooks/use-promise";

import HmiScreenRenderer from "../../screens/HmiScreenRenderer/HmiScreenRenderer";
import { HmiScreenRepository } from "../../screens/ScreenRepository";

import { WidgetBase } from "../types";
import { commonWidgetStyleToSx } from "../style";

import { WidgetDef } from "./types";

export interface HmiScreenWidget extends WidgetBase {
  type: "hmi-screen";
  screen: string;
}

export const HmiScreenWidgetDef: WidgetDef<HmiScreenWidget> = {
  Component: ({ sx: inheritSx, widget }) => {
    const sx: any = {
      ...inheritSx,
      width: "100%",
      height: "100%",
      flex: "1",
      minHeight: 0,
      ...commonWidgetStyleToSx(widget),
    };

    const repo = useDIDependency(HmiScreenRepository);
    const screenResolved = useHmiScreenTemplateStringObservation(widget.screen);
    const screenObject = usePromise(
      () =>
        screenResolved ? repo.getScreen(screenResolved) : Promise.resolve(null),
      [screenResolved]
    );

    if (!screenObject) {
      return null;
    }

    return <HmiScreenRenderer sx={sx} screen={screenObject} />;
  },
};
