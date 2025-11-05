export function hydrateId<T extends { id: string; entity: string }>(
  item: T,
): T {
  item.id = item.entity.split("#")[2];
  return item;
}

export function responseTransformer<T extends { id: string; entity: string }>(
  response: T | T[],
) {
  if (response instanceof Array) {
    return response.map(hydrateId);
  } else {
    return hydrateId(response);
  }
}
