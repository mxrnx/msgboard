import type { Reply } from "./reply";
import { type Thread, threadIcons } from "./thread";
import { config } from "../config";

export type BasePost = {
  id: number;
  message: string;
  timestamp: Date;
  type: "thread" | "reply";
};

export type Post = Thread | Reply;

export function isValidThread(thread: Thread) {
  if (!isValidPost(thread)) return false;

  if (!thread.icon || !threadIcons.includes(thread.icon)) return false;

  const titleLength = thread.title.length;
  return titleLength > 0 && titleLength <= config.maxTitleLength;
}

export function isValidReply(reply: Reply) {
  if (!isValidPost(reply)) return false;

  return reply.reply_to > 0 && !isNaN(reply.reply_to);
}

function isValidPost(post: Post): boolean {
  const messageLength = post.message.length;
  return messageLength > 0 && messageLength <= config.maxMessageLength;
}
