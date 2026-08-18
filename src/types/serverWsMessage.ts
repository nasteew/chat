export type ServerWsMessage =
  | {
      type: 'AUTH_SUCCESS';
      payload: {
        sender_id: string;
      };
    }
  | {
      type: 'AUTH_FAILURE';
      payload: {
        reason: string;
      };
    }
  | {
      type: 'USER_ONLINE';
      payload: {
        user_id: string;
      };
    }
  | {
      type: 'USER_OFFLINE';
      payload: {
        user_id: string;
      };
    }
  | {
      type: 'MSG_NEW';
      payload: {
        id: string;

        temp_id?: string;

        chat_id: string;

        sender_id: string;

        content: string;

        created_at: string;

        is_edited?: boolean;

        is_deleted?: boolean;

        updated_at?: string;
      };
    }
  | {
      type: 'MSG_EDITED';
      payload: {
        chat_id: string;

        message_id: string;

        content: string;

        is_edited: boolean;
      };
    }
  | {
      type: 'MSG_DELETED';
      payload: {
        chat_id: string;

        message_id: string;
      };
    }
  | {
      type: 'USER_TYPING';
      payload: {
        sender_id: string;

        chat_id: string;
      };
    }
  | {
      type: 'USER_STOPPED_TYPING';
      payload: {
        sender_id: string;

        chat_id: string;
      };
    }
  | {
      type: 'MESSAGES_READ_ACK';
      payload: {
        chat_id: string;

        sender_id: string;

        last_read_message_id: string;
      };
    }
  | {
      type: 'MSG_ERROR';
      payload: {
        code: string;
        chat_id: string;
        temp_id?: string;
        message?: string;
      };
    };
