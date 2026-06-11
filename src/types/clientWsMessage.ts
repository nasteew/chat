export type ClientWsMessage =
  | {
      type: 'AUTH';
      payload: {
        token: string;
      };
    }
  | {
      type: 'CHAT_OPEN';
      payload: {
        chat_id: string;
      };
    }
  | {
      type: 'MSG_SEND';
      payload: {
        chat_id: string;

        content: string;

        temp_id: string;
      };
    }
  | {
      type: 'MSG_EDIT';
      payload: {
        chat_id: string;

        message_id: string;

        content: string;
      };
    }
  | {
      type: 'MSG_DELETE';
      payload: {
        chat_id: string;

        message_id: string;
      };
    }
  | {
      type: 'TYPING_START';
      payload: {
        chat_id: string;
      };
    }
  | {
      type: 'TYPING_STOP';
      payload: {
        chat_id: string;
      };
    }
  | {
      type: 'MESSAGES_READ';
      payload: {
        chat_id: string;

        last_read_message_id: string;
      };
    };
