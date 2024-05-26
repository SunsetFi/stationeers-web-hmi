import React from "react";
import { Gauge } from "@mui/x-charts";

import {
  useHmiScreenFormulaObservation,
  useHmiScreenTemplateStringObservation,
} from "../../screens/HmiScreenRenderer/hooks";

import { WidgetBase, commonWidgetStyleToSx } from "../types";

import { WidgetDef } from "./types";

export interface GaugeWidget extends WidgetBase {
  type: "gauge";
  min: number | string;
  max: number | string;
  labelFormula?: string;
  valueFormula: number | string;
}

export const GaugeWidgetDef: WidgetDef<GaugeWidget> = {
  Component: ({ widget }: { widget: GaugeWidget }) => {
    const sx: any = {
      width: "100px",
      height: "100px",
      flexGrow: 0,
      ...commonWidgetStyleToSx(widget),
    };

    const { min, max, valueFormula, labelFormula } = widget;

    const minValue = useHmiScreenFormulaObservation(min);
    const maxValue = useHmiScreenFormulaObservation(max);
    const value = Number(useHmiScreenFormulaObservation(valueFormula));
    const text = useHmiScreenTemplateStringObservation(labelFormula ?? "");

    return (
      <Gauge
        sx={sx}
        valueMin={minValue}
        valueMax={maxValue}
        value={value}
        text={text ?? String(value)}
        startAngle={-140}
        endAngle={140}
      />
    );
  },
};
