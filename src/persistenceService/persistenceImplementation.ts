export type DataFetcher<T> = () => T;

export interface PersistenceImplementation<T> {
    save(data: T): void;
    load(): T;
    getSize(): number;
}
