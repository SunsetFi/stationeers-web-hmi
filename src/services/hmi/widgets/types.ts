import { GaugeWidget } from "./defs/Gauge";
import { IconWidget } from "./defs/Icon";
import { LineChartWidget } from "./defs/LineChart";
import { StackWidget } from "./defs/Stack";
import { TextWidget } from "./defs/Text";

// It would be nice to auto generate this from the defs, but those reference these very types and so
// cause a circular reference.
export type Widget =
  | StackWidget
  | TextWidget
  | IconWidget
  | LineChartWidget
  | GaugeWidget;
export type WidgetType = Widget["type"];
