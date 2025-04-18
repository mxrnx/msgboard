import type {Statement} from "sqlite3";
import * as sqlite3 from 'sqlite3'
import {type ISqlite, open} from 'sqlite'
import type {Post} from "./models/post";
import {Thread} from "./models/thread";

const dbFile = './posts.db';

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
            icon        TEXT
        );
  `)

    return db;
}

export async function openDb() {
    return await open({
        filename: dbFile,
        driver: sqlite3.Database
    });
}

export async function insertPost(post: Post): Promise<ISqlite.RunResult<Statement>> {
    const db = await openDb();

    const stmt = await db.prepare(`
        INSERT INTO posts (message, icon, reply_to, type, title)
        VALUES (?, ?, ?, ?, ?)
    `)

    switch (post.type) {
        case 'thread':
            return await stmt.run(
                post.message,
                post.icon,
                null,
                post.type,
                post.title
            );
        case 'reply':
            return await stmt.run(
                post.message,
                null,
                post.reply_to,
                post.type,
                null,
            );
        default:
            throw new Error(`Missing post type`);
    }
}

export async function existsThread(thread_id: number) {
    const db = await openDb();

    const stmt = await db.prepare("SELECT * FROM posts WHERE type = 'thread' AND id = ?");

    const threads = await stmt.all<Thread[]>(thread_id) as Thread[];
    return (threads.length !== 0)
}

export async function bumpThread(thread_id: number)
{
    const db = await openDb();

    const stmt = await db.prepare("UPDATE posts SET bump = CURRENT_TIMESTAMP WHERE id = ?;");
    const result = await stmt.run(thread_id);
    if (result.changes !== 1)
        throw new Error(`Thread ${thread_id} could not be bumped`);

    stmt.finalize();
}