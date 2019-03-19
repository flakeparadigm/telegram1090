import * as sbs1 from 'sbs1';
import TelegramBot from 'node-telegram-bot-api'
import { loadConfig } from './loadConfig';
import { AirplaneService } from './airplaneService';

const config = loadConfig();

const airplaneService = new AirplaneService(config);

// // TESTING SBS1 - logging messages for diagnostics examples
// const sbsOptions: sbs1.Options = {
//     host: config.dump1090_host,
//     port: config.dump1090_port
// };
// const sbsClient = sbs1.createClient(sbsOptions);
// const sbsHandler: sbs1.Callback = function (message) {
//     if (message.callsign) {
//         console.log(message);
//     }
// }

// sbsClient.on('message', sbsHandler);



// // TESTING TELEGRAM - logging messages and responding to them
// const bot = new TelegramBot(
//     config.telegram_token,
//     { polling: true }
// )

// // Listen for any kind of message.There are different kinds of
// // messages.
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;

//     console.log(msg);

//     // send a message to the chat acknowledging receipt of their message
//     bot.sendMessage(chatId, 'Received your message');
// });
