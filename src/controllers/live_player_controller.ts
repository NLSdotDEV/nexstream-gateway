import { Router } from "express";
import { HttpContext } from "../types/http_context.js";
import { LivePlayerService } from "../services/live/live_player_service.js";

class LivePlayerController {
  private livePlayerService: LivePlayerService;

  constructor() {
    this.livePlayerService = new LivePlayerService();
  }

  async execute(context: HttpContext) {
    const { request, response } = context;
    const username = request.params.username.toString();
    const password = request.params.password.toString();
    const stream = request.params.stream.toString();
    const ip = request.ip?.toString();

    if (!username || !password || !stream || !ip) {
      return response.status(200).json({});
    }

    const [streamId, ext] = stream.split(".");

    const playlink = await this.livePlayerService.execute(
      username,
      password,
      parseInt(streamId, 10),
      ip,
    );

    if (playlink.redirect) {
      return response.redirect(playlink.data);
    }

    console.log(playlink);

    const headers = new Headers({
      "Content-Type": "application/x-mpegURL",
    });

    return response.status(200).setHeaders(headers).send(playlink.data);
  }
}

const router = Router();
const controller = new LivePlayerController();

const livePlayerController = router.get(
  "/live/:username/:password/:stream",
  async (request, response) => {
    await controller.execute({ request, response });
  },
);

export { livePlayerController };
