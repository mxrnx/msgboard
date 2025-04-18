import * as sqlite3 from 'sqlite3'
import { open } from 'sqlite'

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
    })
}