import { streamFallbackConfig as fallbackStream } from "../../config/stream.js";
import { NexstreamClient } from "../../lib/nexstream_client.js";
import { RedisCacheService as CacheService } from "../cache/redis_cache_service.js";

interface LivePlayerResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      is_active: boolean;
      connection: string | null;
      server_url: string;
      ts_stream_url: string | null;
      stream_id: number;
      m3u8_support: boolean;
      fallback_url: string | null;
    };
  } | null;
}

interface LivePlayerExecuteReturn {
  redirect: boolean;
  stream: string;
}

export class LivePlayerService {
  private readonly cache: CacheService;
  private readonly nexstreamClient: NexstreamClient;

  constructor() {
    this.nexstreamClient = new NexstreamClient();
    this.cache = new CacheService();
  }

  async execute(
    username: string,
    password: string,
    streamId: number,
    ip: string,
  ): Promise<LivePlayerExecuteReturn> {
    const cachedStream = await this.loadFromCache(username, password, streamId);

    if (cachedStream) {
      return cachedStream;
    }

    const stream = await this.loadFromApi(username, password, streamId, ip);

    return stream;
  }

  private async loadFromCache(
    username: string,
    password: string,
    streamId: number,
  ) {
    const { serverCacheKey, connectionCacheKey } = this.getCacheKeys(
      username,
      password,
    );
    const stb = await this.cache.get(connectionCacheKey);
    const server = await this.cache.get(serverCacheKey);

    if (!stb || !server) {
      return null;
    }

    const manifest = await this.getManifest(server, stb, streamId);
    return manifest;
  }

  private async loadFromApi(
    username: string,
    password: string,
    streamId: number,
    userIp: string,
  ) {
    const payload = {
      username,
      password,
      stream_id: streamId,
      user_ip: userIp,
    };

    const { serverCacheKey, connectionCacheKey } = this.getCacheKeys(
      username,
      password,
    );

    const response = await this.nexstreamClient.request<LivePlayerResponse>(
      "live/play",
      payload,
    );

    if (!response.success) {
      return {
        redirect: true,
        stream: fallbackStream.unplayable_stream_screen,
      };
    }

    const meta = response.data?.meta;

    if (!meta) {
      return {
        redirect: true,
        stream: fallbackStream.unplayable_stream_screen,
      };
    }

    if (!meta.is_active) {
      return {
        redirect: true,
        stream: meta.fallback_url ?? fallbackStream.unplayable_stream_screen,
      };
    }

    if (!meta.m3u8_support) {
      return {
        redirect: true,
        stream: meta.ts_stream_url ?? fallbackStream.unplayable_stream_screen,
      };
    }

    // save to cache
    const ttl = this.cache.ttlToMn(2);
    await this.cache.set(serverCacheKey, meta.server_url, ttl);
    await this.cache.set(connectionCacheKey, meta.connection, ttl);

    const manifest = await this.getManifest(
      meta.server_url,
      meta.connection ?? "",
      meta.stream_id,
    );

    return manifest;
  }

  private getCacheKeys(username: string, password: string) {
    const connectionCacheKey = `sub:${username}:${password}:stb`;
    const serverCacheKey = `sub:${username}:${password}:server`;

    return {
      connectionCacheKey,
      serverCacheKey,
    };
  }

  private async getManifest(
    serverUrl: string,
    stbMac: string,
    streamId: number,
  ) {
    const url = new URL(serverUrl);
    const m3u8Url = `${url.origin}/play/live.php?mac=${stbMac}&stream=${streamId}&extension=m3u8`;

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30 * 1000);

    try {
      const request = await fetch(m3u8Url, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        signal: abortController.signal,
      });

      const response = await request.text();

      const url = new URL(request.url);
      const origin = url.origin;

      const manifest = response.replaceAll("/hls", `${origin}/hls`);

      return {
        redirect: false,
        stream: manifest,
      };
    } catch (error) {
      clearTimeout(timeout);
      return {
        redirect: true,
        stream: fallbackStream.unplayable_stream_screen,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
