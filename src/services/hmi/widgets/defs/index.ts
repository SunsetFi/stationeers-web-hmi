import { StackWidget, StackWidgetDef } from "./Stack";
import { TextWidget, TextWidgetDef } from "./Text";

export type Widget = StackWidget | TextWidget;

export const WidgetDefs = {
  stack: StackWidgetDef,
  text: TextWidgetDef,
};

export type WidgetType = keyof typeof WidgetDefs;
