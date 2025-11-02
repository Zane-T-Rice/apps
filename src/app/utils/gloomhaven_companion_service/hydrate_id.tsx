export function hydrateId<T extends { id: string, entity: string }>(item: T): T {
    item.id = item.entity.split("#")[2];
    return item;
}