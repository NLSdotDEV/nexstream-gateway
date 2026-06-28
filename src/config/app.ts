import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  port: process.env.PORT || 3000,
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8000/api/v1",
  nexstreamApiKeyId: process.env.NEXSTREAM_API_KEY_ID || "",
  nexstreamApiKey: process.env.NEXSTREAM_API_KEY || "",
};