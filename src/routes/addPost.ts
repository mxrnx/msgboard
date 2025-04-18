import type { Request, Response } from 'express'
import { openDb } from '../db'
import { generatePages } from '../generate'

export async function addPost(req: Request, res: Response) {
    const { message, icon, reply_to, title } = req.body
    const type = reply_to ? 'reply' : 'thread'

    const db = await openDb();
    const stmt = await db.prepare(`
        INSERT INTO posts (message, icon, reply_to, type, title)
        VALUES (?, ?, ?, ?, ?)
    `)

    const result = await stmt.run(
        message,
        type === 'thread' ? icon : null,
        type === 'reply' ? reply_to : null,
        type,
        type === 'thread' ? title : null,
    )

    if (result.changes == 0)
        res.status(500).send('DB error')

    stmt.finalize()
    await generatePages(() => res.redirect('/'))
}