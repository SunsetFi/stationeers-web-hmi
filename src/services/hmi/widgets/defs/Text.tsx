import React from "react";
import { Typography } from "@mui/material";

import { useDIDependency } from "@/container";

import { useObservation } from "@/hooks/use-observation";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { WidgetBase, WidgetDef } from "./types";

export interface TextWidget extends WidgetBase {
  type: "text";
  text: string;
}

export const TextWidgetDef: WidgetDef<TextWidget> = {
  Component: ({ widget }: { widget: TextWidget }) => {
    const formulaCompiler = useDIDependency(FormulaCompiler);
    const value = useObservation(
      () => formulaCompiler.compileTemplateString(widget.text),
      [widget.text]
    );
    return (
      <Typography sx={{ alignSelf: "center" }} variant="h4">
        {value}
      </Typography>
    );
  },
};
