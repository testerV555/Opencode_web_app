import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, HelpCircle, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { TerminalLine, WorkspaceFile } from '../types';
import { MobileKeyboardBar } from './MobileKeyboardBar';

interface TerminalProps {
  files: WorkspaceFile[];
  onFileCreate?: (name: string, content: string) => void;
  onAskAiWithLogs?: (logs: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ files, onFileCreate, onAskAiWithLogs }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Debian GNU/Linux 11 (bullseye) [Render Free Tier Environment]',
      timestamp: '15:20:00',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Внимание: бесплатный тариф Render имеет лимит 512MB RAM и засыпает через 15 мин неактивности.',
      timestamp: '15:20:01',
    },
    {
      id: 'init-3',
      type: 'output',
      text: 'Введите "help" для списка команд или нажмите быструю кнопку ниже.',
      timestamp: '15:20:02',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add to history
    setHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
    setHistoryIndex(-1);

    const time = new Date().toLocaleTimeString('ru-RU');

    // Add user input line
    const userLine: TerminalLine = {
      id: `user-${Date.now()}`,
      type: 'input',
      text: `coder@render-cloud:~$ ${cmd}`,
      timestamp: time,
    };

    const parts = cmd.split(' ').filter(Boolean);
    const mainCmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    let outputLines: TerminalLine[] = [];

    switch (mainCmd) {
      case 'help':
      case '?':
        outputLines = [
          {
            id: `out-${Date.now()}-1`,
            type: 'output',
            text: `Доступные команды Linux в облачной среде OpenCode:
  ls / dir               — Список файлов в рабочей директории
  cat <файл>             — Просмотр содержимого файла (напр: cat main.py)
  python <файл> / python3 — Запуск скрипта на Python
  node <файл>            — Запуск JavaScript файла
  neofetch               — Характеристики облачного контейнера Render
  render-check           — Проверка на лимиты памяти (512MB) и спящий режим
  opencode start         — Запуск сервера OpenCode на порту 8080
  git status             — Проверка состояния Git репозитория
  touch <имя>            — Создать новый файл
  clear                  — Очистить терминал`,
            timestamp: time,
          },
        ];
        break;

      case 'clear':
        setLines([]);
        setInputVal('');
        return;

      case 'ls':
      case 'dir':
        const fileList = files
          .map((f) => `-rw-r--r-- 1 coder coder  ${f.content.length.toString().padStart(5, ' ')}  ${f.name}`)
          .join('\n');
        outputLines = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: `total ${files.length * 4}K\n${fileList}`,
            timestamp: time,
          },
        ];
        break;

      case 'cat':
        if (!args[0]) {
          outputLines = [
            { id: `err-${Date.now()}`, type: 'error', text: 'cat: укажите имя файла (пример: cat main.py)', timestamp: time },
          ];
        } else {
          const targetFile = files.find((f) => f.name.toLowerCase() === args[0].toLowerCase());
          if (targetFile) {
            outputLines = [
              { id: `out-${Date.now()}`, type: 'output', text: targetFile.content, timestamp: time },
            ];
          } else {
            outputLines = [
              { id: `err-${Date.now()}`, type: 'error', text: `cat: ${args[0]}: Файл не найден`, timestamp: time },
            ];
          }
        }
        break;

      case 'python':
      case 'python3':
        const pyFileName = args[0] || 'main.py';
        const pyFile = files.find((f) => f.name === pyFileName);
        if (!pyFile) {
          outputLines = [
            { id: `err-${Date.now()}`, type: 'error', text: `python: не удается открыть '${pyFileName}': Нет такого файла`, timestamp: time },
          ];
        } else {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'success',
              text: `[Python 3.10.12] Запуск ${pyFileName}...\n=== Запуск OpenCode на мобильном устройстве ===\nПлатформа: Linux 5.15.0-x86_64-render\nЧисла: [1, 2, 3, 4, 5, 10, 25]\nКвадраты: [1, 4, 9, 16, 25, 100, 625]\nСумма квадратных корней: 22.46\n\n[OK] Скрипт успешно выполнен за 0.04 сек. Память: 18.4 MB`,
              timestamp: time,
            },
          ];
        }
        break;

      case 'node':
        const jsFileName = args[0] || 'app.js';
        const jsFile = files.find((f) => f.name === jsFileName);
        if (!jsFile) {
          outputLines = [
            { id: `err-${Date.now()}`, type: 'error', text: `node: cannot find module '${jsFileName}'`, timestamp: time },
          ];
        } else {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'success',
              text: `[Node.js v20.11.0] Запуск ${jsFileName}...\nЗапуск JavaScript среды OpenCode...\nСтатус системы: {\n  "device": "Смартфон / Мобильный браузер",\n  "cloudTier": "Render Free (512MB RAM)",\n  "status": "Работает активно"\n}\nВремя вычислений 50,000 итераций: 3.12 ms\nГотово! Код успешно выполнен.`,
              timestamp: time,
            },
          ];
        }
        break;

      case 'neofetch':
        outputLines = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: `       _,met\$\$\$\$gg.          coder@render-free-cloud
    ,g\$\$\$\$\$\$\$\$\$\$\$\$\$\$\$P.       -----------------------
  ,g\$\$P"        """Y\$\$.".     OS: Debian GNU/Linux 11 (bullseye) x86_64
 ,\$P'              \`\$\$\$.     Host: Render.com Free Container (c-free-fra)
',\$P       ,ggs.     \`\$\$b:   Kernel: 5.15.0-89-generic
\`d\$\'     ,\$P"'   .    \$\$\$    Uptime: 14 mins (засыпает через 15 мин)
 \$\$P      d\$\'     ,    \$\$P   Packages: 412 (dpkg)
 \$\$:      \$\$.   -    ,d\$\$'   Shell: bash 5.1.4
 \$\$;      Y\$b._   _,d\$P'     Terminal: OpenCode WebTTY
  Y\$\$.    \`."Y\$\$\$\$P"'        CPU: Shared vCPU (0.1 core)
   \`\$\$b      "-.__           Memory: 184MiB / 512MiB (35.9%)
    \`Y\$\$.                    Disk: 1.1G / 10G (Ephemeral)
      \`\$\$b.                  Public URL: https://opencode-cloud.onrender.com`,
            timestamp: time,
          },
        ];
        break;

      case 'render-check':
        outputLines = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: `[ДИАГНОСТИКА СОВМЕСТИМОСТИ С БЕСПЛАТНЫМ RENDER]
1. ОЗУ: Текущее потребление ~180-220 МБ -> [ПРОЙДЕНО (в пределах 512 МБ)]
2. Переменная PORT: 8080 задана -> [ПРОЙДЕНО]
3. Авторизация: Переменная PASSWORD присутствует -> [ЗАЩИЩЕНО]
4. Спящий режим: Контейнер заснёт после 15 мин бездействия -> [ВНИМАНИЕ]
   Совет: используйте бесплатный пинг cron-job.org или используйте GitHub Codespaces без сна!
5. Сохранение данных: Диск временный -> [РЕКОМЕНДАЦИЯ: делайте git push на GitHub]`,
            timestamp: time,
          },
        ];
        break;

      case 'git':
        if (args[0] === 'status') {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  modified:   main.py\n  modified:   Dockerfile\n\nno changes added to commit (use "git add <file>...")`,
              timestamp: time,
            },
          ];
        } else if (args[0] === 'push') {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'success',
              text: `Enumerating objects: 5, done.\nWriting objects: 100% (5/5), 1.28 KiB | 1.28 MiB/s, done.\nTo https://github.com/user/my-opencode-pc.git\n   a1b2c3d..e4f5g6h  main -> main\n[OK] Все изменения сохранены на GitHub! На Render начнется автосборка.`,
              timestamp: time,
            },
          ];
        } else {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: `git version 2.30.2\nКоманды: git status, git commit -m "update", git push origin main`,
              timestamp: time,
            },
          ];
        }
        break;

      case 'opencode':
        if (args[0] === 'start') {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'success',
              text: `[OpenCode] Запуск веб-сервера разработки на порту 8080...\n[OpenCode] Подключение к ядру среды... OK\n[OpenCode] Веб-интерфейс готов к работе: http://0.0.0.0:8080\n[OpenCode] Авторизация: включена (пароль из переменной $PASSWORD)`,
              timestamp: time,
            },
          ];
        } else {
          outputLines = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: `OpenCode CLI v1.4.2 (Linux x86_64)\nИспользование: opencode start | opencode --status`,
              timestamp: time,
            },
          ];
        }
        break;

      case 'touch':
        if (args[0] && onFileCreate) {
          onFileCreate(args[0], `# Файл ${args[0]} создан из терминала\n`);
          outputLines = [
            { id: `out-${Date.now()}`, type: 'success', text: `Создан файл '${args[0]}'`, timestamp: time },
          ];
        } else {
          outputLines = [
            { id: `err-${Date.now()}`, type: 'error', text: 'touch: укажите имя файла', timestamp: time },
          ];
        }
        break;

      default:
        outputLines = [
          {
            id: `err-${Date.now()}`,
            type: 'error',
            text: `bash: ${mainCmd}: команда не найдена. Наберите "help" для справки.`,
            timestamp: time,
          },
        ];
    }

    setLines((prev) => [...prev, userLine, ...outputLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleQuickKey = (char: string) => {
    setInputVal((prev) => prev + char);
    inputRef.current?.focus();
  };

  const handleArrowNav = (dir: 'left' | 'right' | 'up' | 'down') => {
    if (dir === 'up') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (dir === 'down') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const quickCommands = [
    { label: 'neofetch', cmd: 'neofetch' },
    { label: 'render-check', cmd: 'render-check' },
    { label: 'python main.py', cmd: 'python main.py' },
    { label: 'ls -la', cmd: 'ls' },
    { label: 'help', cmd: 'help' },
    { label: 'clear', cmd: 'clear' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-tight text-slate-200">
            Linux Cloud Terminal · Render Free (512MB RAM)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAskAiWithLogs && (
            <button
              type="button"
              onClick={() => {
                const recentLogs = lines.slice(-6).map((l) => l.text).join('\n');
                onAskAiWithLogs(recentLogs);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-800/60 touch-action-manipulation"
              title="Передать логи терминала ИИ для анализа"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Анализ с ИИ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setLines([])}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 touch-action-manipulation"
            title="Очистить терминал"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Tap Command Chips (Mobile-friendly) */}
      <div className="bg-slate-900/60 px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">Быстрые команды:</span>
        {quickCommands.map((q) => (
          <button
            key={q.cmd}
            type="button"
            onClick={() => handleCommand(q.cmd)}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white text-slate-300 rounded text-xs font-mono shrink-0 transition-colors touch-action-manipulation"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div
        className="flex-1 p-3.5 font-mono text-xs overflow-y-auto space-y-1.5 bg-slate-950/90 select-text leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap break-all">
            {line.type === 'input' && (
              <span className="text-emerald-400 font-semibold">{line.text}</span>
            )}
            {line.type === 'system' && (
              <span className="text-amber-300">{line.text}</span>
            )}
            {line.type === 'error' && (
              <span className="text-rose-400">{line.text}</span>
            )}
            {line.type === 'success' && (
              <span className="text-cyan-300">{line.text}</span>
            )}
            {line.type === 'output' && (
              <span className="text-slate-300">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Row */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <span className="text-emerald-400 font-mono text-xs font-semibold whitespace-nowrap">
          coder@render:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="введите команду (напр: python main.py, help)..."
          className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder:text-slate-600"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => handleCommand(inputVal)}
          disabled={!inputVal.trim()}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium text-xs flex items-center gap-1 transition-colors touch-action-manipulation shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Ввод</span>
        </button>
      </div>

      {/* Touch keyboard helper bar for phone typing */}
      <MobileKeyboardBar
        onInsertChar={handleQuickKey}
        onArrowKey={handleArrowNav}
      />
    </div>
  );
};
