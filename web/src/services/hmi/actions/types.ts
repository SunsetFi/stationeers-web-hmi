import { WriteLogicValueHmiAction } from "./defs/WriteLogicValueHmiActionDef";

export interface HmiActionBase {
  type: string;
}

export type HmiAction = WriteLogicValueHmiAction;
