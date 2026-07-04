import { streamFallbackConfig } from "../../config/stream.js";
import { NexstreamClient } from "../../lib/nexstream_client.js";

interface LivePlayerResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      is_active: boolean;
      stb_mac: string | null;
      server_url: string;
      ts_stream_url: string | null;
      stream_id: number;
      m3u8_support: boolean;
      fallback_url: string | null;
    };
  } | null;
}

export class LivePlayerService {
  private nexstreamClient: NexstreamClient;

  constructor() {
    this.nexstreamClient = new NexstreamClient();
  }

  async execute(
    username: string,
    password: string,
    streamId: number,
    ip: string,
  ) {
    const payload = {
      username: username,
      password: password,
      user_ip: ip,
      stream_id: streamId,
    };

    const streamMetaData =
      await this.nexstreamClient.request<LivePlayerResponse>(
        "live/play",
        payload,
      );

    if (!streamMetaData.data) {
      return {
        redirect: true,
        data: streamFallbackConfig.unplayable_stream_screen,
      };
    }

    const meta = streamMetaData.data.meta;

    if (!streamMetaData.data.meta.is_active) {
      return {
        redirect: true,
        data:
          streamMetaData.data.meta.fallback_url ??
          streamFallbackConfig.inactive_server_screen,
      };
    }

    // when server supports m3u8
    if (streamMetaData.data.meta.m3u8_support) {
      try {
        const streamUrl = `${meta.server_url}/play/live.php?mac=${meta.stb_mac}&stream=${meta.stream_id}&extension=m3u8`;
        const manifestPlaylist = await this.getManifestPlaylist(streamUrl);
        return {
          redirect: false,
          data: manifestPlaylist,
        };
      } catch (error) {
        return {
          redirect: true,
          data: streamFallbackConfig.unplayable_stream_screen,
        };
      }
    }

    return {
      redirect: true,
      data: meta.ts_stream_url ?? streamFallbackConfig.unplayable_stream_screen,
    };
  }

  private async getManifestPlaylist(playlink: string) {
    const abortController = new AbortController();

    const timeout = setTimeout(() => {
      abortController.abort();
    }, 30000);

    const request = await fetch(playlink, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      signal: abortController.signal
    });

    const response = await request.text();
    const url = new URL(request.url);
    const origin = url.origin;

    const manifest = response.replaceAll("/hls", `${origin}/hls`);
    return manifest;
  }
}
