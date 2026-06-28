import { NexstreamClient } from "../../lib/nexstream_client.js";

interface LiveCategories {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface GetLiveCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    live_categories: LiveCategories[];
  } | null;
}

export class GetLiveCategoriesService {
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
      await this.nexstreamClient.request<GetLiveCategoriesResponse>(
        "live/categories",
        payload,
      );

    return categories.data?.live_categories;
  }
}
