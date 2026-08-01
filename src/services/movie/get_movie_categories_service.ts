import { NexstreamClient } from "../../lib/nexstream_client.js";

interface MovieCategories {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface GetMovieCategoriesResponse {
  success: boolean;
  message: string;
  message_code?: string;
  data: {
    movie_categories: MovieCategories[];
  } | null;
}

export class GetMovieCategoriesService {
  private nexstreamClient: NexstreamClient;
  constructor() {
    this.nexstreamClient = new NexstreamClient();
  }

  async execute(username: string, password: string, ip: string) {
    const payload = {
      username: username,
      password: password,
      user_ip: ip,
    };

    const categories =
      await this.nexstreamClient.request<GetMovieCategoriesResponse>(
        "movie/categories",
        payload,
      );

    return categories.data?.movie_categories;
  }
}
