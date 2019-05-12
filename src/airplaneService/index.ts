import _ from 'underscore';
import * as sbs1 from 'sbs1';
import { AppConfig } from '../loadConfig';
import { FlightCollection, Flight } from './flightCollection';

/**
 * Airplane Service
 *
 * This service will handle tracking the airplane data received from dump1090.
 * Planned responsibilities, ordered by priority:
 *   1. Gather and keep latest data point(s) about visible planes
 *   2. Alert initializer when a plane enters the geofence
 *   3. Garbage collect or swap off old data
 *
 * Future ideas:
 *   - Track high-level daily stats about planes seen
 *   - Persist daily stats for historical purposes
 *   - Track and save observed flight paths (not just latest location)
 *   - Generate flight path images on a map
 */

export class AirplaneService {
    private readonly config: AppConfig;
    private readonly sbsClient: sbs1.Client;
    private readonly flights: FlightCollection;

    public constructor(config: AppConfig) {
        this.config = config;
        this.flights = new FlightCollection([]);

        const sbsOptions: sbs1.Options = {
            host: config.dump1090_host,
            port: config.dump1090_port
        };
        this.sbsClient = sbs1.createClient(sbsOptions);
        this.sbsClient.on('message', this.onMessage.bind(this));
    }

    private normalizeMessage(message: sbs1.Message): sbs1.Message {
        // call signs are received as fixed length with padding, remove this
        if (message.callsign) {
            message.callsign = message.callsign.trim();
        }

        return message;
    }

    private onMessage(rawMsg: sbs1.Message): void {
        if (
            !rawMsg.hex_ident ||
            !rawMsg.generated_date ||
            !rawMsg.generated_time
        ) {
            return;
        }

        this.flights.updateFlight(this.normalizeMessage(rawMsg));
    }

    public getFlightsInRange(): Flight[] {
        return this.flights.getFlightsInRange(
            this.config.home_lat,
            this.config.home_lon,
            this.config.home_range
        );
    }
}
