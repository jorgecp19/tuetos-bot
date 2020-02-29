import { Chat } from "../chat";
import { User } from "../user";

export interface Message {
    message_id: number,
    from: User,
    date: number,
    chat: Chat,
    forward_from: User,
    forward_from_chat: Chat,
    forward_from_message_id: number,
    reply_to_message: Message,
    edit_date: number,
    author_signature: string,
    media_group_id: string,
    text: string,
}