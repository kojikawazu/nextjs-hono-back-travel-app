import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
    corsAddress: process.env.CORS_ADDRESS as string,
    port: process.env.PORT || 3001,
    supabaseUrl: process.env.SUPABASE_URL as string,
    supabaseKey: process.env.SUPABASE_KEY as string,
    databaseUrl: process.env.DATABASE_URL as string,
}