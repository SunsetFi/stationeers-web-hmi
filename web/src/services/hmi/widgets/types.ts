import { ButtonWidget } from "./defs/Button";
import { GaugeWidget } from "./defs/Gauge";
import { HmiScreenWidget } from "./defs/HmiScreen";
import { IconWidget } from "./defs/Icon";
import { LineChartWidget } from "./defs/LineChart";
import { SelectorWidget } from "./defs/Selector";
import { StackWidget } from "./defs/Stack";
import { TextWidget } from "./defs/Text";

import { CommonWidgetStyle } from "./style";

export interface WidgetBase extends CommonWidgetStyle {
  type: string;
}

// It would be nice to auto generate this from the defs, but those reference these very types and so
// cause a circular reference.
export type Widget =
  | StackWidget
  | TextWidget
  | IconWidget
  | LineChartWidget
  | GaugeWidget
  | ButtonWidget
  | SelectorWidget
  | HmiScreenWidget;
export type WidgetType = Widget["type"];
