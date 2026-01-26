
import React from 'react';
import { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
  onSelect: () => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="group relative h-96 w-full cursor-pointer overflow-hidden rounded-3xl border shadow-2xl transition-all duration-500 hover:scale-[1.02]"
      style={{
        borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.5))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))';
      }}
    >
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--bg-secondary, #111827)' }}
      >
        <img 
          src={persona.avatarUrl} 
          alt={persona.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t opacity-80 transition-opacity group-hover:opacity-70"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4), transparent)',
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6">
        <div 
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md border"
          style={{
            backgroundColor: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
            color: 'var(--color-primary, #c084fc)',
            borderColor: 'var(--color-primary, rgba(168, 85, 247, 0.3))',
          }}
        >
          人格
        </div>
        <h3 
          className="mb-1 text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {persona.name}
        </h3>
        <p 
          className="text-sm line-clamp-2"
          style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))' }}
        >
          {persona.description}
        </p>
      </div>
      
      <div 
        className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
        style={{
          borderColor: 'var(--color-primary, #a855f7)',
        }}
      />
    </div>
  );
};