import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";
import { logger } from "./lib/logger";
import { connectDb } from "./lib/connect-db";
import config from "./config";
// Routers

import { authRouter } from "./routers/auth.router";
import { companiesRouter } from "./routers/companies.router";

// import { workspacesRouter } from "./routes/workspaces.router";
const app = express();

// if (config.ENV_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "public")));
//   const indexPath = path.join(__dirname, "public", "index.html");
//   logger.info(`Serving static file from ${indexPath}`);
//   app.get("*", (req, res) => {
//     res.sendFile(indexPath);
//   });
// }

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true, exposedHeaders: "*" }));
app.use(cookieParser());
app.use(bodyParser.json());
// Custom middleware
app.use(loggerMiddleware);
app.use(authMiddleware);

app.use("/api", authRouter);
app.use("/api", companiesRouter);

app.get("/api/check-health", (req, res) => {
  res.send("API WORKS!");
});

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI;
const startServer = async () => {
  await connectDb(MONGO_URI!);
  app.listen(PORT, () => {
    logger.info(`Server is running on port http://localhost:${PORT}`);
  });
};
startServer();
