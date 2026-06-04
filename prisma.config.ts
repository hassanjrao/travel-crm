import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config(); // no-op on Vercel (env already set), loads .env locally

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost/placeholder",
  },
});
