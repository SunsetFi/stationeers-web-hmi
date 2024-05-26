import { SxProps } from "@mui/material";
import { filter } from "lodash";

import { GaugeWidget } from "./defs/Gauge";
import { IconWidget } from "./defs/Icon";
import { LineChartWidget } from "./defs/LineChart";
import { StackWidget } from "./defs/Stack";
import { TextWidget } from "./defs/Text";
import { typedKeys } from "@/utils";

export interface WidgetBase extends CommonWidgetStyle {
  type: string;
}

export interface CommonWidgetStyle {
  marginLeft?: number | "auto";
  marginRight?: number | "auto";
  marginTop?: number | "auto";
  marginBottom?: number | "auto";
  margin?: number | "auto";

  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  padding?: number;

  alignSelf?: "start" | "end" | "center" | "stretch" | "baseline";
  justifySelf?: "start" | "end" | "center" | "stretch" | "baseline";
}

const alignSelfMap: Record<Required<CommonWidgetStyle>["alignSelf"], string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

const justifySelfMap: Record<
  Required<CommonWidgetStyle>["justifySelf"],
  string
> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

export function commonWidgetStyleToSx(style: CommonWidgetStyle): SxProps {
  const {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    margin,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    padding,
    alignSelf,
    justifySelf,
  } = style;

  const sx = {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    margin,

    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    padding,

    alignSelf: alignSelf ? alignSelfMap[alignSelf] : undefined,
    justifySelf: justifySelf ? justifySelfMap[justifySelf] : undefined,
  };

  // Dont forward undefined, so the widgets can supply defaults that wont get overridden.
  for (const key of typedKeys(sx)) {
    if (sx[key] === undefined) {
      delete sx[key];
    }
  }

  return sx;
}

// It would be nice to auto generate this from the defs, but those reference these very types and so
// cause a circular reference.
export type Widget =
  | StackWidget
  | TextWidget
  | IconWidget
  | LineChartWidget
  | GaugeWidget;
export type WidgetType = Widget["type"];
