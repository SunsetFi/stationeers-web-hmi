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
                  text: '${device("StructureGasSensor").logicValues.Temperature kelvin to degF}° F',
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
                  text: '${device("StructureAreaPowerControlReversed").logicValues.Charge / device("StructureAreaPowerControlReversed").logicValues.Maximum * 100}%',
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
