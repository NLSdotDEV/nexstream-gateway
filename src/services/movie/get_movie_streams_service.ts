import { NexstreamClient } from "../../lib/nexstream_client.js";

interface MovieStreams {
  category_id: string;
  num: number;
  name: string;
  stream_type: "live" | "movie" | "serie";
  stream_id: number;
  stream_icon: string | null;
  rating: string | null;
  rating_5based: number;
  added: string | null;
  container_extension: string;
  custom_sid: string | null;
  direct_source: string | null;
  cmd: string | null;
  is_adult: string;
}

interface GetMovieStreamsResponse {
  success: boolean;
  message: string;
  message_code?: string;
  data: {
    /**
     * The adapter re-indexes the collection only on unfiltered calls. A call
     * carrying a category_id comes back keyed by the original index, so the
     * payload can be either a JSON array or an object of streams.
     */
    movie_streams: MovieStreams[] | Record<string, MovieStreams>;
  } | null;
}

export class GetMovieStreamsService {
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
      ...(categoryId ? { category_id: categoryId } : {}),
    };

    const movieStreams =
      await this.nexstreamClient.request<GetMovieStreamsResponse>(
        "movie/streams",
        payload,
      );

    if (!movieStreams.data?.movie_streams) {
      return undefined;
    }

    return this.toList(movieStreams.data.movie_streams);
  }

  private toList(streams: MovieStreams[] | Record<string, MovieStreams>) {
    return Array.isArray(streams) ? streams : Object.values(streams);
  }
}
