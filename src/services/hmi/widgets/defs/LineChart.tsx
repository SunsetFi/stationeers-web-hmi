import React from "react";
import { Box, Typography } from "@mui/material";
import {
  AxisConfig,
  LineChart,
  LineSeriesType,
  markElementClasses,
} from "@mui/x-charts";

import { useDIDependency } from "@/container";

import { useObservation } from "@/hooks/use-observation";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { WidgetBase, WidgetDef } from "./types";
import { useComponentBounds } from "@/hooks/use-component-bounds";
import { Subscription } from "rxjs";

export interface LineChartWidget extends WidgetBase {
  type: "line-chart";
  series: LineChartSeries[];
  sampleCount?: number;
  sampleRate?: number;
}

export interface LineChartSeries {
  title?: string;
  valueFormula: string;
  axis?: {
    min?: number;
    max?: number;
  };
}

export const LineChartWidgetDef: WidgetDef<LineChartWidget> = {
  Component: ({ widget }: { widget: LineChartWidget }) => {
    const { series, sampleCount = 60, sampleRate = 1 } = widget;

    const [containerRef, setContainerRef] =
      React.useState<HTMLDivElement | null>(null);
    const { width, height } = useComponentBounds(containerRef);

    const [muiSeries, setMuiSeries] = React.useState<
      Omit<LineSeriesType, "type">[]
    >([]);

    const yAxes = React.useMemo(() => {
      return series.map(
        (s, i) =>
          ({
            id: String(i),
            min: s.axis?.min,
            max: s.axis?.max,
          }) satisfies AxisConfig
      );
    }, [series]);

    const formulaCompiler = useDIDependency(FormulaCompiler);
    React.useEffect(() => {
      const subscriptions: Subscription[] = [];

      setMuiSeries(
        series.map(({ title }, i) => ({
          label: title,
          data: new Array(sampleCount).fill(null),
          yAxisKey: String(i),
        }))
      );

      for (let index = 0; index < series.length; index++) {
        const item = series[index];
        const formula = formulaCompiler.compileFormula(item.valueFormula);
        let currentValue: number | null = null;
        const subscription = formula.subscribe((value) => {
          currentValue = Number(value);
        });

        const sampler = setInterval(() => {
          setMuiSeries((prev) => {
            const copy = [...prev];
            const prevData = copy[index].data ?? [];
            copy[index] = {
              ...copy[index],
              data: [...prevData.slice(1), currentValue],
            };
            return copy;
          });
        }, sampleRate * 1000);
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
        sx={{ width: "100%", height: "100%", flex: "1", minHeight: 0 }}
      >
        <LineChart
          width={width}
          height={height}
          sx={{
            [`.${markElementClasses.root}`]: {
              display: "none",
            },
          }}
          series={muiSeries}
          yAxis={yAxes}
          rightAxis={yAxes.length > 0 ? "1" : undefined}
          xAxis={[
            {
              tickNumber: 4,
              data: new Array(sampleCount).fill("").map((_, i) => i + 1),
              valueFormatter: (value) =>
                `${sampleRate * (sampleCount - value)}s`,
            },
          ]}
        />
      </Box>
    );
  },
};
