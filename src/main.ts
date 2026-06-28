import express from "express";
import { appConfig } from "./config/app.js";
import { GlobalErrorHandlerMiddleware } from "./middleware/global_error_handler.js";
import { xtreamController } from "./controllers/xtream_controller.js";
import { livePlayerController } from "./controllers/live_player_controller.js";

const app = express();
app.use(express.json());
const port = appConfig.port;

app.use("/", livePlayerController)
app.use("/player_api.php", xtreamController);

app.use(GlobalErrorHandlerMiddleware.handle);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
