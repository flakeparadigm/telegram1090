import { loadConfig } from './loadConfig';
import { AirplaneService } from './airplaneService';
import { TelegramService } from './telegramService';
import { Flight } from './airplaneService/flightCollection';

const config = loadConfig();

const airplaneService = new AirplaneService(config);
const telegramService = new TelegramService(config);
let prevInRange: Flight[] = [];

function notifySubscribers(flight: Flight): void {
    telegramService.sendGlobalAlert(
        `Do you hear that? Flight *${flight.callsign}* is passing by.\nhttps://flightaware.com/live/flight/${flight.callsign}`
    );
}

setInterval(() => {
    const inRange = airplaneService.getFlightsInRange();

    inRange.forEach((flight) => {
        if (!prevInRange.includes(flight)) {
            notifySubscribers(flight);
        }
    });

    prevInRange = inRange;
}, 1000);
