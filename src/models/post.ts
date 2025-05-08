import type { Reply } from "./reply";
import type { Thread } from "./thread";

export type BasePost = {
  id: number;
  message: string;
  timestamp: Date;
  type: "thread" | "reply";
};

export type Post = Thread | Reply;
