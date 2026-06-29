import { Router } from "express";
import { GetLiveStreamsService } from "../services/live/get_live_streams_service.js";
import { GetLiveCategoriesService } from "../services/live/get_live_categories_service.js";
import { HttpContext } from "../types/http_context.js";

class M3uController {
  private getLiveCategoriesService: GetLiveCategoriesService;
  private getLiveStreamsService: GetLiveStreamsService;

  constructor() {
    this.getLiveCategoriesService = new GetLiveCategoriesService();
    this.getLiveStreamsService = new GetLiveStreamsService();
  }

  async execute({ request, response }: HttpContext) {
    const { username, password } = request.query;
    const userIp = request.ip;

    if (!username || !password || !userIp) {
      return response.status(200).json({});
    }

    const categories = await this.getLiveCategoriesService.execute(
      username.toString(),
      password.toString(),
      userIp,
    );

    if (!categories) {
      return response.json({});
    }

    const liveStreams = await this.getLiveStreamsService.execute(
      username.toString(),
      password.toString(),
      userIp,
      null,
    );

    if (!liveStreams) {
      return response.json({});
    }

    let playlistFile = "#EXTM3U\n";
    const baseUrl = `${request.protocol}://${request.get("host")}`;

    categories.forEach((category) => {
      const categoryId = category.category_id;

      liveStreams
        .filter((live) => live.category_id === categoryId)
        .forEach((live) => {
          const tvgId = live.epg_channel_id || "";
          const tvgName = live.name;
          const logo = live.stream_icon || "";
          const groupTitle = category.category_name;
          playlistFile += `#EXTINF:-1 tvg-ID="${tvgId}" tvg-name="${tvgName}" tvg-logo="${logo}" group-title="${groupTitle}",${live.name}\n`;
          playlistFile += `${baseUrl}/live/${username}/${password}/${live.stream_id}.m3u8\n`;
        });
    });

    return response
      .setHeader("Content-Type", "application/x-mpegURL")
      .setHeader(
        "Content-Disposition",
        `attachment; filename="${username}_${password}.m3u"`,
      )
      .send(playlistFile);
  }
}

const m3uController = Router();
const controller = new M3uController();

m3uController.get("/get.php", async (request, response) => {
  await controller.execute({ request, response });
});

export { m3uController };
