import express from "express";
import { addPost } from "./routes/addPost";
import * as path from "path";
import { init } from "./routes/init";
import { initDb } from "./db";

async function main() {
  await initDb();
  const app = express();
  app.use((req, res, next) => {
    const path = req.path;
    if (path === "/guide" || path === "/archive" || /^\/\d+$/.test(path)) {
      req.url += ".html";
    }
    next();
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("/init", init);
  app.post("/addPost", addPost);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main();
