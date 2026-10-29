import React from 'react';
import { Sparkles, Terminal as TerminalIcon, Code2, Server, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'connect' | 'bridge' | 'studio' | 'terminal' | 'render' | 'codespaces' | 'alternatives';
  onSelectTab: (tab: 'connect' | 'bridge' | 'studio' | 'terminal' | 'render' | 'codespaces' | 'alternatives') => void;
  onOpenAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenAi }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element brand wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('connect');
        }}
        className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-300 transition-colors"
      >
        OpenCode Studio
      </a>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-300">
        <button
          type="button"
          onClick={() => onSelectTab('connect')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'connect' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Подключение
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('bridge')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'bridge' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Облачный ПК
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('studio')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'studio' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Редактор
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('terminal')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'terminal' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Терминал
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('codespaces')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'codespaces' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Codespaces
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('render')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'render' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Render
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('alternatives')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
            activeTab === 'alternatives' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          Альтернативы
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 touch-action-manipulation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ИИ-Помощник</span>
        </button>
      </div>
    </header>
  );
};
