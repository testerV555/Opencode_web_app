import React, { useState } from 'react';
import {
  Cpu,
  Monitor,
  Terminal,
  Server,
  Zap,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  Plus,
  Play,
  Clock,
  Layers,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { WorkspaceFile } from '../types';

interface CodespacesHubProps {
  onAddDevcontainerFiles: (files: { name: string; content: string }[]) => void;
  onOpenGit: () => void;
}

export const CodespacesHub: React.FC<CodespacesHubProps> = ({
  onAddDevcontainerFiles,
  onOpenGit,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'desktop' | 'devcontainer' | 'ports'>('architecture');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedToProject, setAddedToProject] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const devcontainerJson = `{
  "name": "Cloud Mobile Workstation",
  "image": "mcr.microsoft.com/devcontainers/universal:2-linux",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    },
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    }
  },
  "forwardPorts": [8080, 6080, 3000],
  "portsAttributes": {
    "6080": {
      "label": "Web Desktop noVNC",
      "onAutoForward": "openBrowser"
    },
    "8080": {
      "label": "OpenCode / API",
      "onAutoForward": "notify"
    }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "esbenp.prettier-vscode",
        "eamodio.gitlens"
      ]
    }
  }
}`;

  const desktopScript = `#!/bin/bash
# Запуск графического рабочего стола Ubuntu (XFCE + noVNC) в Codespaces
echo "=== Запуск облачного графического ПК в Codespaces ==="

# Запуск готового легковесного контейнера с рабочим столом на порту 6080
docker run -d \\
  --name cloud-desktop \\
  --restart always \\
  -p 6080:80 \\
  -e RESOLUTION=1280x720 \\
  dorowu/ubuntu-desktop-lxde-vnc

echo ""
echo "[OK] Рабочий стол запущен на порту 6080!"
echo "1. Перейдите на вкладку 'Ports' (Порты) внизу VS Code."
echo "2. Найдите порт 6080, нажмите правой кнопкой -> Port Visibility -> Public."
echo "3. Скопируйте ссылку и откройте в браузере телефона!"
`;

  const handleAddFiles = () => {
    onAddDevcontainerFiles([
      {
        name: '.devcontainer/devcontainer.json',
        content: devcontainerJson,
      },
      {
        name: 'start-desktop.sh',
        content: desktopScript,
      },
    ]);
    setAddedToProject(true);
    setTimeout(() => setAddedToProject(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Why Codespaces as a Remote PC */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                GitHub Codespaces как удаленный мощный «ПК»-посредник
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                Codespaces — это полноценная виртуальная машина Linux в дата-центрах Microsoft Azure.
                Она берет на себя все вычисления, компиляцию и запуск программ, а ваш телефон выступает тонким клиентом через браузер.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/codespaces"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors touch-action-manipulation shrink-0 self-start"
          >
            <span>Открыть Codespaces</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Cloud Hardware Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Мощность процессора</span>
            <span className="font-semibold text-emerald-400 font-mono">2 ядра (vCPU)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Оперативная память</span>
            <span className="font-semibold text-emerald-400 font-mono">4 ГБ ОЗУ (в 8x Render!)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Быстрый накопитель</span>
            <span className="font-semibold text-indigo-400 font-mono">32 ГБ NVMe SSD</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Бесплатный лимит</span>
            <span className="font-semibold text-amber-400 font-mono">60 часов / месяц</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors touch-action-manipulation ${
            activeTab === 'architecture'
              ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Как работает схема «ПК-посредник»
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('desktop')}
          className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors touch-action-manipulation ${
            activeTab === 'desktop'
              ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Графический Desktop (noVNC)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ports')}
          className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors touch-action-manipulation ${
            activeTab === 'ports'
              ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Проброс портов на телефон
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('devcontainer')}
          className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors touch-action-manipulation ${
            activeTab === 'devcontainer'
              ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Конфиг .devcontainer
        </button>
      </div>

      {/* TAB 1: ARCHITECTURE & HOW IT WORKS */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Принцип работы: Как Codespaces заменяет физический компьютер
            </h3>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Smartphone className="w-4 h-4" />
                  <span>1. Ваш смартфон (Клиент)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Не нагревается и не разряжает батарею. Вы открываете Chrome / Safari и подключаетесь к веб-интерфейсу. Все команды ввода и клики передаются по сети.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Server className="w-4 h-4" />
                  <span>2. Сервер Codespaces (ПК)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  2 ядра vCPU, 4 ГБ ОЗУ, 32 ГБ SSD в Azure. Здесь компилируется код, крутятся Python скрипты, Node.js серверы, базы данных или Docker.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Globe className="w-4 h-4" />
                  <span>3. Внешний доступ & Render</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Код привязан к GitHub. Любое изменение автоматически синхронизируется и может быть развернуто на Render в 1 клик через Git!
                </p>
              </div>
            </div>

            {/* Step-by-step setup in 4 steps */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-semibold text-slate-200 block">
                Как запустить это прямо сейчас со смартфона:
              </span>

              <div className="space-y-2">
                {[
                  {
                    num: '1',
                    title: 'Создайте пустой репозиторий на GitHub',
                    desc: 'Откройте github.com в мобильном браузере и создайте новый репозиторий (например: my-cloud-pc).',
                  },
                  {
                    num: '2',
                    title: 'Нажмите кнопку Codespaces',
                    desc: 'В репозитории нажмите зеленую кнопку «<> Code» → перейдите на вкладку «Codespaces» → нажмите «Create codespace on main».',
                  },
                  {
                    num: '3',
                    title: 'Через 20 секунд у вас в руках полноценный ПК',
                    desc: 'В браузере откроется VS Code с терминалом Linux (Ubuntu), Python, Node, Git и Docker. В терминале работает команда sudo!',
                  },
                  {
                    num: '4',
                    title: 'Запуск тяжелых фоновых задач через tmux',
                    desc: 'Чтобы скрипт продолжал работать даже при блокировке телефона, выполните в терминале tmux, запустите программу и закройте браузер.',
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      {item.num}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200">{item.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time Management & Free Usage Pro-Tip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-2.5">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Как расходовать 60 бесплатных часов с умом
            </h4>
            <p className="text-slate-300 leading-relaxed">
              60 часов в месяц — это в среднем <strong>2 часа работы каждый день абсолютно бесплатно</strong>.
              По умолчанию Codespaces автоматически засыпает через 30 минут бездействия.
            </p>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
              💡 <strong>Лайфхак:</strong> Когда закончили работать со смартфона, перейдите на <code>github.com/codespaces</code> и нажмите три точки рядом со своим контейнером → <strong>«Stop Codespace»</strong>.
              Так таймер бесплатных часов сразу остановится, а все ваши файлы сохранятся на диске!
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAPHICAL DESKTOP IN CODESPACES */}
      {activeTab === 'desktop' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Графический рабочий стол (noVNC Desktop) внутри Codespaces
            </h3>
            <p className="text-slate-400 mt-1 leading-relaxed">
              В Codespaces есть поддержка Docker! Это значит, что вы можете запустить контейнер с графическим интерфейсом Ubuntu XFCE/LXDE,
              пробросить порт 6080 и открыть настоящий рабочий стол Linux прямо в соседней вкладке мобильного браузера.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">
                Команда запуска рабочего стола (вставьте в терминал Codespaces):
              </span>
              <button
                type="button"
                onClick={() => handleCopy(desktopScript, 'desk-script')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 touch-action-manipulation"
              >
                {copiedId === 'desk-script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre">
              {desktopScript}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-emerald-400">Что произойдет после запуска:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>Docker скачает легковесный образ рабочего стола Ubuntu.</li>
              <li>VS Code автоматически обнаружит порт 6080 и предложит открыть его в браузере.</li>
              <li>Вы получите прямую ссылку вида <code>https://username-xxx-6080.app.github.dev</code> с окнами, мышью и рабочим столом на экране телефона!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: PORT FORWARDING */}
      {activeTab === 'ports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Туннелирование портов: как выводить сайты и боты на телефон
            </h3>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Супер-фишка Codespaces: вы можете запустить любой сервер (Python FastAPI, Flask, Node.js, веб-сокеты) на любом порту
              (например, 3000 или 8080), и GitHub автоматически даст вам бесплатный защищенный публичный HTTPS-домен!
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '1',
                title: 'Запустите скрипт в терминале Codespaces',
                example: 'python3 -m http.server 8080  # или node server.js',
              },
              {
                step: '2',
                title: 'Откройте вкладку «Ports» в нижней панели VS Code',
                example: 'Внизу экрана нажмите кнопку Ports (Порты). Там появится строка с портом 8080.',
              },
              {
                step: '3',
                title: 'Сделайте порт публичным (Port Visibility -> Public)',
                example: 'Нажмите правой кнопкой мыши (или долгим тапом на телефоне) по порту → выберите Port Visibility → Public.',
              },
              {
                step: '4',
                title: 'Откройте адрес на телефоне',
                example: 'Ссылка скопируется в буфер: https://your-codespace-8080.app.github.dev. Работает отовсюду без VPN!',
              },
            ].map((s) => (
              <div key={s.step} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-cyan-900/60 border border-cyan-700/60 text-cyan-300 flex items-center justify-center text-[10px] font-mono">
                    {s.step}
                  </span>
                  <span>{s.title}</span>
                </div>
                <pre className="p-2 bg-slate-900 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                  {s.example}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEVCONTAINER CONFIG */}
      {activeTab === 'devcontainer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Авто-конфигурация .devcontainer/devcontainer.json
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Добавьте этот файл в корень вашего репозитория. При запуске Codespaces он автоматически установит
                Python 3.11, Node.js 20, Docker, нужные расширения и пробросит порты!
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFiles}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors touch-action-manipulation shrink-0"
            >
              {addedToProject ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Добавлено в Студию!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Добавить файлы в проект</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400 text-[11px]">.devcontainer/devcontainer.json</span>
              <button
                type="button"
                onClick={() => handleCopy(devcontainerJson, 'devcontainer')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 touch-action-manipulation"
              >
                {copiedId === 'devcontainer' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-72 whitespace-pre select-text">
              {devcontainerJson}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              Нажмите кнопку <strong>«Добавить файлы в проект»</strong>, затем перейдите в <strong>«Git Sync»</strong> и сделайте Push в репозиторий GitHub.
            </span>
            <button
              type="button"
              onClick={onOpenGit}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap touch-action-manipulation shrink-0"
            >
              Открыть Git Sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
