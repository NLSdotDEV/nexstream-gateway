import { appConfig } from "../config/app.js";

export class NexstreamClient {
  async request<T>(path: string, data: Record<any, any>): Promise<T> {
    const url = `${appConfig.apiBaseUrl}/gateway/${path}`;
    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "nx-api-key-id": appConfig.nexstreamApiKeyId,
        "nx-api-key": appConfig.nexstreamApiKey,
      },
      body: JSON.stringify(data),
    });

    const response = await req.json();
    return response;
  }
}
