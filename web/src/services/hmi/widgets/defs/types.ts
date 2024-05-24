import { Widget } from "../types";

export interface WidgetBase {
  type: string;
}

export interface WidgetDef<T extends Widget> {
  Component: React.ComponentType<{ widget: T }>;
}
