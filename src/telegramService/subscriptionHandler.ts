import TelegramBot from 'node-telegram-bot-api';

export class SubscriptionHandler {
    private readonly bot: TelegramBot;
    private registeredChats: number[] = [];

    public constructor(bot: TelegramBot) {
        this.bot = bot;
        this.registerListeners();
    }

    private registerListeners(): void {
        this.bot.onText(/^\/?subscribe/, this.subscribe.bind(this));
        this.bot.onText(/^\/?unsubscribe/, this.unsubscribe.bind(this));
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

    public sendToSubscribers(message: string): void {
        this.registeredChats.forEach((chatId) => {
            this.bot.sendMessage(
                chatId,
                message,
                { parse_mode: 'Markdown' }
            );
        });
    }
}
