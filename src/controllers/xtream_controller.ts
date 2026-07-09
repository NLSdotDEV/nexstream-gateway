import { Request, Response, Router } from "express";
import { HttpContext } from "../types/http_context.js";
import { PlaylistAuth } from "../services/auth/playlist_auth_service.js";
import { GetLiveCategoriesService } from "../services/live/get_live_categories_service.js";
import { GetLiveStreamsService } from "../services/live/get_live_streams_service.js";
import { appConfig } from "../config/app.js";

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
    const serverInfo = this.getServerInfo(request);

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
      // live
      case "get_live_categories":
        const liveCategories = await this.getLiveCategories(
          username.toString(),
          password.toString(),
          userIp,
        );

        return response.status(200).json(liveCategories);

      case "get_live_streams":
        const liveStreams = await this.getLiveStreamsService.execute(
          username.toString(),
          password.toString(),
          userIp,
          categoryId,
        );
        return response.status(200).json(liveStreams);

      // vod
      case "get_vod_categories":
        return response.status(200).json([]);
      case "get_vod_streams":
        return response.status(200).json([]);

      // serie
      case "get_series_categories":
        return response.status(200).json([]);
      case "get_series":
         return response.status(200).json([]);

      // authentication
      case "authenticate":
        const authentication = await this.authenticate(
          { request, response },
          username.toString(),
          password.toString(),
          userIp.toString(),
        );
        return response.status(200).json(authentication);

      case "pannel":
        const pannel = await this.authenticate(
          { request, response },
          username.toString(),
          password.toString(),
          userIp.toString(),
        );
        return response.status(200).json(pannel);

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

    const serverInfo = this.getServerInfo(request);

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

  private getServerInfo(request: Request) {
    const [host, port] = request.host.split(":");
    const [time, ms] = new Date().toISOString().replace("T", " ").split(".");

    return {
      url: host,
      port: appConfig.env === "production" ? "443" : port?.toString(),
      https_port: "443",
      server_protocol: appConfig.env === "production" ? "https" : "http",
      rtmp_port: "8000",
      timezone: "Europe/London",
      timestamp_now: 1782408786,
      time_now: time,
    };
  }
}

const xtreamController = Router();
const controller = new XtreamController();

xtreamController.get("/", async (request: Request, response: Response) => {
  await controller.execute({ request, response });
});

export { xtreamController };
