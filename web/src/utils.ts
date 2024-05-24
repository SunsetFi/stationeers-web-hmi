export function arrayShallowEquals<T>(a: readonly T[], b: readonly T[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((x, i) => x === b[i]);
}
