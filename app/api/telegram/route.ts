import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// Use Service Role Key for server-side operations (bypasses RLS)
import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware to verify secret if needed, or just standard webhook handling
// For this implementation, we will trust the path or header if valid

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Verify secret header if you set one in setWebhook calls
        const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
        if (WEBHOOK_SECRET && secretToken !== WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Process the update
        // We recreate the bot instance logic here or use bot.handleUpdate
        // But Telegraf's handleUpdate assumes Node.js request/response usually.
        // simpler to check the update type manually or use a helper.

        // Using handleUpdate with a conceptual generic request/response if needed
        // or just manually checking the body which is easier for serverless functions
        // to avoid cold start overhead of heavy frameworks sometimes.

        // Let's implement basic manual dispatch for simplicity and control in serverless
        // or use telegraf.handleUpdate if adapted.

        await bot.handleUpdate(body);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error handling telegram update", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Bot Logic (Should ideally be in a service, but inline for now to test)
// Bot Logic

// 1. Start Command / Main Menu
bot.command("start", async (ctx) => {
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

// 2. Add Book Instruction
bot.action("add_book", async (ctx) => {
    await ctx.reply("📸 *To add a book:*\n\nSend me a **Photo** of the cover and write the **Book Title** as the caption.", { parse_mode: "Markdown" });
    await ctx.answerCbQuery();
});

// 3. User sends photo (Add Book)
bot.on("photo", async (ctx) => {
    try {
        const photos = ctx.message.photo;
        const caption = ctx.message.caption;

        if (!caption) {
            await ctx.reply("❌ Please provide a Title for the book as a caption when sending the photo.");
            return;
        }

        const processingMsg = await ctx.reply("⏳ Uploading...");

        // Get the largest photo
        const photoFileId = photos[photos.length - 1].file_id;
        const fileLink = await ctx.telegram.getFileLink(photoFileId);

        const response = await fetch(fileLink.toString());
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = `${Date.now()}-${photoFileId}.jpg`;

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from("book-covers")
            .upload(fileName, buffer, {
                contentType: "image/jpeg",
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase upload error", uploadError);
            await ctx.telegram.editMessageText(ctx.chat.id, processingMsg.message_id, undefined, `❌ Error uploading image: ${uploadError.message}`);
            return;
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-covers/${fileName}`;

        // Save to DB
        const book = await prisma.book.create({
            data: {
                title: caption,
                imageUrl: imageUrl,
                status: "AVAILABLE"
            }
        });

        await ctx.telegram.editMessageText(ctx.chat.id, processingMsg.message_id, undefined, `✅ Book Added: ${book.title}\nStatus: AVAILABLE`);

    } catch (e) {
        console.error(e);
        await ctx.reply("Failed to process book.");
    }
});

// 4. List Books (Manage)
bot.action("list_books", async (ctx) => {
    const books = await prisma.book.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    if (books.length === 0) {
        await ctx.reply("No books found.");
        await ctx.answerCbQuery();
        return;
    }

    // Send a message for each book with actions
    for (const b of books) {
        await ctx.reply(`📖 *${b.title}*\nStatus: ${b.status}`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❌ Delete", callback_data: `delete_${b.id}` },
                        { text: b.status === "AVAILABLE" ? "🔒 Mark Taken" : "✅ Mark Available", callback_data: `toggle_${b.id}` }
                    ]
                ]
            }
        });
    }
    await ctx.answerCbQuery();
});

// 5. Delete Action
bot.action(/delete_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];
    try {
        await prisma.book.delete({ where: { id: bookId } });
        await ctx.reply("🗑️ Book deleted.");
        // Optional: Delete the menu message
        await ctx.deleteMessage();
    } catch (e) {
        await ctx.reply("❌ Error deleting book (maybe already deleted).");
    }
    await ctx.answerCbQuery();
});

// 6. Toggle Status Action
bot.action(/toggle_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];
    try {
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book) return;

        const newStatus = book.status === "AVAILABLE" ? "TAKEN" : "AVAILABLE";

        await prisma.book.update({
            where: { id: bookId },
            data: {
                status: newStatus,
                renterName: newStatus === "AVAILABLE" ? null : "Manual Update",
                renterPhone: newStatus === "AVAILABLE" ? null : "N/A"
            }
        });

        // Edit the message to reflect new status
        await ctx.editMessageText(`📖 *${book.title}*\nStatus: ${newStatus}`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❌ Delete", callback_data: `delete_${bookId}` },
                        { text: newStatus === "AVAILABLE" ? "🔒 Mark Taken" : "✅ Mark Available", callback_data: `toggle_${bookId}` }
                    ]
                ]
            }
        });

    } catch (e) {
        await ctx.reply("❌ Error updating status.");
    }
    await ctx.answerCbQuery();
});

// 7. Returns (List Taken Books)
bot.command("returns", async (ctx) => {
    const rentedBooks = await prisma.book.findMany({
        where: { status: "TAKEN" }
    });

    if (rentedBooks.length === 0) {
        await ctx.reply("No books are currently rented.");
        return;
    }

    const buttons = rentedBooks.map(b => ([
        { text: `Return: ${b.title} (${b.renterName || 'Unknown'})`, callback_data: `return_${b.id}` }
    ]));

    await ctx.reply("Select a book to mark as returned:", {
        reply_markup: {
            inline_keyboard: buttons
        }
    });
});

bot.action("returns", async (ctx) => {
    // Re-use the command logic for the button click
    const rentedBooks = await prisma.book.findMany({
        where: { status: "TAKEN" }
    });

    if (rentedBooks.length === 0) {
        await ctx.reply("No books are currently rented.");
        await ctx.answerCbQuery();
        return;
    }

    const buttons = rentedBooks.map(b => ([
        { text: `Return: ${b.title} (${b.renterName || 'Unknown'})`, callback_data: `return_${b.id}` }
    ]));

    await ctx.reply("Select a book to mark as returned:", {
        reply_markup: {
            inline_keyboard: buttons
        }
    });
    await ctx.answerCbQuery();
});

bot.action(/return_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];
    await prisma.book.update({
        where: { id: bookId },
        data: { status: "AVAILABLE", renterName: null, renterPhone: null }
    });
    await ctx.reply("✅ Book marked as returned!");
    await ctx.deleteMessage();
    await ctx.answerCbQuery();
});

// 8. Help
bot.command("help", async (ctx) => {
    sendHelp(ctx);
});

bot.action("help", async (ctx) => {
    sendHelp(ctx);
    await ctx.answerCbQuery();
});

async function sendHelp(ctx: any) {
    await ctx.reply(
        "**Bot Commands:**\n" +
        "/start - Open Main Menu\n" +
        "/returns - Manage Returns\n" +
        "/help - Show this message\n\n" +
        "*Upload:* Send a Photo with a Caption.\n" +
        "*Edit/Delete:* Use the 'Manage Books' menu.",
        { parse_mode: "Markdown" }
    );
}

// Important: Next.js builds pages statically by default, API routes are dynamic but verify
export const dynamic = 'force-dynamic';
