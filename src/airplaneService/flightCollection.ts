import _ from 'underscore';
import * as sbs1 from 'sbs1';
import { isPointInCircle } from 'geolib';

interface Position {
    altitude: number;
    lat: number;
    lon: number;
}

export interface Flight extends Position {
    generated_date: string;
    generated_time: string;
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

    private hasPosition(position: Position): boolean {
        return !!(
            position.altitude &&
            position.lat &&
            position.lon
        );
    }

    private isMessageNewer(flight: Flight, message: sbs1.Message): boolean {
        const flightDate = flight.generated_date.replace(/\//g, '-');
        const flightTimestamp = new Date(`${flightDate}T${flight.generated_time}`);

        const messageDate = message.generated_date.replace(/\//g, '-');
        const messageTimestamp = new Date(`${messageDate}T${message.generated_time}`);

        return messageTimestamp > flightTimestamp;
    }

    private insertFlight(message: sbs1.Message): Flight {
        const position = _.pick(message, ['altitude', 'lat', 'lon']);
        const newFlight: Flight = {
            generated_date: message.generated_date,
            generated_time: message.generated_time,
            hex_ident: message.hex_ident,
            callsign: message.callsign,
            path: [],
            ...position
        };

        // prevent adding empty positions to path
        if (this.hasPosition(position)) {
            newFlight.path.push(position);
        }

        this.flightsByHex[message.hex_ident] = newFlight;

        return newFlight;
    }

    private mergeFlight(flight: Flight, message: sbs1.Message): void {
        // drop messages processed out of order
        if (!this.isMessageNewer(flight, message)) {
            return;
        }

        const flightKeys = Object.keys(flight);
        Object.assign(
            flight,
            _.pick(message, (value: unknown, key: string) => (
                value !== null && value !== undefined && flightKeys.includes(key))
            )
        );

        // track the flightpath, guessing at missing values
        const previousPosition = _.last(flight.path);
        const newPosition = _.pick(flight, ['altitude', 'lat', 'lon']);

        if (
            this.hasPosition(newPosition) &&
            !_.isEqual(newPosition, previousPosition)
        ) {
            flight.path.push(newPosition);
        }
    }
}
