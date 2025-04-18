import {Post} from "./post";

export interface Reply extends Post {
    type: 'reply';
    reply_to: number; // Thread we are replying to
}