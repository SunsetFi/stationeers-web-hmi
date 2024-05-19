import React from "react";
import { Box, SxProps } from "@mui/material";

import { WidgetDefs } from "./defs";
import { Widget } from "./types";
import { ComponentPropsOf } from "@/types";

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

  return (
    <Box sx={sx}>
      {/*
      Need to mask the type here as typescript cannot reconcile the multiple options
      of Component widget with the multiple options of props.widget
      */}
      <Component {...(props as any)} />
    </Box>
  );
};

export default WidgetRenderer;
