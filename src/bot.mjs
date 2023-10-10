import {Bot, InlineKeyboard} from "grammy";
import {autoQuote} from "@roziscoding/grammy-autoquote";

export const {
    CHANNEL_ID: channel,
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop()
} = process.env;

export const bot = new Bot(token);

bot.use(autoQuote);

bot.callbackQuery("delete", async ctx => {
    try {
        const [{text}] = ctx.entities("url");
        const message = parseInt(new URL(text).searchParams.get("start"));
        await bot.api.deleteMessage(channel, message);
        await ctx.answerCallbackQuery("Done");
        return ctx.editMessageText(`File deleted`);
    } catch (e) {
        console.error(e);
        await ctx.answerCallbackQuery("Error");
        return ctx.reply(`Error occurred while deleting file`);
    }
});

bot.on("message:file", async ctx => {
    const {chat: {id}} = ctx;
    const {message_id: channel_message_id} = await ctx.forwardMessage(channel);
    const link = new URL(`https://${ctx.me.username}.t.me`);
    link.searchParams.set("start", channel_message_id.toString());
    const {message_id} = await ctx.reply(`Link to you file:\r\n\r\n${link.href}`, {
        reply_markup: new InlineKeyboard().text("Delete file", "delete")
    });
    return ctx.api.forwardMessage(channel, id, message_id);
});

bot.command("start", async (ctx, next) => {
    const {match, chat: {id}} = ctx;
    if (!match) return next();
    try {
        const message = parseInt(match);
        return await bot.api.copyMessage(id, channel, message);
    } catch (e) {
        console.error(e);
        return ctx.reply(`Bad link or file deleted`);
    }
});

bot.on("message:text", ctx => ctx.reply(`Send any file and get link to share`));
