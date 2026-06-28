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

    console.log(streamMetaData);

    if (!streamMetaData.data) {
      console.log(streamMetaData)
      return {
        redirect: true,
        data: "",
      };
    }

    const meta = streamMetaData.data.meta;

    if (!streamMetaData.data.meta.is_active) {
      return {
        redirect: true,
        data: streamMetaData.data.meta.fallback_url ?? "",
      };
    }

    // when server supports m3u8
    if (streamMetaData.data.meta.m3u8_support) {
      const streamUrl = `${meta.server_url}/play/live.php?mac=${meta.stb_mac}&stream=${meta.stream_id}&extension=m3u8`;
      const manifestPlaylist = await this.getManifestPlaylist(streamUrl);
      return {
        redirect: false,
        data: manifestPlaylist,
      };
    }

    return {
      redirect: true,
      data: meta.ts_stream_url ?? "",
    };
  }

  private async getManifestPlaylist(playlink: string) {
    const request = await fetch(playlink, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const response = await request.text();
    const url = new URL(request.url);
    const origin = url.origin;

    const manifest = response.replaceAll("/hls", `${origin}/hls`);
    return manifest;
  }
}
