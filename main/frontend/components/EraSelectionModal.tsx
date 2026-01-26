
import React from 'react';
import { Persona, Character } from '../types';

interface EraSelectionModalProps {
  persona: Persona;
  onSelect: (character: Character) => void;
  onClose: () => void;
}

export const EraSelectionModal: React.FC<EraSelectionModalProps> = ({ persona, onSelect, onClose }) => {
  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
      }}
    >
      <div 
        className="border rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
          borderColor: 'var(--border-color-overlay, #374151)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              选择场景: <span style={{ color: 'var(--color-primary, #a78bfa)' }}>{persona.name}</span>
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              你想与哪个时期的TA相遇？
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-3xl transition-colors"
            style={{ color: 'var(--text-disabled)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-disabled)';
            }}
          >
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {persona.eras.map(character => (
            <div 
              key={character.id}
              onClick={() => onSelect(character)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border transition-all"
              style={{
                borderColor: 'var(--border-color-overlay, #374151)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, rgba(167, 139, 250, 0.5))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
              }}
            >
              <img src={character.avatarUrl} alt={character.name} className="h-48 w-full object-cover" />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, var(--bg-overlay-alpha), transparent)',
                }}
              />
              <div 
                className="absolute bottom-0 left-0 p-3"
                style={{ color: 'var(--text-primary)' }}
              >
                <div 
                  className="px-2 py-0.5 text-xs font-bold rounded-full mb-1 inline-block"
                  style={{ backgroundColor: `${character.colorAccent}40`, color: character.colorAccent }}
                >
                  {character.era}
                </div>
                <h4 className="font-bold">{character.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};