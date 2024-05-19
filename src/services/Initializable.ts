import { Identifier } from "microinject";

export const Initializable: Identifier<Initializable> = "Initializable";
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Joined DI identifier with interface.
export interface Initializable {
  onInitialize(): void;
}
