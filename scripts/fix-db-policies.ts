import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPolicies() {
    try {
        console.log("Enabling RLS on 'Book' table...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;`);

        console.log("Adding Read Policy...");
        // Drop if exists to avoid error on rerun
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Enable read access for all users" ON "Book";`);
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Enable read access for all users" 
      ON "Book" FOR SELECT 
      USING (true);
    `);

        console.log("Adding Write Policy (Service Role only implicit, but letting Anon read is key).");
        // Prisma uses the connection string which is usually the 'postgres' user or similar admin, so it handles writes fine.
        // The previous error was Storage related.
        // However, if the user interacts via client-side Supabase later, they might need policies. 
        // For now, let's just allow Public Read.

        console.log("Policies updated successfully.");
    } catch (e) {
        console.error("Error updating policies:", e);
    } finally {
        await prisma.$disconnect();
    }
}

fixPolicies();
