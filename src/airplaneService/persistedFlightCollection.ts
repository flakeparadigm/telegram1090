import { FlightCollection, FlightList } from './flightCollection';
import { AppConfig } from '../loadConfig';
import { PersistenceService } from '../persistenceService';

const FILE_PREFIX = 'flights';
const DELAY_MULTIPLIER = 1;
const MAX_SAVE_SIZE = 500 * 1000; // in bytes

export class PersistedFlightCollection extends FlightCollection {
    private readonly config: AppConfig;
    private readonly checkInterval: NodeJS.Timeout;
    private persistence: PersistenceService<FlightList>;

    public constructor(config: AppConfig) {
        super([]);

        this.config = Object.assign({}, config, {
            persistence_save_interval: config.persistence_save_interval * DELAY_MULTIPLIER
        });

        this.persistence = this.createPersistenceService();

        this.checkInterval = setInterval(
            this.runChecks.bind(this),
            this.config.persistence_save_interval
        );
    }

    private runChecks(): void {
        if (this.persistence.getSize() > MAX_SAVE_SIZE) {
            console.log('---');
            console.log('Before: ', this.getAllHexes().length);
            const flights = this.pruneOlderThan(Date.now() - this.config.persistence_save_interval);
            console.log('After: ', this.getAllHexes().length);

            // halt old persistence service, saving only the pruned flights
            this.persistence.setFetcher(() => flights);
            this.persistence.stop();

            // start up new persistence service
            this.persistence = this.createPersistenceService();
        }
    }

    private createPersistenceService(): PersistenceService<FlightList> {
        const persistence = new PersistenceService<FlightList>(
            `${FILE_PREFIX}-${this.getFileSuffix()}`,
            this.getAllFlights.bind(this),
            this.config
        );
        persistence.start();

        return persistence;
    }

    private getFileSuffix(): string {
        // Returns YYYY-MM-DDTHH-MM-SS
        return (new Date())
            .toISOString()
            .substr(0, 19)
            .replace(/:/g, '-');
    }
}
