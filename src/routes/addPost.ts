import type { Request, Response } from 'express'
import {bumpThread, existsThread, insertPost } from '../db'
import { generatePages } from '../generate'
import type { Reply } from "../models/reply";
import type { Thread } from "../models/thread";

export async function addPost(req: Request, res: Response) {
    const post = req.body

    const result = post.reply_to
        ? await addReply(res, post)
        : await addThread(res, post);

    if (result.changes == 0)
        return refusePost(res, 500, 'DB error');

    await generatePages(() => res.redirect('/'))
}

async function addReply(res: Response, reply: Reply) {
    reply.type = 'reply';
    // TODO: check that reply_to refers to a thread, not a regular post
    if (isNaN(reply.reply_to) || reply.reply_to < 1 || !await existsThread(reply.reply_to))
        return refusePost(res);

    await bumpThread(reply.reply_to);

    return await insertPost(reply);
}

async function addThread(res: Response, thread: Thread) {
    thread.type = 'thread';
    if (!thread.icon) return refusePost(res);

    return await insertPost(thread);
}

function refusePost(res: Response, status: number = 400, msg: string = 'Post refused.'): undefined {
    res.status(status).send(msg);
}

