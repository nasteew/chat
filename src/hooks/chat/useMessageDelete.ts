// hooks/chat/useMessageDelete.ts
// Удаление сообщения
import { useChatStore } from '@/store/chatStore';
import { useChatListStore } from '@/store/chatListStore';
import { socketService } from '@/api/socket';

export function useMessageDelete(chatId: string) {
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const remove = (messageId: string) => {
    socketService.send({
      type: 'MSG_DELETE',
      payload: { chat_id: chatId, message_id: messageId },
    });
    deleteMessage(messageId);
    useChatListStore.getState().updateChatOnMessageDelete(chatId, messageId);
  };

  return { remove };
}
