import ejs from "ejs";
import fs from "fs";
import path from "path";
import { getReplies, getActiveThreads, getArchivedThreads } from "./db";
import { type Thread, type ThreadIcon, threadIcons } from "./models/thread";
import { config } from "./config";
import { minify } from "html-minifier";
import type { Reply } from "./models/reply";

const templateDir = path.join(__dirname, "../views");
const publicDir = path.join(__dirname, "../public");

export async function generatePages(callback?: () => void) {
  const activeThreads = await getActiveThreads();
  const archivedThreads = await getArchivedThreads();
  const replies = await getReplies();

  renderThreadListing("index", activeThreads, replies);
  renderThreadListing("archive", archivedThreads, replies);

  // TODO: move static page generation to startup; for testing it's convenient to have them here
  render("guide.ejs", {}, "guide.html");
  render("english.ejs", {}, "english.html");

  for (const thread of [...activeThreads, ...archivedThreads]) {
    const children = replies.filter((r) => r.reply_to === thread.id);
    render("thread.ejs", { thread, replies: children }, `${thread.id}.html`);
  }

  if (callback) callback();
}

function render(template: string, data: object, outFile: string) {
  const filePath = path.join(templateDir, template);
  const layoutPath = path.join(templateDir, "layout.ejs");
  const body = ejs.render(
    fs.readFileSync(filePath, "utf8"),
    { ...data, config },
    { filename: filePath },
  );
  const html = ejs.render(
    fs.readFileSync(layoutPath, "utf8"),
    {
      title: config.forumTitle,
      body,
    },
    { filename: filePath },
  );
  const minifiedHtml = minify(html, {
    removeComments: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
  });
  fs.writeFileSync(path.join(publicDir, outFile), minifiedHtml);
}

// TODO move
type ThreadMap = {
  id: number;
  message: string;
  timestamp: Date;
  type: "thread";
  title: string;
  icon: ThreadIcon;
  bump: Date;
  isArchived: boolean;
  replies: Reply[];
}[];

function makeThreadMap(threads: Thread[], replies: Reply[]): ThreadMap {
  return threads.map((thread) => {
    const children = replies
      .filter((r) => r.reply_to === thread.id)
      .slice(-1 * config.visibleRepliesOnIndex);
    return { ...thread, replies: children };
  });
}

function renderThreadListing(
  name: string,
  threads: Thread[],
  replies: Reply[],
) {
  const activeThreadMap = makeThreadMap(threads, replies);

  render(
    `${name}.ejs`,
    { threads: activeThreadMap, threadIcons: threadIcons },
    `${name}.html`,
  );
}
