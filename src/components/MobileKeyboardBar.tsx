import React from 'react';
import { CornerDownLeft, Copy, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileKeyboardBarProps {
  onInsertChar: (char: string) => void;
  onArrowKey?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onCopyAll?: () => void;
}

export const MobileKeyboardBar: React.FC<MobileKeyboardBarProps> = ({
  onInsertChar,
  onArrowKey,
  onCopyAll,
}) => {
  const quickKeys = [
    { label: 'Tab', val: '  ' },
    { label: 'Esc', val: '\x1b' },
    { label: '|', val: '|' },
    { label: '/', val: '/' },
    { label: '\\', val: '\\' },
    { label: ':', val: ':' },
    { label: ';', val: ';' },
    { label: '"', val: '"' },
    { label: "'", val: "'" },
    { label: '{', val: '{' },
    { label: '}', val: '}' },
    { label: '[', val: '[' },
    { label: ']', val: ']' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: '$', val: '$' },
    { label: '=', val: '=' },
    { label: '-', val: '-' },
    { label: '_', val: '_' },
    { label: '~', val: '~' },
    { label: '`', val: '`' },
    { label: '#', val: '#' },
    { label: '&&', val: ' && ' },
  ];

  return (
    <div className="bg-slate-900/95 border-y border-slate-800 px-2 py-1.5 backdrop-blur-md overflow-x-auto flex items-center gap-1.5 scrollbar-none select-none z-20">
      <div className="flex items-center gap-1 shrink-0 pr-1 border-r border-slate-800">
        <button
          type="button"
          onClick={() => onArrowKey && onArrowKey('left')}
          className="h-8 min-w-[32px] px-2 rounded bg-slate-800/80 active:bg-indigo-600 text-slate-300 active:text-white flex items-center justify-center font-mono text-xs transition-colors touch-action-manipulation"
          title="Стрелка влево"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onArrowKey && onArrowKey('right')}
          className="h-8 min-w-[32px] px-2 rounded bg-slate-800/80 active:bg-indigo-600 text-slate-300 active:text-white flex items-center justify-center font-mono text-xs transition-colors touch-action-manipulation"
          title="Стрелка вправо"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onArrowKey && onArrowKey('up')}
          className="h-8 min-w-[32px] px-2 rounded bg-slate-800/80 active:bg-indigo-600 text-slate-300 active:text-white flex items-center justify-center font-mono text-xs transition-colors touch-action-manipulation"
          title="Стрелка вверх"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onArrowKey && onArrowKey('down')}
          className="h-8 min-w-[32px] px-2 rounded bg-slate-800/80 active:bg-indigo-600 text-slate-300 active:text-white flex items-center justify-center font-mono text-xs transition-colors touch-action-manipulation"
          title="Стрелка вниз"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {quickKeys.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => onInsertChar(k.val)}
            className="h-8 min-w-[34px] px-2 rounded bg-slate-800/70 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 active:text-white font-mono text-xs font-medium flex items-center justify-center transition-colors touch-action-manipulation shrink-0"
          >
            {k.label}
          </button>
        ))}

        {onCopyAll && (
          <button
            type="button"
            onClick={onCopyAll}
            className="h-8 px-2.5 rounded bg-slate-800/90 active:bg-indigo-600 text-slate-200 font-mono text-xs flex items-center gap-1 transition-colors touch-action-manipulation shrink-0"
            title="Скопировать всё"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Копировать</span>
          </button>
        )}
      </div>
    </div>
  );
};
