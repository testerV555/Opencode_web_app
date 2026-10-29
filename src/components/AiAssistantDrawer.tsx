import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Copy, Check, Terminal, Cpu, Bot, User } from 'lucide-react';

interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCodeContext?: string;
  initialLogsContext?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialCodeContext,
  initialLogsContext,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Привет! Я ваш ИИ-помощник по облачной разработке и работе со смартфона.
Я помогу вам:
· Настроить и оптимизировать Dockerfile для бесплатного тарифа Render (512 МБ ОЗУ).
· Запустить OpenCode / VS Code на телефоне без компьютера.
· Решить любые ошибки компиляции, нехватки памяти (OOM) или подключения.
· Написать или проверить скрипт прямо сейчас. О чем вы хотите узнать?`,
      timestamp: '15:21',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // If initial code or logs are passed, handle them
  useEffect(() => {
    if (initialCodeContext && isOpen) {
      setInputVal(`Помоги оптимизировать этот код для запуска на Render с телефона:\n\n${initialCodeContext.slice(0, 500)}`);
    } else if (initialLogsContext && isOpen) {
      setInputVal(`Проанализируй эти логи терминала и подскажи решение:\n\n${initialLogsContext.slice(0, 500)}`);
    }
  }, [initialCodeContext, initialLogsContext, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text || isLoading) return;

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          code: initialCodeContext,
          logs: initialLogsContext,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.error || 'Ответ сформирован.';

      const aiMsg: AiMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AiMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Не удалось связаться с сервером ИИ. Основные рекомендации по Render:\n1. Для 512MB RAM всегда добавляйте флаг --disable-telemetry.\n2. В Render Environment обязательно укажите PORT=8080 и PASSWORD.\n3. Для сохранения кода используйте Git push в GitHub репозиторий.`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const presets = [
    'Как зайти в OpenCode с телефона?',
    'Почему Render выдает Out of Memory?',
    'Как предотвратить засыпание сервиса?',
    'Напиши скрипт Telegram-бота для телефона',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">ИИ-Помощник OpenCode</h3>
              <p className="text-[11px] text-slate-400">Советы по Render, Docker и мобильной разработке</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 touch-action-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset prompts */}
        <div className="bg-slate-950/60 p-2.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 active:text-white text-slate-300 text-[11px] font-medium whitespace-nowrap transition-colors touch-action-manipulation shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 select-text">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, m.id)}
                        className="hover:text-slate-200 flex items-center gap-1 touch-action-manipulation"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Скопировать</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span>ИИ думает и готовит ответ...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Спросите о Render, Linux командах, коде..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors touch-action-manipulation shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
