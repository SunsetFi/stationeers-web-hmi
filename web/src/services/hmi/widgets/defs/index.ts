import { ButtonWidgetDef } from "./Button";
import { GaugeWidgetDef } from "./Gauge";
import { HmiScreenWidgetDef } from "./HmiScreen";
import { IconWidgetDef } from "./Icon";
import { LineChartWidgetDef } from "./LineChart";
import { SelectWidgetDef } from "./Selector";
import { StackWidgetDef } from "./Stack";
import { TextWidgetDef } from "./Text";

export const WidgetDefs = {
  gauge: GaugeWidgetDef,
  icon: IconWidgetDef,
  "line-chart": LineChartWidgetDef,
  stack: StackWidgetDef,
  text: TextWidgetDef,
  button: ButtonWidgetDef,
  selector: SelectWidgetDef,
  "hmi-screen": HmiScreenWidgetDef,
};
