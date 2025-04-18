import type { BasePost } from "./post";

export type ThreadIcon = '🦅' | '🏛️' | '🔥' | '📜' | '🇻🇦';

export type Thread = BasePost & {
    type: 'thread';
    title: string;
    icon: ThreadIcon;
    bump: Date;
}
