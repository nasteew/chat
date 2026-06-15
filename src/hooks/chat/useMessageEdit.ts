// hooks/chat/useMessageEdit.ts
// Состояние и действия редактирования сообщения
import { useState } from 'react';
import { socketService } from '@/api/socket';
import { useChatStore } from '@/store/chatStore';
import { useChatListStore } from '@/store/chatListStore';

export function useMessageEdit(chatId: string) {
  const editMessage = useChatStore((s) => s.editMessage);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const start = (messageId: string, content: string) => {
    setEditingId(messageId);
    setEditText(content);
  };

  const save = () => {
    if (!editingId || !editText.trim()) return;

    const trimmed = editText.trim();

    socketService.send({
      type: 'MSG_EDIT',
      payload: {
        chat_id: chatId,
        message_id: editingId,
        content: trimmed,
      },
    });

    editMessage(editingId, trimmed);
    useChatListStore
      .getState()
      .updateChatOnMessageEdit(chatId, editingId, trimmed);
    cancel();
  };

  const cancel = () => {
    setEditingId(null);
    setEditText('');
  };

  return { editingId, editText, setEditText, start, save, cancel };
}
