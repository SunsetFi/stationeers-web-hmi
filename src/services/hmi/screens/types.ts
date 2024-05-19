import { Tagged } from "type-fest";

import { Widget } from "../widgets";

export type HmiScreenId = Tagged<string, "ScreenId">;
export interface HmiScreen {
  id: HmiScreenId;
  title: string;
  root: Widget;
}
