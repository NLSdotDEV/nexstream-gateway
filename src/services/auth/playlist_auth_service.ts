import { NexstreamClient } from "../../lib/nexstream_client.js";

interface PlaylistAuthResponse {
  success: boolean;
  message: string;
  data: {
    xtream_response: {
      user_info: GatewayAuthUserInfo;
    };
  } | null;
}

interface GatewayAuthUserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: "Expired" | "Active";
  exp_date: string;
  is_trial: "1" | "0";
  active_cons: string;
  max_connections: string;
  created_at: string;
  allowed_output_formats: string[];
}

export class PlaylistAuth {
  private nexstreamClient: NexstreamClient;
  constructor() {
    this.nexstreamClient = new NexstreamClient();
  }

  async execute(username: string, password: string, ip: string) {
    const payload = {
      username,
      password,
      user_ip: ip,
    };

    const playlist = await this.nexstreamClient.request<PlaylistAuthResponse>(
      "auth",
      payload,
    );

    if (!playlist.success) {
      return {
        auth: 0,
        message: playlist.message,
      };
    }

    if (!playlist.data?.xtream_response.user_info) {
      return {
        auth: 0,
        message: playlist.message,
      };
    }

    return playlist.data.xtream_response.user_info;
  }
}
