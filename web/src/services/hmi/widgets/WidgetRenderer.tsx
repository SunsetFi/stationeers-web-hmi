import React from "react";

import { SxProps } from "@mui/material";
import { ComponentPropsOf } from "@/types";

import { WidgetDefs } from "./defs";
import { Widget } from "./types";

export interface WidgetRendererProps {
  widget: Widget;
  sx?: SxProps;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, sx }) => {
  const Component = WidgetDefs[widget.type]?.Component;
  if (!Component) {
    return null;
  }

  const props: ComponentPropsOf<typeof Component> = { widget: widget as any };

  return <Component sx={sx} {...(props as any)} />;
};

export default WidgetRenderer;
