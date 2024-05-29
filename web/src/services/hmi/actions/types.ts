import { SetVariableHmiActionDef } from "./defs/SetVariableHmiActionDef";
import { WriteLogicValueHmiAction } from "./defs/WriteLogicValueHmiActionDef";

export interface HmiActionBase {
  action: string;
}

export type HmiAction = WriteLogicValueHmiAction | SetVariableHmiActionDef;
