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
              type: "text",
              text: "Atmosphere",
            },
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
                  text: '${round(device("Gas Sensor").logicValues.Temperature kelvin to degF, 1, degF)}° F',
                },
                {
                  type: "icon",
                  icon: "Compress",
                },
                {
                  type: "text",
                  text: '${round(device("Gas Sensor").logicValues.Pressure KPa, 2, KPa)} kPa',
                },
              ],
            },
            {
              type: "text",
              text: "Sun Tracking",
            },
            {
              type: "stack",
              direction: "row",
              children: [
                {
                  type: "icon",
                  icon: "WbSunny",
                },
                {
                  type: "text",
                  text: '${round(device("Daylight Sensor").logicValues.SolarAngle deg, 1, deg)}°',
                },
              ],
            },
            {
              type: "text",
              text: "Power",
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
                  text: '${device("Area Power Control").logicValues.Charge / device("Area Power Control").logicValues.Maximum * 100}%',
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
