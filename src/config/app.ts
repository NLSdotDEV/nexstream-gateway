import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  env: process.env.NODE_ENV || "developpement",
  port: process.env.PORT || 3000,
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8000/api/v1",
  nexstreamApiKeyId: process.env.NEXSTREAM_API_KEY_ID || "",
  nexstreamApiKey: process.env.NEXSTREAM_API_KEY || "",
  redis: process.env.REDIS_URL || "redis://localhost:6001"
};