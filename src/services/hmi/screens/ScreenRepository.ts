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
          direction: "row",
          children: [
            {
              type: "text",
              text: "Hello, world!",
            },
          ],
        },
      };
    }

    return null;
  }
}
