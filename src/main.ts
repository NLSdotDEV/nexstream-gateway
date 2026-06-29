import express from "express";
import { appConfig } from "./config/app.js";
import { GlobalErrorHandlerMiddleware } from "./middleware/global_error_handler.js";
import { xtreamController } from "./controllers/xtream_controller.js";
import { livePlayerController } from "./controllers/live_player_controller.js";
import { m3uController } from "./controllers/m3u_controller.js";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
const port = appConfig.port;

app.use("/", livePlayerController);
app.use("/", m3uController)
app.use("/player_api.php", xtreamController);

app.use(GlobalErrorHandlerMiddleware.handle);
app.listen(parseInt(port.toString(), 10), "", () => {
  console.log(`Server is running on port ${port}`);
});
