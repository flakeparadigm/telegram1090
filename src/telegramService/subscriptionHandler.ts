import TelegramBot from 'node-telegram-bot-api';

export type ChatIdList = number[];

export class SubscriptionHandler {
    private readonly bot: TelegramBot;
    private registeredChats: ChatIdList = [];

    public constructor(bot: TelegramBot, registeredChats: ChatIdList) {
        this.bot = bot;
        this.registeredChats = registeredChats;
        this.registerListeners();
    }

    public getPersistenceData(): ChatIdList {
        return this.registeredChats;
    }

    private registerListeners(): void {
        this.bot.onText(/^\/?[sS]ubscribe/, this.subscribe.bind(this));
        this.bot.onText(/^\/?[uU]nsubscribe/, this.unsubscribe.bind(this));
        this.bot.onText(/^\/?[sS]tatus/, this.status.bind(this));
    }

    private subscribe(message: TelegramBot.Message): void {
        const chatId = message.chat.id;

        if (this.registeredChats.includes(chatId)) {
            this.bot.sendMessage(chatId, 'You are already subscribed to updates.');
        } else {
            this.registeredChats.push(chatId);
            this.bot.sendMessage(chatId, 'You are now subscribed to updates.');
        }
    }

    private unsubscribe(message: TelegramBot.Message): void {
        const chatId = message.chat.id;

        this.registeredChats = this.registeredChats.filter((storedId) => storedId !== chatId);
        this.bot.sendMessage(chatId, 'Unsubscribe successful.');
    }

    private status(message: TelegramBot.Message): void {
        const chatId = message.chat.id;

        if (this.registeredChats.includes(chatId)) {
            this.bot.sendMessage(
                chatId,
                'You are subscribed to updates\\.\nUse `/unsubscribe` to stop receiving updates',
                { parse_mode: 'MarkdownV2' }
            );
        } else {
            this.bot.sendMessage(
                chatId,
                'You are NOT subscribed to updates\\.\nUse `/subscribe` to start receiving updates',
                { parse_mode: 'MarkdownV2' }
            );
        }
    }

    public sendToSubscribers(message: string): void {
        this.registeredChats.forEach((chatId) => {
            this.bot.sendMessage(
                chatId,
                message,
                { parse_mode: 'MarkdownV2' }
            );
        });
    }
}
