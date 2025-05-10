import type { BasePost } from "./post";

export const threadIcons = ["🏛️", "🦅", "🔥", "📜", "🇻🇦", "🏺", "🌳"] as const;
export type ThreadIcon = (typeof threadIcons)[number];

export type Thread = BasePost & {
  type: "thread";
  title: string;
  icon: ThreadIcon;
  bump: Date;
  isArchived: boolean;
};
