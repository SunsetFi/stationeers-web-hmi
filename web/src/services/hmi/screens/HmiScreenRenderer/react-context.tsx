import React from "react";

import { HmiScreenContext } from "@/services/hmi/screens/HmiScreenContext";

export const ReactHmiScreenContext =
  React.createContext<HmiScreenContext | null>(null);

export const HmiScreenContextProvider: React.FC<{
  context: HmiScreenContext;
  children: React.ReactNode;
}> = ({ context, children }) => {
  return (
    <ReactHmiScreenContext.Provider value={context}>
      {children}
    </ReactHmiScreenContext.Provider>
  );
};
