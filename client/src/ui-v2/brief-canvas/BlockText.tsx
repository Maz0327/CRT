import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Block } from './types';
import { useCanvasStore } from './useCanvasStore';

interface BlockTextProps {
  block: Block & { type: 'text' };
}

export function BlockText({ block }: BlockTextProps) {
  const { updateBlock, selectedBlockIds } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(block.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSelected = selectedBlockIds.includes(block.id);

  useEffect(() => {
    setText(block.text);
  }, [block.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== block.text) {
      updateBlock(block.id, { text });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(block.text);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full h-full resize-none border-none outline-none bg-transparent"
        style={{
          fontSize: block.fontSize || 16,
          fontWeight: block.weight || 400,
          textAlign: block.align || 'left',
          lineHeight: 1.4,
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full flex items-start cursor-text',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      onDoubleClick={handleDoubleClick}
      style={{
        fontSize: block.fontSize || 16,
        fontWeight: block.weight || 400,
        textAlign: block.align || 'left',
        lineHeight: 1.4,
      }}
    >
      <div className="w-full p-2 break-words">
        {block.text || 'Click to edit text'}
      </div>
    </div>
  );
}