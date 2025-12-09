import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

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
bot.on("photo", async (ctx) => {
    // 1. Download photo
    // 2. Upload to Supabase
    // 3. Create Book in Prisma
    // 4. Reply

    try {
        const photos = ctx.message.photo;
        const caption = ctx.message.caption || "Untitled Book";

        // Get the largest photo
        const photoFileId = photos[photos.length - 1].file_id;
        const fileLink = await ctx.telegram.getFileLink(photoFileId);

        const response = await fetch(fileLink.toString());
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = `${Date.now()}-${photoFileId}.jpg`;

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("book-covers")
            .upload(fileName, buffer, {
                contentType: "image/jpeg",
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase upload error", uploadError);
            await ctx.reply(`Error uploading image: ${uploadError.message}`);
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

        await ctx.reply(`✅ Book Added: ${book.title}\nStatus: AVAILABLE`);

    } catch (e) {
        console.error(e);
        await ctx.reply("Failed to process book.");
    }
});

bot.command("returns", async (ctx) => {
    // List rented books
    const rentedBooks = await prisma.book.findMany({
        where: { status: "TAKEN" } // or RESERVED
    });

    if (rentedBooks.length === 0) {
        await ctx.reply("No books are currently rented.");
        return;
    }

    // Send buttons for each
    const buttons = rentedBooks.map(b => ([
        { text: `Return: ${b.title} (${b.renterName})`, callback_data: `return_${b.id}` }
    ]));

    await ctx.reply("Select a book to mark as returned:", {
        reply_markup: {
            inline_keyboard: buttons
        }
    });
});

bot.action(/return_(.+)/, async (ctx) => {
    const bookId = ctx.match[1];

    await prisma.book.update({
        where: { id: bookId },
        data: {
            status: "AVAILABLE",
            renterName: null,
            renterPhone: null
        }
    });

    await ctx.reply("✅ Book marked as returned!");
    // Optional: Delete the message or update it
    await ctx.deleteMessage();
});

// Important: Next.js builds pages statically by default, API routes are dynamic but verify
export const dynamic = 'force-dynamic';
