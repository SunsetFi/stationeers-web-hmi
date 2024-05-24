import React from "react";
import { Stack, SxProps } from "@mui/material";

import { WidgetBase, WidgetDef } from "./types";
import WidgetRenderer from "../WidgetRenderer";

import { Widget } from "../types";

export interface StackWidget extends WidgetBase {
  type: "stack";
  direction: "row" | "column";
  children: Widget[];
}

export const StackWidgetDef: WidgetDef<StackWidget> = {
  Component: ({ widget }: { widget: StackWidget }) => {
    const sx: Record<string, any> = {};
    switch (widget.direction) {
      case "row":
        sx.width = "100%";
        break;
      case "column":
        sx.height = "100%";
        break;
    }
    return (
      <Stack direction={widget.direction} alignItems="stretch" sx={sx}>
        {widget.children.map((child, index) => (
          <WidgetRenderer key={index} widget={child} />
        ))}
      </Stack>
    );
  },
};
