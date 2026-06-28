import { Request, Response, Router } from "express";
import { HttpContext } from "../types/http_context.js";
import { PlaylistAuth } from "../services/auth/playlist_auth_service.js";
import { GetLiveCategoriesService } from "../services/live/get_live_categories_service.js";
import { GetLiveStreamsService } from "../services/live/get_live_streams_service.js";

class XtreamController {
  private playlistAuthService: PlaylistAuth;
  private getLiveCategoriesService: GetLiveCategoriesService;
  private getLiveStreamsService: GetLiveStreamsService;

  constructor() {
    this.playlistAuthService = new PlaylistAuth();
    this.getLiveCategoriesService = new GetLiveCategoriesService();
    this.getLiveStreamsService = new GetLiveStreamsService();
  }

  async execute(context: HttpContext) {
    const { request, response } = context;
    const serverInfo = {
      url: "nxlive.site",
      port: "443",
      https_port: "443",
      server_protocol: "https",
      rtmp_port: "80",
      timezone: "UTC",
      timestamp_now: new Date(),
      time_now: new Date().toLocaleDateString("fr"),
    };

    const { username, password, action, category_id } = request.query;

    const userIp = request?.ip?.toString();
    const categoryId = category_id?.toString() ?? null;

    if (!username || !password || !userIp) {
      return response.status(200).json({
        user_info: {
          auth: 0,
          message: "the ip was not provided",
        },
        server_info: serverInfo,
      });
    }

    switch (action?.toString()) {
      case "get_live_categories":
        const liveCategories = await this.getLiveCategories(
          username.toString(),
          password.toString(),
          userIp,
        );

        console.log(liveCategories)
        return response.status(200).json(liveCategories);

      case "get_live_streams":
        const liveStreams = await this.getLiveStreamsService.execute(
          username.toString(),
          password.toString(),
          userIp,
          categoryId,
        );
        return response.status(200).json(liveStreams);

      case "authenticate":
        const authentication = await this.authenticate(
          { request, response },
          username.toString(),
          password.toString(),
          userIp.toString(),
        );
        return response.status(200).json(authentication);

      default:
        const defaultAction = await this.authenticate(
          { request, response },
          username.toString(),
          password.toString(),
          userIp.toString(),
        );
        return response.status(200).json(defaultAction);
    }
  }

  private async authenticate(
    { request }: HttpContext,
    username: string,
    password: string,
    ip: string,
  ) {
    const playlist = await this.playlistAuthService.execute(
      username,
      password,
      ip,
    );

    const [, port] = request.host.split(":");

    const serverInfo = {
      url: request.host,
      port: port?.toString() ?? '80',
      https_port: "443",
      server_protocol: request.protocol,
      rtmp_port: "80",
      timezone: "UTC",
      timestamp_now: 1782408786,
      time_now: new Date().toISOString(),
    };

    return {
      user_info: playlist,
      server_info: serverInfo,
    };
  }

  private async getLiveCategories(
    username: string,
    password: string,
    ip: string,
  ) {
    const liveCategories = await this.getLiveCategoriesService.execute(
      username,
      password,
      ip,
    );
    return liveCategories;
  }
}

const xtreamController = Router();
const controller = new XtreamController();

xtreamController.get("/", async (request: Request, response: Response) => {
  await controller.execute({ request, response });
});

export { xtreamController };
