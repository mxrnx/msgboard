import type { Request, Response } from "express";
import {
  archiveThreadsIfNecessary,
  bumpThread,
  existsThread,
  insertPost,
} from "../db";
import { generatePages } from "../generate";
import type { Reply } from "../models/reply";
import type { Thread } from "../models/thread";
import { isValidReply, isValidThread } from "../models/post";

export function addPost(req: Request, res: Response) {
  const post = req.body;

  if (post.reply_to) {
    return addReply(res, post);
  } else {
    return addThread(res, post);
  }
}

async function addReply(res: Response, reply: Reply) {
  reply.type = "reply";
  const parentExists = await existsThread(reply.reply_to);
  if (!parentExists || !isValidReply(reply)) {
    return refusePost(res);
  }

  await bumpThread(reply.reply_to);

  const result = await insertPost(reply);

  if (result.changes == 0) return refusePost(res, 500, "DB error");

  await generatePages(() => res.redirect(`/${reply.reply_to}`));
}

async function addThread(res: Response, thread: Thread) {
  thread.type = "thread";
  if (!isValidThread(thread)) return refusePost(res);

  const title = "De " + thread.title.trim().replace(/^de\s+/i, "");

  const result = await insertPost({
    ...thread,
    title: title,
    message: thread.message.trim(),
  });

  if (result.changes == 0) return refusePost(res, 500, "DB error");

  await archiveThreadsIfNecessary();

  await generatePages(() => res.redirect("/"));
}

function refusePost(
  res: Response,
  status: number = 400,
  msg: string = "Post refused.",
): undefined {
  res.status(status).send(msg);
}
