import * as _ from 'underscore';
import * as sbs1 from 'sbs1';

interface Position {
    altitude: number,
    lat: number,
    lon: number
}

export interface Flight extends Position {
    generated_date: string,
    generated_time: string,
    hex_ident: string,
    callsign: string,
    track: number,
    path: Position[]
}

export class FlightCollection {
    private readonly flightsByHex: { [hexIdent: string]: Flight } = {};
    private readonly flightsByCallsign: { [callsign: string]: Flight } = {};

    private hasPosition(position: Position): boolean {
        return !!(
            position.altitude ||
            position.lat ||
            position.lon
        );
    }

    private isMessageNewer(flight: Flight, message: sbs1.Message): boolean {
        const flightDate = flight.generated_date.replace(/\//g, '-');
        const flightTimestamp = `${flightDate}T${flight.generated_time}`;

        const messageDate = message.generated_date.replace(/\//g, '-');
        const messageTimestamp = `${messageDate}T${message.generated_time}`;

        return messageTimestamp > flightTimestamp;
    }

    private insertFlight(message: sbs1.Message): Flight {
        const position: Position = _.pick(message, ['altitude', 'lat', 'lon']);
        const newFlight: Flight = {
            generated_date: message.generated_date,
            generated_time: message.generated_time,
            hex_ident: message.hex_ident,
            callsign: message.callsign,
            track: message.track,
            path: [],
            ...position
        }

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

        // extend with non-null values
        for (const key in flight) {
            const newValue = (message as any)[key];

            if (newValue !== null && newValue !== undefined) {
                (flight as any)[key] = newValue;
            }
        }

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

    updateFlight(message: sbs1.Message) {
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

    getSeenHexes() {
        return Object.keys(this.flightsByHex).sort();
    }
    getSeenCallsigns() {
        return Object.keys(this.flightsByCallsign).sort();
    }
}
