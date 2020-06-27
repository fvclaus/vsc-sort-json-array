function intersection<E>(setA: Set<E>, setB: Set<E>): Set<E> {
  const _intersection = new Set<E>();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}


export function findCommonProperties(array: unknown[]): Set<string> {
  return array
      .map((o) => new Set(Object.getOwnPropertyNames(o)))
  // Intersection is associative
      .reduce((a, b) => intersection(a, b));
}
