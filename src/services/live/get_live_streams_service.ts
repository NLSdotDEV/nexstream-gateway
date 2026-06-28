import { NexstreamClient } from "../../lib/nexstream_client.js";
import { HttpContext } from "../../types/http_context.js";

interface LiveStreams {
  category_id: string;
  num: number;
  name: string;
  stream_type: "live" | "movie" | "serie";
  stream_id: number;
  stream_icon: string | null;
  epg_channel_id: string;
  added: string | null;
  custom_sid: string | null;
  tv_archive: number;
  direct_source: string | null;
  tv_archive_duration: number;
}

interface GetLiveStreamsReponse {
  success: boolean;
  message: string;
  data: {
    live_streams: LiveStreams[];
  } | null;
}

export class GetLiveStreamsService {
  private nexstreamClient: NexstreamClient;
  constructor() {
    this.nexstreamClient = new NexstreamClient();
  }
  async execute(
    username: string,
    password: string,
    ip: string,
    categoryId: string | null,
  ) {
    const payload = {
      username: username,
      password: password,
      user_ip: ip,
      category_id: categoryId,
    };
    const liveStreams = await this.nexstreamClient.request<GetLiveStreamsReponse>(
      "live/streams",
      payload,
    );

    return liveStreams.data?.live_streams;
  }
}
