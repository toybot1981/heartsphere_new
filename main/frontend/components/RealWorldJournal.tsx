
import React, { useState } from 'react';
import { Button } from './Button';

interface RealWorldJournalProps {
  onQuestionSubmit: (question: string) => void;
}

export const RealWorldJournal: React.FC<RealWorldJournalProps> = ({ onQuestionSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onQuestionSubmit(text.trim());
    setText('');
  };

  return (
    <div 
      className="border rounded-2xl p-6 h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
        borderColor: 'var(--border-color-overlay, #475569)',
      }}
    >
      <div className="mb-4">
        <h3 
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary, rgba(255, 255, 255, 0.9))' }}
        >
          现实世界
        </h3>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          记录你的问题、经历或当下的心情。
        </p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="记下任何你想探索的事..."
        className="w-full flex-grow border-2 rounded-lg py-3 px-4 outline-none transition-colors resize-none text-base leading-relaxed scrollbar-hide"
        style={{
          backgroundColor: 'var(--bg-secondary, rgba(15, 23, 42, 0.7))',
          borderColor: 'var(--border-color-overlay, #475569)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #475569)';
        }}
      />
      <Button
        onClick={handleSubmit}
        disabled={!text.trim()}
        fullWidth
        className="mt-4 !text-base"
        style={{
          background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-primary, #6366f1), var(--color-primary, #9333ea)))',
        }}
      >
        带着这个问题进入心域
      </Button>
    </div>
  );
};