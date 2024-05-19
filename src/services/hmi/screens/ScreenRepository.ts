import { injectable, singleton } from "microinject";
import { HmiScreen, HmiScreenId } from "./types";

@injectable()
@singleton()
export class HmiScreenRepository {
  getScreen(id: string): HmiScreen | null {
    if (id === "demo") {
      return {
        id: "demo" as HmiScreenId,
        title: "Demo Screen",
        root: {
          type: "stack",
          direction: "column",
          children: [
            {
              type: "stack",
              direction: "row",
              children: [
                {
                  type: "icon",
                  icon: "Thermostat",
                },
                {
                  type: "text",
                  text: "78° F",
                },
              ],
            },
            {
              type: "stack",
              direction: "row",
              children: [
                {
                  type: "icon",
                  icon: "BatteryChargingFull",
                },
                {
                  type: "text",
                  text: "100%",
                },
              ],
            },
          ],
        },
      };
    }

    return null;
  }
}
