import TelegramBot from 'node-telegram-bot-api';
import { AppConfig } from '../loadConfig';
import { SubscriptionHandler } from './subscriptionHandler';

/**
 * Telegram Bot Service
 *
 * This service will handle all communication with the telegram clients.
 * Planned responsibilities, ordered by priority:
 *   1. Accept start commands from new users
 *   2. Provide an API for the initializer to globally message all saved users
 *
 * Future ideas:
 *   - Persist users to disk for recovery after process shutdown
 *   - Provide an API for the initializer to respond to commands
 *   - Provide an authentication challenge to secure location
 */

export class TelegramService {
    private readonly bot: TelegramBot;
    private readonly subscriptionHandler: SubscriptionHandler;

    public constructor(config: AppConfig) {
        this.bot = new TelegramBot(
            config.telegram_token,
            { polling: true }
        );

        this.subscriptionHandler = new SubscriptionHandler(this.bot);
    }

    public sendGlobalAlert(message: string): void {
        this.subscriptionHandler.sendToSubscribers(message);
    }
}
