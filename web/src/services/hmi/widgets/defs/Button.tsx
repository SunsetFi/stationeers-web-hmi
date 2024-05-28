import React from "react";
import { Button } from "@mui/material";

import { useDIDependency } from "@/container";

import {
  useHmiScreenContext,
  useHmiScreenFormulaObservation,
  useHmiScreenTemplateStringObservation,
} from "../../screens/HmiScreenRenderer/hooks";
import { HmiActionExecutor } from "../../actions/HmiActionExecutor";

import { HmiAction } from "../../actions/types";

import { WidgetBase } from "../types";
import { commonWidgetStyleToSx } from "../style";

import { WidgetDef } from "./types";

export interface ButtonWidget extends WidgetBase {
  type: "button";
  text: string;
  fontSize?: number;
  filled?: boolean | string;
  action?: HmiAction;
}

export const ButtonWidgetDef: WidgetDef<ButtonWidget> = {
  Component: ({ widget }: { widget: ButtonWidget }) => {
    const [working, setWorking] = React.useState(false);

    const sx: any = {
      alignSelf: "center",
      ...commonWidgetStyleToSx(widget),
    };

    if (widget.fontSize) {
      sx.fontSize = widget.fontSize;
    }

    const filled = useHmiScreenFormulaObservation(widget.filled ?? false);

    const value = useHmiScreenTemplateStringObservation(widget.text);

    const executor = useDIDependency(HmiActionExecutor);
    const context = useHmiScreenContext();
    const onClick = React.useCallback(async () => {
      if (widget.action) {
        setWorking(true);
        try {
          await executor.executeAction(context, widget.action);
        } finally {
          setWorking(false);
        }
      }
    }, [context, executor, widget.action]);

    return (
      <Button
        sx={sx}
        variant={filled ? "contained" : "outlined"}
        disabled={working}
        onClick={onClick}
      >
        {value}
      </Button>
    );
  },
};
