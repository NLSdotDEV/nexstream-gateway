import { streamFallbackConfig as fallbackStream } from "../../config/stream.js";
import { NexstreamClient } from "../../lib/nexstream_client.js";

interface MoviePlayerResponse {
  success: boolean;
  message: string;
  message_code?: string;
  data: {
    meta: {
      connection: string;
      server_url: string;
      stream_id: number;
      stream_type: "live" | "movie" | "serie";
      play_token: string;
      extension: string;
    };
  } | null;
}

interface MoviePlayerExecuteReturn {
  redirect: boolean;
  stream: string;
}

export class MoviePlayerService {
  private readonly nexstreamClient: NexstreamClient;

  constructor() {
    this.nexstreamClient = new NexstreamClient();
  }

  /**
   * A movie is a progressive file, not a manifest: the adapter returns the
   * ingredients of the portal url and the player is redirected onto it.
   * The leased connection and the play token are single use, so nothing here
   * is cached, every playback session leases again.
   */
  async execute(
    username: string,
    password: string,
    streamId: number,
    ip: string,
    extension: string | null,
  ): Promise<MoviePlayerExecuteReturn> {
    const payload = {
      username,
      password,
      stream_id: streamId,
      user_ip: ip,
    };

    const response = await this.nexstreamClient.request<MoviePlayerResponse>(
      "movie/play",
      payload,
    );

    if (!response.success) {
      return {
        redirect: true,
        stream: this.getFallbackScreen(response.message_code),
      };
    }

    const meta = response.data?.meta;

    if (!meta) {
      return {
        redirect: true,
        stream: fallbackStream.unplayable_stream_screen,
      };
    }

    const stream = this.getStreamUrl(
      meta.server_url,
      meta.connection ?? "",
      meta.stream_id,
      // the container the adapter stored wins over the one the player asked for
      meta.extension || extension || "mkv",
      meta.play_token,
    );

    return {
      redirect: true,
      stream,
    };
  }

  private getStreamUrl(
    serverUrl: string,
    connection: string,
    streamId: number,
    extension: string,
    playToken: string,
  ) {
    const url = new URL(serverUrl);

    return (
      `${url.origin}/play/movie.php` +
      `?mac=${encodeURIComponent(connection)}` +
      `&stream=${streamId}.${extension}` +
      `&play_token=${playToken}` +
      `&type=movie`
    );
  }

  private getFallbackScreen(messageCode?: string) {
    switch (messageCode) {
      case "NO_VALID_CONNECTION_FOUND":
        return fallbackStream.no_mac_found_screen;
      case "INACTIVE_SERVER":
        return fallbackStream.inactive_server_screen;
      case "CONCURRENT_STREAM":
        return fallbackStream.concurrent_stream_screen;
      case "SUBSCRIPTION_EXPIRED":
        return fallbackStream.subscription_expired_screen;
      case "SUBSCRIPTION_BLOCKED":
        return fallbackStream.subscription_blocked_screen;
      case "STREAM_NOT_FOUND":
        return fallbackStream.stream_not_found_screen;
      default:
        return fallbackStream.unplayable_stream_screen;
    }
  }
}
