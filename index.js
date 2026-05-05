const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// === ВЕБ-СЕРВЕР ДЛЯ RENDER ===
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('✅ ZUZIM Swap Bot is running'));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Web server on port ${PORT}`));

// === БОТ ===
const bot = new Telegraf(process.env.BOT_TOKEN);
const APP_URL = 'https://zuzim-swap-live.vercel.app';

// ========== КНОПКИ ==========
const mainMenu = () => Markup.keyboard([
    ['🚀 OPEN SWAP', '👤 PROFILE'],
    ['❓ HELP', '👥 REFERRALS']
]).resize();

const mainMenuRu = () => Markup.keyboard([
    ['🚀 ОТКРЫТЬ ОБМЕННИК', '👤 ПРОФИЛЬ'],
    ['❓ ПОМОЩЬ', '👥 ПАРТНЁРЫ']
]).resize();

const appButton = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 OPEN SWAP', APP_URL)]
]);

const appButtonRu = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 ОТКРЫТЬ ОБМЕННИК', APP_URL)]
]);

// ========== ПЕРЕВОДЫ ==========
const translations = {
    ru: {
        welcome: '✨ <b>Добро пожаловать в ZUZIM Swap!</b> ✨\n\nОбменяй ETH и USDT на ZUZ.\n1 ZUZ = 0.0001 ETH\n\n📊 <b>Функции:</b>\n• 🔒 Стейкинг 25% APY\n• 🤝 Партнёрская программа (5%)\n• 💰 Покупка ZUZ за ETH',
        profile: '👤 <b>Ваш профиль</b>\n\n🆔 ID: <code>%id%</code>\n🎮 Имя: %name%\n\n📊 Баланс можно посмотреть в обменнике.',
        help: '❓ <b>Помощь</b>\n\n• Купить ZUZ: ETH → ZUZ (0.0001 ETH за 1 ZUZ)\n• Стейкинг: застейкай ZUZ под 25% годовых\n• Партнёры: приглашай друзей и получай 5% от их покупок',
        referral: '👥 <b>Партнёрская программа</b>\n\nПриглашай друзей и получай <b>5%</b> от их покупок!\n\n🔗 Твоя ссылка:\n<code>%link%</code>',
        copy: '📋 КОПИРОВАТЬ',
        copied: '🔗 Ссылка скопирована!',
        mainMenu: '🏠 <b>Главное меню</b>:'
    },
    en: {
        welcome: '✨ <b>Welcome to ZUZIM Swap!</b> ✨\n\nSwap ETH and USDT to ZUZ.\n1 ZUZ = 0.0001 ETH\n\n📊 <b>Features:</b>\n• 🔒 Staking 25% APY\n• 🤝 Referral program (5%)\n• 💰 Buy ZUZ with ETH',
        profile: '👤 <b>Your profile</b>\n\n🆔 ID: <code>%id%</code>\n🎮 Name: %name%\n\n📊 Balance can be viewed in the swap app.',
        help: '❓ <b>Help</b>\n\n• Buy ZUZ: ETH → ZUZ (0.0001 ETH per ZUZ)\n• Staking: stake ZUZ at 25% APY\n• Referrals: invite friends and get 5% of their purchases',
        referral: '👥 <b>Referral program</b>\n\nInvite friends and get <b>5%</b> from their purchases!\n\n🔗 Your link:\n<code>%link%</code>',
        copy: '📋 COPY',
        copied: '🔗 Link copied!',
        mainMenu: '🏠 <b>Main menu</b>:'
    }
};

function getLang(ctx) {
    const lang = ctx.from.language_code?.toLowerCase() || 'en';
    if (lang === 'ru' || lang === 'uk' || lang === 'be') return 'ru';
    return 'en';
}

function t(ctx, key, params = {}) {
    let lang = getLang(ctx);
    let text = translations[lang][key] || translations.en[key];
    for (let [k, v] of Object.entries(params)) {
        text = text.replace(`%${k}%`, v);
    }
    return text;
}

// ========== ОБРАБОТЧИКИ ==========
bot.start(async (ctx) => {
    const lang = getLang(ctx);
    await ctx.replyWithHTML(t(ctx, 'welcome'), lang === 'ru' ? appButtonRu() : appButton());
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.hears(['🚀 OPEN SWAP', '🚀 ОТКРЫТЬ ОБМЕННИК'], async (ctx) => {
    const lang = getLang(ctx);
    await ctx.reply(`👇 ${lang === 'ru' ? 'Открой обменник:' : 'Open swap:'}`, lang === 'ru' ? appButtonRu() : appButton());
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.hears(['👤 PROFILE', '👤 ПРОФИЛЬ'], async (ctx) => {
    const lang = getLang(ctx);
    await ctx.replyWithHTML(
        t(ctx, 'profile', { id: ctx.from.id, name: ctx.from.first_name }),
        lang === 'ru' ? appButtonRu() : appButton()
    );
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.hears(['❓ HELP', '❓ ПОМОЩЬ'], async (ctx) => {
    const lang = getLang(ctx);
    await ctx.replyWithHTML(t(ctx, 'help'));
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.hears(['👥 REFERRALS', '👥 ПАРТНЁРЫ'], async (ctx) => {
    const lang = getLang(ctx);
    const refLink = `https://t.me/zuzimswap_bot?start=ref_${ctx.from.id}`;
    await ctx.replyWithHTML(
        t(ctx, 'referral', { link: refLink }),
        Markup.inlineKeyboard([
            [Markup.button.callback(t(ctx, 'copy'), 'copy_ref')]
        ])
    );
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.action('copy_ref', async (ctx) => {
    const lang = getLang(ctx);
    const refLink = `https://t.me/zuzimswap_bot?start=ref_${ctx.from.id}`;
    await ctx.answerCbQuery();
    await ctx.reply(`🔗 <code>${refLink}</code>`, { parse_mode: 'HTML' });
    await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
});

bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        const lang = getLang(ctx);
        await ctx.reply(t(ctx, 'mainMenu'), { parse_mode: 'HTML', ...(lang === 'ru' ? mainMenuRu() : mainMenu()) });
    }
});

bot.launch();
console.log('✅ ZUZIM Swap Bot запущен (многоязычный)');
