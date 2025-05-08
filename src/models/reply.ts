import type { BasePost } from "./post";

export type Reply = BasePost & {
  type: "reply";
  reply_to: number; // Thread we are replying to
};
