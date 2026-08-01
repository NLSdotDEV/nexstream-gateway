import { Router } from "express";
import { HttpContext } from "../types/http_context.js";
import { MoviePlayerService } from "../services/movie/movie_player_service.js";

class MoviePlayerController {
  private moviePlayerService: MoviePlayerService;

  constructor() {
    this.moviePlayerService = new MoviePlayerService();
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

    const streamMeta = await this.moviePlayerService.execute(
      username,
      password,
      parseInt(streamId, 10),
      ip,
      ext ?? null,
    );

    return response.redirect(streamMeta.stream);
  }
}

const router = Router();
const controller = new MoviePlayerController();

const moviePlayerController = router.get(
  "/movie/:username/:password/:stream",
  async (request, response) => {
    await controller.execute({ request, response });
  },
);

export { moviePlayerController };
