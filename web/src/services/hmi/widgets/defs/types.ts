import { SxProps } from "@mui/material";

import { Widget } from "../types";

export interface WidgetDef<T extends Widget> {
  Component: React.ComponentType<{ sx?: SxProps; widget: T }>;
}
