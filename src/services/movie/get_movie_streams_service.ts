import { NexstreamClient } from "../../lib/nexstream_client.js";

interface MovieStreams {
    category_id: string,
    num: number,
    name: string,
    stream_type: string,
    stream_id: number,
    stream_icon: string,
    rating: string,
    rating_5based: number,
    added: string,
    container_extension: string,
    custom_sid: string,
    direct_source: string,
    cmd: string,
    is_adult: string
}
interface MovieStreamResponse {
    success: boolean,
    message: string,
    data: {
        movie_streams: MovieStreams[]
    } | null
}

export class GetMovieStreamsService {
    private readonly nexstreamCliebt: NexstreamClient;
    constructor() {
        this.nexstreamCliebt = new NexstreamClient();
    }

    async execute(username: string, password: string, ip: string) {
        const response: MovieStreamResponse = await this.nexstreamCliebt.request("movie/streams", {
            username,
            password,
            user_ip: ip
        });

        if (!response.success || !response.data) {
            return response;
        }

        return response.data.movie_streams

    }
}