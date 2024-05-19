export type ComponentPropsOf<T> =
  T extends React.ComponentType<infer P> ? P : never;
