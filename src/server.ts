import express from "express";
import { addPost } from "./routes/addPost";
import * as path from "path";
import { init } from "./routes/init";
import { initDb } from "./db";
import fs from "fs";
import * as https from "node:https";
import { config } from "./config";
import * as http from "node:http";

async function main() {
  await initDb();
  const app = express();
  app.use((req, res, next) => {
    const path = req.path;
    if (
      path === "/guide" ||
      path === "/archive" ||
      path === "/english" ||
      /^\/\d+$/.test(path)
    ) {
      req.url += ".html";
    }
    next();
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("/init", init);
  app.post("/addPost", addPost);

  const httpPort = config.httpPort || 80;
  const httpsPort = config.httpsPort || 443;

  // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  if (config.enableHttp)
    http.createServer(app).listen(httpPort, function () {
      console.log("HTTP server listening on port " + httpPort);
    });

  if (config.enableHttps)
    https.createServer(getHttpsOptions(), app).listen(httpsPort, function () {
      console.log("HTTPS server listening on port " + httpsPort);
    });
}

function getHttpsOptions() {
  // Certificate
  const privateKey = fs.readFileSync(config.privateKeyFile, "utf8");
  const certificate = fs.readFileSync(config.certificateFile, "utf8");
  const ca = fs.readFileSync(config.caFile, "utf8");

  return {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };
}

main();
