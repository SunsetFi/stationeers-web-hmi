import React from "react";

import { IconName, Icons } from "@/icons";

import { WidgetBase, WidgetDef } from "./types";

export interface IconWidget extends WidgetBase {
  type: "icon";
  icon: IconName;
}

export const IconWidgetDef: WidgetDef<IconWidget> = {
  Component: ({ widget }: { widget: IconWidget }) => {
    const Icon = Icons[widget.icon];
    if (!Icon) {
      return null;
    }

    return <Icon sx={{ alignSelf: "center", fontSize: "64px" }} />;
  },
};
