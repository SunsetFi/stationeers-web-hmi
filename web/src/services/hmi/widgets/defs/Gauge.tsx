import React from "react";
import { Gauge } from "@mui/x-charts";
import { map, of as observableOf } from "rxjs";

import { useDIDependency } from "@/container";

import { useObservation } from "@/hooks/use-observation";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { WidgetBase, WidgetDef } from "./types";

export interface GaugeWidget extends WidgetBase {
  type: "gauge";
  min: number | string;
  max: number | string;
  labelFormula?: string;
  valueFormula: number | string;
}

export const GaugeWidgetDef: WidgetDef<GaugeWidget> = {
  Component: ({ widget }: { widget: GaugeWidget }) => {
    const formulaCompiler = useDIDependency(FormulaCompiler);
    const { min, max, valueFormula } = widget;
    const minValue = useObservation(
      () =>
        typeof min === "string"
          ? formulaCompiler.compileFormula(min).pipe(map((x) => Number(x)))
          : observableOf(min),
      [min]
    );
    const maxValue = useObservation(
      () =>
        typeof max === "string"
          ? formulaCompiler.compileFormula(max).pipe(map((x) => Number(x)))
          : observableOf(max),
      [max]
    );
    const value = useObservation(
      () =>
        typeof valueFormula === "string"
          ? formulaCompiler
              .compileFormula(valueFormula)
              .pipe(map((x) => Number(x)))
          : observableOf(valueFormula),
      [valueFormula]
    );
    const text = useObservation(
      () =>
        widget.labelFormula
          ? formulaCompiler.compileTemplateString(widget.labelFormula)
          : observableOf(null),
      [widget.labelFormula]
    );

    return (
      <Gauge
        sx={{
          width: "100px",
          height: "100px",
          flexGrow: 0,
          fontSize: "initial",
        }}
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
