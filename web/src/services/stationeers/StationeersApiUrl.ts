import { Identifier } from "microinject";

export const StationeersApiUrl: Identifier<string> = "StationeersApiUrl";
export const stationeersApiUrlFactory = () => {
  return "http://localhost:8081";
};
