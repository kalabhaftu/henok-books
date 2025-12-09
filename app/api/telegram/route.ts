import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Init Bot & Supabase
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
        if (WEBHOOK_SECRET && secretToken !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await bot.handleUpdate(body);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error handling telegram update", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// --- BOT LOGIC ---

// 1. Start / Main Menu
bot.command("start", async (ctx) => {
    const chatId = ctx.chat.id;
    // Reset Session
    await prisma.botSession.upsert({
        where: { chatId: BigInt(chatId) },
        update: { step: "IDLE", tempData: {} },
        create: { chatId: BigInt(chatId), step: "IDLE", tempData: {} }
    });

    await ctx.reply("📚 *Welcome to Henok Books Admin* \nWhat would you like to do?", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "➕ Add Book", callback_data: "add_book" }],
                [{ text: "📚 Manage Books", callback_data: "list_books" }],
                [{ text: "↩️ Returns", callback_data: "returns" }],
                [{ text: "❓ Help", callback_data: "help" }]
            ]
        }
    });
});

// 2. Add Book Flow Start
bot.action("add_book", async (ctx) => {
    await ctx.reply("📸 *Step 1: Send Photo*\nPlease send a photo of the book cover.", { parse_mode: "Markdown" });
    await ctx.answerCbQuery();
});

// 3. Handle Photo (Step 1 -> 2)
bot.on("photo", async (ctx) => {
    try {
        const chatId = ctx.chat.id;
        const photos = ctx.message.photo;
        const photoFileId = photos[photos.length - 1].file_id;
        const fileLink = await ctx.telegram.getFileLink(photoFileId);

        const processingMsg = await ctx.reply("⏳ Processing image...");

        const response = await fetch(fileLink.toString());
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${photoFileId}.jpg`;

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from("book-covers")
            .upload(fileName, buffer, { contentType: "image/jpeg", upsert: false });

        if (uploadError) {
            await ctx.telegram.editMessageText(chatId, processingMsg.message_id, undefined, `❌ Upload Failed: ${uploadError.message}`);
            return;
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-covers/${fileName}`;

        // Update Session
        await prisma.botSession.upsert({
            where: { chatId: BigInt(chatId) },
            update: { step: "AWAITING_TITLE", tempData: { imageUrl } },
            create: { chatId: BigInt(chatId), step: "AWAITING_TITLE", tempData: { imageUrl } }
        });

        await ctx.telegram.deleteMessage(chatId, processingMsg.message_id);
        await ctx.reply("✅ Photo received!\n\n🔤 *Step 2: Enter Title*\nPlease reply with the book title.", { parse_mode: "Markdown" });

    } catch (e) {
        console.error(e);
        await ctx.reply("Failed to process photo.");
    }
});

// 4. Handle Text (Step 2 -> 3 -> Finish)
bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    if (text.startsWith("/")) return; // Ignore commands

    const session = await prisma.botSession.findUnique({
        where: { chatId: BigInt(chatId) }
    });

    if (!session || session.step === "IDLE") return;

    if (session.step === "AWAITING_TITLE") {
        const data = session.tempData as any;
        await prisma.botSession.update({
            where: { chatId: BigInt(chatId) },
            data: { step: "AWAITING_PRICE", tempData: { ...data, title: text } }
        });
        await ctx.reply(`📖 Title: *${text}*\n\n💰 *Step 3: Enter Price*\nPlease reply with the price (numbers only).`, { parse_mode: "Markdown" });
        return;
    }

    if (session.step === "AWAITING_PRICE") {
        const price = parseFloat(text);
        if (isNaN(price)) {
            await ctx.reply("❌ Invalid number. Please enter a valid price (e.g. 150).");
            return;
        }

        const data = session.tempData as any;
        const book = await prisma.book.create({
            data: {
                title: data.title,
                imageUrl: data.imageUrl,
                price: price,
                status: "AVAILABLE"
            }
        });

        await prisma.botSession.update({
            where: { chatId: BigInt(chatId) },
            data: { step: "IDLE", tempData: {} }
        });

        await ctx.reply(`✅ *Book Saved!*\n📖 ${book.title}\n💰 ${book.price} ETB`, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: "➕ Add Another", callback_data: "add_book" }]] }
        });
    }
});

// 5. Manage Books
bot.action("list_books", async (ctx) => {
    const books = await prisma.book.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    if (books.length === 0) {
        await ctx.reply("No books found.");
        await ctx.answerCbQuery();
        return;
    }
    for (const b of books) {
        await ctx.reply(`📖 *${b.title}*\n💰 ${b.price}\nStatus: ${b.status}`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[
                    { text: "❌ Delete", callback_data: `delete_${b.id}` },
                    { text: "🔄 Toggle Status", callback_data: `toggle_${b.id}` }
                ]]
            }
        });
    }
    await ctx.answerCbQuery();
});

bot.action(/delete_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];
    await prisma.book.delete({ where: { id: bookId } }).catch(() => { });
    await ctx.reply("🗑️ Book deleted.");
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
});

bot.action(/toggle_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (book) {
        const newStatus = book.status === "AVAILABLE" ? "TAKEN" : "AVAILABLE";
        await prisma.book.update({ where: { id: bookId }, data: { status: newStatus } });
        await ctx.reply(`Status updated to: ${newStatus}`);
    }
    await ctx.answerCbQuery();
});

// 6. Returns
bot.action("returns", async (ctx) => {
    const rentedBooks = await prisma.book.findMany({ where: { status: "TAKEN" } });
    if (rentedBooks.length === 0) {
        await ctx.reply("No rented books.");
        await ctx.answerCbQuery();
        return;
    }
    const buttons = rentedBooks.map(b => ([{ text: `Return: ${b.title}`, callback_data: `return_${b.id}` }]));
    await ctx.reply("Select book to return:", { reply_markup: { inline_keyboard: buttons } });
    await ctx.answerCbQuery();
});
bot.command("returns", async (ctx) => { /* Same logic as action, omitted to save space, but action covers menu */
    const rentedBooks = await prisma.book.findMany({ where: { status: "TAKEN" } });
    if (rentedBooks.length === 0) { await ctx.reply("No rented books."); return; }
    const buttons = rentedBooks.map(b => ([{ text: `Return: ${b.title}`, callback_data: `return_${b.id}` }]));
    await ctx.reply("Select book to return:", { reply_markup: { inline_keyboard: buttons } });
});

bot.action(/return_(.+)/, async (ctx) => {
    await prisma.book.update({ where: { id: ctx.match[1] }, data: { status: "AVAILABLE", renterName: null, renterPhone: null } });
    await ctx.reply("✅ Book returned!");
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
});

bot.action("help", async (ctx) => {
    await ctx.reply("Use the menu to Add, Manage, or Return books.");
    await ctx.answerCbQuery();
});

export const dynamic = 'force-dynamic';
