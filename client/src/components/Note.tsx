import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NoteProps {
  noteId: string;
  initialContent: string;
  onSave: (content: string) => void;
}

export function Note({ noteId, initialContent, onSave }: NoteProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const { sendMessage, lastMessage } = useWebSocket();

  useEffect(() => {
    sendMessage({
      type: 'JOIN_NOTE',
      noteId,
    });
  }, [noteId]);

  useEffect(() => {
    if (lastMessage?.type === 'NOTE_UPDATED' && lastMessage.userId !== userId) {
      setContent(lastMessage.content);
    }
  }, [lastMessage]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Implement debounce here for better performance
    sendMessage({
      type: 'NOTE_UPDATE',
      noteId,
      content: newContent,
    });
  };

  return (
    <div className="space-y-4">
      <Input
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full"
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onSave(content);
            setIsEditing(false);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
} 