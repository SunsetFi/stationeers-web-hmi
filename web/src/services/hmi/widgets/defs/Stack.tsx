import React from "react";
import { Box } from "@mui/material";

import WidgetRenderer from "../WidgetRenderer";

import { commonWidgetStyleToSx } from "../style";
import { Widget, WidgetBase } from "../types";

import { WidgetDef } from "./types";

export interface StackWidget extends WidgetBase {
  type: "stack";
  direction: "row" | "column";
  justifyChildren?: "start" | "end" | "center" | "stretch";
  gap?: number;
  children: Widget[];
}

export const StackWidgetDef: WidgetDef<StackWidget> = {
  Component: ({ widget }: { widget: StackWidget }) => {
    const sx: any = {
      alignItems: "stretch",
      ...commonWidgetStyleToSx(widget),
      gap: widget.gap,
      display: "flex",
      flexDirection: widget.direction,
    };

    switch (widget.direction) {
      case "row":
        sx.width = "100%";
        break;
      case "column":
        sx.height = "100%";
        break;
    }

    if (widget.justifyChildren) {
      sx.justifyContent = widget.justifyChildren;
      if (sx.justifyContent === "start") {
        sx.justifyContent = "flex-start";
      }
      if (sx.justifyContent === "end") {
        sx.justifyContent = "flex-end";
      }
    }

    return (
      <Box sx={sx}>
        {widget.children.map((child, index) => (
          <WidgetRenderer key={index} widget={child} />
        ))}
      </Box>
    );
  },
};
