import { type History as HistoryType, createHashHistory } from "history";
import { Identifier } from "microinject";

export const History: Identifier<HistoryType> = "history";
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Merged DI identifier.
export type History = HistoryType;
export function historyFactory() {
  return createHashHistory();
}
