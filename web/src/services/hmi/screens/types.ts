import { Tagged } from "type-fest";

import { Widget } from "../widgets";

export type HmiScreenId = Tagged<string, "ScreenId">;
export interface HmiScreen {
  id: HmiScreenId;
  error?: string;
  title: string;
  root: Widget;
  variables?: Record<string, string | number | boolean | null>;
  definitions?: Record<string, string>;
}
