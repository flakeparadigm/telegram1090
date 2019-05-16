import _ from 'underscore';
import * as sbs1 from 'sbs1';
import { isPointInCircle } from 'geolib';

interface Position {
    timestamp: Date;
    altitude: number;
    lat: number;
    lon: number;
}

export interface Flight extends Position {
    hex_ident: string;
    callsign: string;
    path: Position[];
}

export type FlightList = Flight[];

export class FlightCollection {
    // contains all flights
    private readonly flightsByHex: { [hexIdent: string]: Flight } = {};

    // contains only flights that announce a callsign
    private readonly flightsByCallsign: { [callsign: string]: Flight } = {};

    public constructor(flights: FlightList) {
        flights.forEach((flight) => {
            this.flightsByHex[flight.hex_ident] = flight;

            if (flight.callsign) {
                this.flightsByCallsign[flight.callsign] = flight;
            }
        });
    }

    public updateFlight(message: sbs1.Message): void {
        const callsign = message.callsign ? message.callsign.trim() : null;
        let flight = this.flightsByHex[message.hex_ident];

        if (!flight) {
            flight = this.insertFlight(message);
        } else {
            this.mergeFlight(flight, message);
        }

        if (callsign) {
            this.flightsByCallsign[callsign] = flight;
        }
    }

    /**
     * Returns a list of
     */
    public getAllHexes(): string[] {
        return Object.keys(this.flightsByHex).sort();
    }

    public getAllCallsigns(): string[] {
        return Object.keys(this.flightsByCallsign).sort();
    }

    public getAllFlights(): Flight[] {
        return Object.values(this.flightsByHex);
    }

    public getFlightsInRange(latitude: number, longitude: number, radius: number): Flight[] {
        return _.filter(
            this.flightsByCallsign,
            (flight: Flight) => {
                if (!flight.lat || !flight.lon) return false;

                const flightCoordinates = {
                    latitude: flight.lat,
                    longitude: flight.lon
                };

                return isPointInCircle(
                    flightCoordinates,
                    { latitude, longitude },
                    radius
                );
            }
        ) ;
    }

    public pruneOlderThan(timestamp: number): FlightList {
        const oldestDate = new Date(timestamp);
        const pruned: FlightList = [];

        _.forEach(this.flightsByHex, (flight, hex) => {
            if (flight.timestamp < oldestDate) {
                pruned.push(flight);

                delete this.flightsByCallsign[flight.callsign];
                delete this.flightsByHex[hex];
            }
        });

        return pruned;
    }

    private hasPosition(position: Position): boolean {
        return !!(
            position.altitude &&
            position.lat &&
            position.lon
        );
    }

    private getDate(container: sbs1.Message): Date {
        const fixedDate = container.generated_date.replace(/\//g, '-');

        return new Date(`${fixedDate}T${container.generated_time}`);
    }

    private isMessageNewer(flight: Flight, message: sbs1.Message): boolean {
        const flightTimestamp = flight.timestamp;
        const messageTimestamp = this.getDate(message);

        return messageTimestamp > flightTimestamp;
    }

    private insertFlight(message: sbs1.Message): Flight {
        const newFlight: Flight = {
            timestamp: this.getDate(message),
            hex_ident: message.hex_ident,
            callsign: message.callsign,
            altitude: message.altitude,
            lat: message.lat,
            lon: message.lon,
            path: []
        };
        const position = _.pick(newFlight, ['timestamp', 'altitude', 'lat', 'lon']);

        // prevent adding empty positions to path
        if (this.hasPosition(position)) {
            newFlight.path.push(position);
        }

        this.flightsByHex[message.hex_ident] = newFlight;

        return newFlight;
    }

    private mergeFlight(flight: Flight, message: sbs1.Message): void {
        // drop messages processed out of order
        const messageTimestamp = this.getDate(message);

        if (messageTimestamp < flight.timestamp) {
            return;
        }

        const flightKeys = Object.keys(flight);
        Object.assign(
            flight,
            _.pick(message, (value: unknown, key: string) => (
                value !== null && value !== undefined && flightKeys.includes(key))
            )
        );
        flight.timestamp = this.getDate(message);

        // track the flightpath, guessing at missing values
        const previousPosition = flight.path[flight.path.length - 1];
        const newPosition: Position = _.pick(flight, ['timestamp', 'altitude', 'lat', 'lon']);

        if (
            this.hasPosition(newPosition) &&
            !_.isEqual(_.omit(newPosition, ['timestamp']), _.omit(previousPosition, ['timestamp']))
        ) {
            flight.path.push(newPosition);
        }
    }
}
