import React from "react";
import {
  composeModules,
  Container,
  Identifier,
  Newable,
  ParameterRecord,
} from "microinject";

import servicesModule from "./services/module";
import { Initializable } from "./services/Initializable";

const modules = composeModules(servicesModule);

const ContainerContext = React.createContext<Container>(new Container());

const container = new Container();
container.bind(Container).toConstantValue(container);
container.load(modules);
if (container.has(Initializable)) {
  container
    .getAll(Initializable)
    .forEach((initializable) => initializable.onInitialize());
}

export default container;

export interface ContainerProviderProps {
  children: React.ReactNode;
}
export const ContainerProvider: React.FC<ContainerProviderProps> = ({
  children,
}) => {
  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
};

export function useDIContainer(): Container {
  return React.useContext(ContainerContext);
}

export function useDIDependency<T>(identifier: Identifier<T>): T {
  const container = useDIContainer();
  return container.get(identifier);
}

export function useDICreate<T>(
  identifier: Newable<T>,
  parameters?: ParameterRecord,
): T {
  const container = useDIContainer();
  const valRef = React.useRef<T>();
  if (valRef.current == null) {
    valRef.current = container.create(identifier, parameters);
  }
  return valRef.current;
}
