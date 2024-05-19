import React from "react";
import { Typography } from "@mui/material";
import { WidgetBase, WidgetDef } from "./types";

export interface TextWidget extends WidgetBase {
  type: "text";
  text: string;
}

export const TextWidgetDef: WidgetDef<TextWidget> = {
  Component: ({ widget }: { widget: TextWidget }) => (
    <Typography variant="h2" fontSize="inherit">
      {widget.text}
    </Typography>
  ),
};
