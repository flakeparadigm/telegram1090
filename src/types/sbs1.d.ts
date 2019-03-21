declare module 'sbs1' {
    import { EventEmitter } from 'events';

    export enum MessageType {
        SELECTION_CHANGE = 'SEL',
        NEW_ID = 'ID',
        NEW_AIRCRAFT = 'AIR',
        STATUS_AIRCRAFT = 'STA',
        CLICK = 'CLK',
        TRANSMISSION = 'MSG'
    }

    export enum TransmissionType {
        ES_IDENT_AND_CATEGORY = 1, // ES identification and category (Spec: DF17 BDS 0,8)
        ES_SURFACE_POS = 2, // ES surface position message (Spec: DF17 BDS 0,6)
        ES_AIRBORNE_POS = 3, // ES airborne position message (Spec: DF17 BDS 0,5)
        ES_AIRBORNE_VEL = 4, // ES airborne velocity message (Spec: DF17 BDS 0,9)
        SURVEILLANCE_ALT = 5, // Surveillance alt message (Spec: DF4, DF20)
        SURVEILLANCE_ID = 6, // Surveillance ID message (Spec: DF5, DF21)
        AIR_TO_AIR = 7, // Air-to-air message (Spec: DF16)
        ALL_CALL_REPLY = 8 // All call reply (Spec: DF11)
    }

    export interface Message {
        message_type: string;
        transmission_type: number;
        session_id: string;
        aircraft_id: string;
        hex_ident: string;
        flight_id: string;
        generated_date: string;
        generated_time: string;
        logged_date: string;
        logged_time: string;
        callsign: string;
        altitude: number;
        ground_speed: number;
        track: number;
        lat: number;
        lon: number;
        vertical_rate: number;
        squawk: string;
        alert: boolean;
        emergency: boolean;
        spi: boolean;
        is_on_ground: boolean;
        parsed_time: string;
        stringify: () => string;
    }

    export interface Options {
        host: string;
        port: number;
    }

    export type Callback = (message: Message) => void

    export class Client extends EventEmitter {
        public constructor(options: Options)
    }

    export function parseSbs1Message(message: string): Message
    export function createClient(options: Options): Client
}
