import { clone } from "lodash";

export function arrayShallowEquals<T>(a: readonly T[], b: readonly T[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((x, i) => x === b[i]);
}

export function cloneDeepFreeze(obj: any) {
  const cloned = clone(obj);

  Object.keys(cloned).forEach((key) => {
    if (typeof cloned[key] === "object") {
      cloned[key] = cloneDeepFreeze(cloned[key]);
    }
  });

  Object.freeze(cloned);
  return cloned;
}
