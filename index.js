const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZIM Swap!</b> ✨\n\n` +
        `Обменяй ETH на ZUZ по фиксированному курсу.\n` +
        `1 ZUZ = <b>0.0001 ETH</b>\n\n` +
        `👇 Нажми кнопку, чтобы открыть обменник:`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 ОТКРЫТЬ ZUZIM SWAP', 'https://zuzim-swap.onrender.com')]
        ])
    );
});

bot.launch();
console.log('✅ ZUZIM Swap Bot запущен');
