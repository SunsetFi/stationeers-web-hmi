import React from "react";
import { Box, Typography } from "@mui/material";
import { LineChart, LineSeriesType } from "@mui/x-charts";

import { useDIDependency } from "@/container";

import { useObservation } from "@/hooks/use-observation";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { WidgetBase, WidgetDef } from "./types";
import { useComponentBounds } from "@/hooks/use-component-bounds";
import { Subscription } from "rxjs";

export interface LineChartWidget extends WidgetBase {
  type: "line-chart";
  series: LineChartSeries[];
}

export interface LineChartSeries {
  title?: string;
  sourceFormula: string;
  sampleCount?: number;
  sampleRate?: number;
}

export const LineChartWidgetDef: WidgetDef<LineChartWidget> = {
  Component: ({ widget }: { widget: LineChartWidget }) => {
    const { series } = widget;

    const [containerRef, setContainerRef] =
      React.useState<HTMLDivElement | null>(null);
    const { width, height } = useComponentBounds(containerRef);

    const [muiSeries, setMuiSeries] = React.useState<
      Omit<LineSeriesType, "type">[]
    >([]);

    const formulaCompiler = useDIDependency(FormulaCompiler);
    React.useEffect(() => {
      const subscriptions: Subscription[] = [];

      setMuiSeries(
        series.map(({ title, sampleCount }) => ({
          title,
          data: new Array(sampleCount ?? 100).fill(null),
        }))
      );

      for (let index = 0; index < series.length; index++) {
        const item = series[index];
        const formula = formulaCompiler.compileFormula(item.sourceFormula);
        const receiver: { value: number | null } = { value: null };
        const subscription = formula.subscribe((value) => {
          receiver.value = Number(value);
        });

        const sampler = setInterval(
          () => {
            setMuiSeries((prev) => {
              const copy = [...prev];
              const prevData = copy[index].data ?? [];
              copy[index] = {
                ...copy[index],
                data: [...prevData.slice(1), receiver.value],
              };
              return copy;
            });
          },
          (item.sampleRate ?? 1) * 1000
        );
        subscription.add(() => clearInterval(sampler));

        subscriptions.push(subscription);
      }

      return () => {
        subscriptions.forEach((s) => s.unsubscribe());
      };
    }, []);
    return (
      <Box
        ref={setContainerRef}
        sx={{ width: "100%", height: "100%", flex: "1" }}
      >
        <LineChart width={width} height={height} series={muiSeries} />
      </Box>
    );
  },
};
