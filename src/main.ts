import express, { type Express } from "express";
import { appConfig } from "./config/app.js";
import { GlobalErrorHandlerMiddleware } from "./middleware/global_error_handler.js";
import { xtreamController } from "./controllers/xtream_controller.js";
import { livePlayerController } from "./controllers/live_player_controller.js";
import { m3uController } from "./controllers/m3u_controller.js";
import { bootstrap } from "./bootstrap/app.js";

const port = appConfig.port;
const app = express();
app.set("trust proxy", "loopback, linklocal, uniquelocal");
app.use(express.json());

app.use("/", livePlayerController);
app.use("/", m3uController);
app.use("/player_api.php", xtreamController);

app.use(GlobalErrorHandlerMiddleware.handle);

await bootstrap();

app.listen(parseInt(port.toString(), 10), "", () => {
  
});
