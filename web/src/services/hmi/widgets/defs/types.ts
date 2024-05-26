import { Widget } from "../types";

export interface WidgetDef<T extends Widget> {
  Component: React.ComponentType<{ widget: T }>;
}
