import { NexstreamClient } from "../../lib/nexstream_client.js";

interface MoviesCateogires {
    category_id: string;
    category_name: string,
    parent_id: number
}
interface MovieCategoriesResponse {
    success: boolean;
    message: string;
    data: {
        movie_categories: MoviesCateogires[]
    } | null

}

export class GetMovieCategoriesService {
    private readonly nexstreamClient: NexstreamClient
    constructor() {
        this.nexstreamClient = new NexstreamClient();
    }

    async execute(username: string, password: string, ip: string) {
        const response: MovieCategoriesResponse = await this.nexstreamClient.request("movie/categories", {
            username,
            password,
            user_ip: ip
        });

        if (!response.success || !response.data) {
            return {
                d: response.message,
                a: response.success,
                r: response.data
            };
        }

        return response.data.movie_categories
    }
}