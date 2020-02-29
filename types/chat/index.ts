import { Message } from "../message";

export interface Chat {
    id: number;
    type: string;
    title: string;
    username: string;
    first_name: string;
    last_name: string;
    photo: any;
    description: string;
    invite_link: string;
    pinned_message: Message;
    permissions: any;
    slow_mode_delay: number;
    sticker_set_name: string;
    can_set_sticker_set: boolean;
}

/* 
    photo and permissions are "any" for now
*/