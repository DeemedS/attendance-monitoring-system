// drizzle.config.ts
import { defineConfig } from "drizzle-kit"
import { config } from 'dotenv';

config({path: '.env'});

export default defineConfig({
  schema: './server/database/schema.ts',
  dialect: 'postgresql',  
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!,
  },
});
