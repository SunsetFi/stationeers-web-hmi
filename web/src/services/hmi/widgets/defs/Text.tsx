import React from "react";
import { Typography } from "@mui/material";

import { useHmiScreenTemplateStringObservation } from "../../screens/HmiScreenRenderer/hooks";

import { WidgetBase } from "../types";
import { commonWidgetStyleToSx } from "../style";

import { WidgetDef } from "./types";

export interface TextWidget extends WidgetBase {
  type: "text";
  text: string;
  fontSize?: number;
}

export const TextWidgetDef: WidgetDef<TextWidget> = {
  Component: ({ sx: inheritSx, widget }) => {
    const sx: any = {
      ...inheritSx,
      alignSelf: "center",
      m: 1,
      ...commonWidgetStyleToSx(widget),
    };

    if (widget.fontSize) {
      sx.fontSize = widget.fontSize;
    }

    const value = useHmiScreenTemplateStringObservation(widget.text);
    return (
      <Typography sx={sx} variant="h4">
        {value}
      </Typography>
    );
  },
};
