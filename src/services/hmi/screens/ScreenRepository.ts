import { injectable, singleton } from "microinject";
import { HmiScreen, HmiScreenId } from "./types";

const testScreens: HmiScreen[] = [
  {
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
          type: "line-chart",
          series: [
            {
              valueFormula:
                "device('Gas Sensor').logicValues.Temperature kelvin to degF",
              title: "Temperature",
            },
            {
              valueFormula: "device('Gas Sensor').logicValues.Pressure",
              title: "Pressure",
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
              text: "Charge",
            },
            {
              type: "gauge",
              min: 0,
              max: 100,
              labelFormula:
                '${round(device("Area Power Control").logicValues.Charge / device("Area Power Control").logicValues.Maximum * 100, 0)}%',
              valueFormula: `device("Area Power Control").logicValues.Charge / device("Area Power Control").logicValues.Maximum * 100`,
            },
            {
              type: "text",
              text: "Usage",
            },
            {
              type: "gauge",
              min: 0,
              max: 5000,
              labelFormula:
                '${round(device("Area Power Control").logicValues.PowerActual, 0)} w',
              valueFormula: `round(device("Area Power Control").logicValues.PowerActual, 0)`,
            },
          ],
        },
      ],
    },
  },
];

@injectable()
@singleton()
export class HmiScreenRepository {
  async getScreensForDisplay(displayReferenceId: string): Promise<HmiScreen[]> {
    return testScreens;
  }

  async getScreen(id: string): Promise<HmiScreen | null> {
    return testScreens.find((x) => x.id === id) ?? null;
  }
}
