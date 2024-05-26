import React from "react";
import {
  AxisConfig,
  LineChart,
  LineSeriesType,
  markElementClasses,
} from "@mui/x-charts";
import { Subscription, combineLatest, of as observableOf, map } from "rxjs";
import { Box } from "@mui/material";

import { useDIDependency } from "@/container";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { useComponentBounds } from "@/hooks/use-component-bounds";

import { WidgetBase, commonWidgetStyleToSx } from "../types";

import { WidgetDef } from "./types";
import { useHmiScreenContext } from "../../screens/HmiScreenRenderer/hooks";

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
    scaleType: "linear" | "log" | "pow" | "sqrt";
    min?: number | string;
    max?: number | string;
  };
}

export const LineChartWidgetDef: WidgetDef<LineChartWidget> = {
  Component: ({ widget }: { widget: LineChartWidget }) => {
    const { series, sampleCount = 60, sampleRate = 1 } = widget;

    const hmiContext = useHmiScreenContext();

    const sx: any = {
      width: "100%",
      height: "100%",
      flex: "1",
      minHeight: 0,
      ...commonWidgetStyleToSx(widget),
    };

    const [containerRef, setContainerRef] =
      React.useState<HTMLDivElement | null>(null);
    const { width, height } = useComponentBounds(containerRef);

    const [muiSeries, setMuiSeries] = React.useState<
      Omit<LineSeriesType, "type">[]
    >([]);

    const [yAxes, setYAxes] = React.useState<AxisConfig[]>([]);

    const formulaCompiler = useDIDependency(FormulaCompiler);
    React.useEffect(() => {
      const subscriptions: Subscription[] = [];

      // We will get additional calls to setYAxes during the series builtup due to the immediately available observables,
      // so set up the array first.
      setYAxes(
        new Array(series.length).fill(null).map((_, index) => ({
          id: String(index),
          scaleType: series[index].axis?.scaleType ?? "linear",
        }))
      );

      for (let index = 0; index < series.length; index++) {
        const item = series[index];

        // axis
        const { min, max } = item.axis ?? {};

        const min$ =
          typeof min === "string"
            ? formulaCompiler
                .compileFormula(min, hmiContext)
                .pipe(map((x) => Number(x)))
            : observableOf(min);
        const max$ =
          typeof max === "string"
            ? formulaCompiler
                .compileFormula(max, hmiContext)
                .pipe(map((x) => Number(x)))
            : observableOf(max);

        subscriptions.push(
          combineLatest([min$, max$]).subscribe(([min, max]) => {
            setYAxes((prev) => {
              const copy = [...prev];
              copy[index] = {
                ...copy[index],
                min: !Number.isNaN(min) ? min : undefined,
                max: !Number.isNaN(max) ? max : undefined,
              };
              return copy;
            });
          })
        );

        // value
        const valueFormula = formulaCompiler.compileFormula(
          item.valueFormula,
          hmiContext
        );
        let currentValue: number | null = null;
        const valueSubscription = valueFormula.subscribe((value) => {
          currentValue = Number(value);
          if (Number.isNaN(currentValue)) {
            currentValue = null;
          }
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
        valueSubscription.add(() => clearInterval(sampler));

        subscriptions.push(valueSubscription);
      }

      setMuiSeries(
        series.map(({ title }, i) => ({
          label: title,
          data: new Array(sampleCount).fill(null),
          yAxisKey: String(i),
        }))
      );

      return () => {
        subscriptions.forEach((s) => s.unsubscribe());
      };
    }, []);

    return (
      <Box ref={setContainerRef} sx={sx}>
        <LineChart
          width={width}
          height={height}
          sx={{
            [`.${markElementClasses.root}`]: {
              display: "none",
            },
          }}
          skipAnimation
          series={muiSeries}
          yAxis={yAxes}
          rightAxis={yAxes.length > 1 ? "1" : undefined}
          xAxis={[
            {
              tickNumber: 4,
              data: new Array(sampleCount).fill(null).map((_, i) => i + 1),
              valueFormatter: (value) =>
                `${sampleRate * (sampleCount - value)}s`,
            },
          ]}
        />
      </Box>
    );
  },
};
