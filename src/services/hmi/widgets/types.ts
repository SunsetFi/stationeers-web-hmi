import { StackWidget } from "./defs/Stack";
import { TextWidget } from "./defs/Text";

export type Widget = StackWidget | TextWidget;
export type WidgetType = Widget["type"];
