import React from 'react';
import { FileCode, Terminal, Server, Cpu, Sparkles, Monitor, Smartphone, Zap } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'connect' | 'bridge' | 'studio' | 'terminal' | 'render' | 'codespaces' | 'alternatives';
  onSelectTab: (tab: 'connect' | 'bridge' | 'studio' | 'terminal' | 'render' | 'codespaces' | 'alternatives') => void;
  onOpenAi: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAi,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 md:hidden pb-safe">
      <div className="grid grid-cols-5 items-center h-16">
        <button
          type="button"
          onClick={() => onSelectTab('connect')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation ${
            activeTab === 'connect' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Связка</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('bridge')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation ${
            activeTab === 'bridge' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Мой ПК</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('studio')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation ${
            activeTab === 'studio' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Редактор</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('terminal')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation ${
            activeTab === 'terminal' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Терминал</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('codespaces')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation ${
            activeTab === 'codespaces' || activeTab === 'render'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Хосты</span>
        </button>

        <button
          type="button"
          onClick={onOpenAi}
          className="min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors touch-action-manipulation text-indigo-400 hover:text-indigo-300"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">ИИ Помощь</span>
        </button>
      </div>
    </nav>
  );
};
