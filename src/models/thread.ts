import {Post} from "./post";

export type ThreadIcon = 'pan' | 'smile';

export interface Thread extends Post {
    type: 'thread';
    title: string;
    icon: ThreadIcon;
    bump: Date;
}
