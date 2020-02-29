import { Message } from "../message";

export interface Update {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    channel_post?: Message;
    edited_channel_post?: Message;
    inline_query?: any;
    chosen_inline_result?: any;
    callback_query?: any;
    shipping_query?: any;
    pre_checkout_query?: any;
    poll?: any;
    poll_answer?: any;
}
