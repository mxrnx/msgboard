import type { Statement } from "sqlite3";
import * as sqlite3 from "sqlite3";
import { type ISqlite, open } from "sqlite";
import type { Post } from "./models/post";
import type { Thread } from "./models/thread";
import type { Reply } from "./models/reply";
import { config } from "./config";
import { transformPostMessage } from "./utils/stringUtils";

const dbFile = "./posts.db";

export async function initDb() {
  const db = await openDb();

  await db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            type        TEXT CHECK (type IN ('thread', 'reply')) NOT NULL,
            message     TEXT NOT NULL,
            timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,

            -- Reply
            reply_to    INTEGER,

            -- Thread
            title       TEXT,
            bump        DATETIME DEFAULT CURRENT_TIMESTAMP,
            icon        TEXT,
            isArchived  BOOLEAN DEFAULT FALSE
        );
  `);

  return db;
}

export async function openDb() {
  return await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
}

export async function insertPost(
  post: Post,
): Promise<ISqlite.RunResult<Statement>> {
  const message = transformPostMessage(post.message);
  const db = await openDb();

  const stmt = await db.prepare(`
        INSERT INTO posts (message, icon, reply_to, type, title)
        VALUES (?, ?, ?, ?, ?)
    `);

  switch (post.type) {
    case "thread":
      return await stmt.run(message, post.icon, null, post.type, post.title);
    case "reply":
      return await stmt.run(message, null, post.reply_to, post.type, null);
    default:
      throw new Error(`Missing post type`);
  }
}

export async function archiveThreadsIfNecessary() {
  const threads = await getActiveThreads();
  if (threads.length <= config.maxActiveThreads) return;

  const idsToArchive = threads
    .slice(config.maxActiveThreads)
    .map((thread) => thread.id)
    .join(",");

  const db = await openDb();
  const stmt = await db.prepare(
    `UPDATE posts SET isArchived = TRUE WHERE id in (${idsToArchive})`,
  );

  stmt.run();

  // TODO: maybe also archive the replies? Currently there's nothing using that status though.
}

export async function existsActiveThread(thread_id: number) {
  const db = await openDb();

  const stmt = await db.prepare(
    "SELECT * FROM posts WHERE type = 'thread' AND id = ? AND NOT isArchived",
  );

  const threads = (await stmt.all<Thread[]>(thread_id)) as Thread[];
  return threads.length !== 0;
}

export async function bumpThread(thread_id: number) {
  const db = await openDb();

  const stmt = await db.prepare(
    "UPDATE posts SET bump = CURRENT_TIMESTAMP WHERE id = ?;",
  );
  const result = await stmt.run(thread_id);
  if (result.changes !== 1)
    throw new Error(`Thread ${thread_id} could not be bumped`);

  stmt.finalize();
}

export async function getActiveThreads() {
  return await getThreads("active");
}

export async function getArchivedThreads() {
  return await getThreads("archived");
}

export async function getReplies() {
  const db = await openDb();

  return await db.all<Reply[]>(
    "SELECT id, type, message, datetime(timestamp, 'localtime') AS timestamp, reply_to FROM posts WHERE type = 'reply' ORDER BY timestamp",
  );
}

async function getThreads(threadStatus: "active" | "archived") {
  const db = await openDb();

  // NB: bumps are not transposed to local timezone, since they're only used for sorting
  return await db.all<Thread[]>(
    `SELECT id, type, message, datetime(timestamp, 'localtime') AS timestamp, title, bump, icon, isArchived FROM posts WHERE type = 'thread' AND ${threadStatus === "active" ? "NOT" : ""} isArchived ORDER BY bump DESC`,
  );
}
