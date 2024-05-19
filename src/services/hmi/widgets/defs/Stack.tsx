import React from "react";
import { Stack } from "@mui/material";

import { WidgetBase, WidgetDef } from "./types";
import WidgetRenderer from "../WidgetRenderer";

import { Widget } from "../types";

export interface StackWidget extends WidgetBase {
  type: "stack";
  direction: "row" | "column";
  children: Widget[];
}

export const StackWidgetDef: WidgetDef<StackWidget> = {
  Component: ({ widget }: { widget: StackWidget }) => (
    <Stack direction={widget.direction} gap={2} alignItems="stretch">
      {widget.children.map((child, index) => (
        <WidgetRenderer key={index} widget={child} />
      ))}
    </Stack>
  ),
};
