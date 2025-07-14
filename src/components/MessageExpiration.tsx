import React, { useState } from 'react';
import { Clock, Flame, Shield, Timer } from 'lucide-react';

interface MessageExpirationProps {
  onExpirationSet: (expirationMs: number | null) => void;
  currentExpiration: number | null;
}

export function MessageExpiration({ onExpirationSet, currentExpiration }: MessageExpirationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const expirationOptions = [
    { label: 'No expiration', value: null, icon: Shield },
    { label: '1 minute', value: 60 * 1000, icon: Timer },
    { label: '5 minutes', value: 5 * 60 * 1000, icon: Timer },
    { label: '1 hour', value: 60 * 60 * 1000, icon: Clock },
    { label: '24 hours', value: 24 * 60 * 60 * 1000, icon: Clock },
    { label: '7 days', value: 7 * 24 * 60 * 60 * 1000, icon: Clock },
    { label: 'Read once', value: -1, icon: Flame }, // Special value for read-once messages
  ];

  const getCurrentLabel = () => {
    if (currentExpiration === null) return 'No expiration';
    if (currentExpiration === -1) return 'Read once';
    
    const option = expirationOptions.find(opt => opt.value === currentExpiration);
    return option?.label || 'Custom';
  };

  const getCurrentIcon = () => {
    if (currentExpiration === null) return Shield;
    if (currentExpiration === -1) return Flame;
    if (currentExpiration <= 5 * 60 * 1000) return Timer;
    return Clock;
  };

  const IconComponent = getCurrentIcon();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors ${
          currentExpiration !== null 
            ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
            : 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100'
        }`}
        title="Message expiration"
      >
        <IconComponent className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 min-w-48">
            <div className="p-3 border-b border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-100">Message Expiration</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Set when this message should be automatically deleted
              </p>
            </div>
            
            <div className="py-2">
              {expirationOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === currentExpiration;
                
                return (
                  <button
                    key={option.label}
                    onClick={() => {
                      onExpirationSet(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-zinc-700 transition-colors ${
                      isSelected ? 'bg-zinc-700 text-blue-400' : 'text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{option.label}</span>
                    {option.value === -1 && (
                      <span className="text-xs text-orange-400 ml-auto">🔥</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-zinc-700 text-xs text-zinc-500">
              Current: {getCurrentLabel()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}