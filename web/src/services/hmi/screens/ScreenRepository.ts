import { inject, injectable, singleton } from "microinject";

import { ApiError } from "@/ApiError";

import { HmiScreen, HmiScreenId } from "./types";

@injectable()
@singleton()
export class HmiScreenRepository {
  constructor(@inject("StationeersApiUrl") private _url: string) {}

  async getScreensForDisplay(displayReferenceId: string): Promise<HmiScreen[]> {
    return this._getLocalScreens();
  }

  async getScreen(id: string): Promise<HmiScreen | null> {
    const screens = await this._getLocalScreens();
    return screens.find((x) => x.id === id) ?? null;
  }

  private async _getLocalScreens(): Promise<HmiScreen[]> {
    const req = await fetch(`${this._url}/station-hmi/hmi-configs`);
    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }

    const body: HmiScreen[] = await req.json();
    return body;
  }
}
