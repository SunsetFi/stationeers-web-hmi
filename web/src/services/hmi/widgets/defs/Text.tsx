import React from "react";
import { Theme, Typography } from "@mui/material";

import { useDIDependency } from "@/container";

import { useObservation } from "@/hooks/use-observation";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { WidgetBase, commonWidgetStyleToSx } from "../types";

import { WidgetDef } from "./types";

export interface TextWidget extends WidgetBase {
  type: "text";
  text: string;
  fontSize?: number;
}

export const TextWidgetDef: WidgetDef<TextWidget> = {
  Component: ({ widget }: { widget: TextWidget }) => {
    const sx: any = {
      alignSelf: "center",
      ...commonWidgetStyleToSx(widget),
    };

    if (widget.fontSize) {
      sx.fontSize = widget.fontSize;
    }

    const formulaCompiler = useDIDependency(FormulaCompiler);
    const [err, setErr] = React.useState<Error | undefined>(undefined);
    const value = useObservation(
      () => formulaCompiler.compileTemplateString(widget.text),
      [widget.text],
      { onError: setErr }
    );
    return (
      <Typography sx={sx} variant="h4">
        {err ? err.message : value}
      </Typography>
    );
  },
};
