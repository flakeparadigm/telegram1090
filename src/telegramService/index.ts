import TelegramBot from 'node-telegram-bot-api';
import { AppConfig } from '../loadConfig';
import { SubscriptionHandler, ChatIdList } from './subscriptionHandler';
import { PersistenceService } from '../persistenceService';

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
    private readonly persistence: PersistenceService<ChatIdList>;
    private readonly subscriptionHandler: SubscriptionHandler;

    public constructor(config: AppConfig) {
        this.persistence = new PersistenceService<ChatIdList>('telegram', this.getPersistenceData.bind(this), config);

        this.bot = new TelegramBot(
            config.telegram_token,
            { polling: true }
        );

        this.subscriptionHandler = new SubscriptionHandler(this.bot, this.persistence.getData());
        this.persistence.start();
    }

    public sendGlobalAlert(message: string): void {
        this.subscriptionHandler.sendToSubscribers(message);
    }

    public getPersistenceData(): ChatIdList {
        return this.subscriptionHandler ?
            this.subscriptionHandler.getPersistenceData() :
            [];
    }
}
