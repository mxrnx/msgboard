import ejs from "ejs";
import fs from "fs";
import path from "path";
import { getReplies, getActiveThreads } from "./db";
import { threadIcons } from "./models/thread";
import { config } from "./config";
import { minify } from "html-minifier";

const templateDir = path.join(__dirname, "../views");
const publicDir = path.join(__dirname, "../public");

export async function generatePages(callback?: () => void) {
  const threads = await getActiveThreads();
  const replies = await getReplies();

  const threadMap = threads.map((thread) => {
    const children = replies
      .filter((r) => r.reply_to === thread.id)
      .slice(-1 * config.visibleRepliesOnIndex);
    return { ...thread, replies: children };
  });

  render(
    "index.ejs",
    { threads: threadMap, threadIcons: threadIcons },
    "index.html",
  );

  // TODO: move static page generation to startup; for testing it's convenient to have them here
  render("guide.ejs", {}, "guide.html");

  for (const thread of threads) {
    const children = replies.filter((r) => r.reply_to === thread.id);
    render("thread.ejs", { thread, replies: children }, `${thread.id}.html`);
  }

  if (callback) callback();
}

function render(template: string, data: object, outFile: string) {
  const filePath = path.join(templateDir, template);
  const layoutPath = path.join(templateDir, "layout.ejs");
  const content = fs.readFileSync(filePath, "utf8");
  const body = ejs.render(content, { ...data, config }, { filename: filePath });
  const html = ejs.render(fs.readFileSync(layoutPath, "utf8"), {
    title: config.forumTitle,
    body,
  });
  const minifiedHtml = minify(html, {
    removeComments: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
  });
  fs.writeFileSync(path.join(publicDir, outFile), minifiedHtml);
}
