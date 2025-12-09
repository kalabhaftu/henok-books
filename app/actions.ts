'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

export async function reserveBook(prevState: any, formData: FormData) {
    const bookId = formData.get("bookId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;

    if (!bookId || !firstName || !lastName || !phone) {
        return { success: false, message: "All fields are required" };
    }

    try {
        // 1. Check if book is available
        const book = await prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            return { success: false, message: "Book not found" };
        }

        if (book.status !== "AVAILABLE") {
            return { success: false, message: "Book is already taken" };
        }

        // 2. Reserve book
        const updatedBook = await prisma.book.update({
            where: { id: bookId },
            data: {
                status: "TAKEN", // Or RESERVED
                renterName: `${firstName} ${lastName}`,
                renterPhone: phone,
            },
        });

        // 3. Notify Admin via Telegram
        // The admin ID should be set in environment variables
        const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

        if (ADMIN_CHAT_ID) {
            try {
                await bot.telegram.sendMessage(
                    ADMIN_CHAT_ID,
                    `🔔 <b>New Reservation</b>\n\n📖 <b>Book:</b> ${updatedBook.title}\n👤 <b>User:</b> ${firstName} ${lastName}\n📞 <b>Phone:</b> ${phone}`,
                    { parse_mode: "HTML" }
                );
            } catch (notifyError) {
                console.error("Failed to send Telegram notification:", notifyError);
                // Don't fail the request, just log
            }
        } else {
            console.warn("TELEGRAM_ADMIN_ID not set. Notification skipped. Please set this env var.");
        }

        revalidatePath("/");
        return { success: true, message: "Book reserved successfully!" };

    } catch (error) {
        console.error("Reservation Error:", error);
        return { success: false, message: "Failed to reserve book. Please try again." };
    }
}
