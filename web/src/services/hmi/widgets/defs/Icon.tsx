import React from "react";

import { IconName, Icons } from "@/icons";

import { WidgetBase } from "../types";

import { WidgetDef } from "./types";

export interface IconWidget extends WidgetBase {
  type: "icon";
  icon: IconName;
}

export const IconWidgetDef: WidgetDef<IconWidget> = {
  Component: ({ sx: inheritSx, widget }) => {
    const Icon = Icons[widget.icon];
    if (!Icon) {
      return null;
    }

    return (
      <Icon sx={{ ...inheritSx, alignSelf: "center", fontSize: "64px" }} />
    );
  },
};
