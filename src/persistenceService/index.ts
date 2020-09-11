import { JsonPersistence } from './jsonPersistence';
import { DataFetcher, PersistenceImplementation } from './persistenceImplementation';
import { AppConfig } from '../loadConfig';

const IMPLEMENTATION = JsonPersistence;

export class PersistenceService<T> {
    private readonly implementation: PersistenceImplementation<T>;
    private readonly intervalTime: number;
    private fetcher: DataFetcher<T>;
    private intervalHandle: NodeJS.Timeout | null = null;

    public constructor(name: string, fetcher: DataFetcher<T>, config: AppConfig) {
        this.fetcher = fetcher;
        this.implementation = new IMPLEMENTATION<T>(name, fetcher(), config);
        this.intervalTime = config.persistence_save_interval;
    }

    public getData(): T {
        return this.implementation.load();
    }

    public getSize(): number {
        return this.implementation.getSize();
    }

    public setFetcher(fetcher: DataFetcher<T>): void {
        this.fetcher = fetcher;
    }

    public start(): void {
        this.intervalHandle = setInterval(this.saveCallback.bind(this), this.intervalTime);
        this.saveCallback();
    }

    public stop(): void {
        if (this.intervalHandle !== null) {
            clearInterval(this.intervalHandle);
        }
        this.saveCallback();
    }

    private saveCallback(): void {
        this.implementation.save(this.fetcher());
    }
}
