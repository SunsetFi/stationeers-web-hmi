import React from "react";
import { Typography } from "@mui/material";
import { WidgetBase, WidgetDef } from "./types";
import { useObservation } from "@/hooks/use-observation";
import { useDIDependency } from "@/container";
import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

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
      <Typography variant="h2" fontSize="inherit">
        {value}
      </Typography>
    );
  },
};
