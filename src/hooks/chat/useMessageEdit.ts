// hooks/chat/useMessageEdit.ts
// Состояние и действия редактирования сообщения
import { useState } from 'react';
import { socketService } from '@/api/socket';
import { useChatStore } from '@/store/chatStore';

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

    socketService.send({
      type: 'MSG_EDIT',
      payload: {
        chat_id: chatId,
        message_id: editingId,
        content: editText.trim(),
      },
    });

    editMessage(editingId, editText.trim());
    cancel();
  };

  const cancel = () => {
    setEditingId(null);
    setEditText('');
  };

  return { editingId, editText, setEditText, start, save, cancel };
}
