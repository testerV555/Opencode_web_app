import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Power,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Server,
  Terminal,
  Settings,
  Check,
  Zap,
  Globe,
  Radio,
  Clock,
  ArrowRight
} from 'lucide-react';
import { MobileKeyboardBar } from './MobileKeyboardBar';

interface CodespaceItem {
  name: string;
  state: string; // Available, Shutdown, Starting, etc.
  webUrl: string;
  repo: string;
  branch: string;
  machineName: string;
  cpus: number;
  ramGb: number;
  idleTimeout: number;
  lastUsedAt: string;
}

export const CloudPcBridge: React.FC = () => {
  // Mode: Codespaces vs Render vs Direct URL
  const [hostMode, setHostMode] = useState<'codespaces' | 'render' | 'direct'>(() => {
    return (localStorage.getItem('opencode_host_mode') as any) || 'codespaces';
  });

  // Credentials & URLs
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('opencode_gh_token') || '');
  const [renderUrl, setRenderUrl] = useState(() => localStorage.getItem('opencode_render_url') || '');
  const [directUrl, setDirectUrl] = useState(() => localStorage.getItem('opencode_direct_url') || '');

  // Codespaces data
  const [codespaces, setCodespaces] = useState<CodespaceItem[]>([]);
  const [activeCodespace, setActiveCodespace] = useState<CodespaceItem | null>(null);
  const [activeViewerUrl, setActiveViewerUrl] = useState<string>('');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Save credentials
  useEffect(() => {
    localStorage.setItem('opencode_host_mode', hostMode);
    localStorage.setItem('opencode_gh_token', ghToken);
    localStorage.setItem('opencode_render_url', renderUrl);
    localStorage.setItem('opencode_direct_url', directUrl);
  }, [hostMode, ghToken, renderUrl, directUrl]);

  // Load codespaces on start if token present
  useEffect(() => {
    if (ghToken && hostMode === 'codespaces') {
      fetchCodespaces();
    }
  }, []);

  // Fetch Codespaces list from GitHub API
  const fetchCodespaces = async () => {
    if (!ghToken.trim()) return;
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/codespaces/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ghToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при получении списка Codespaces');
      }

      setCodespaces(data.codespaces || []);
      if (data.codespaces && data.codespaces.length > 0) {
        // Select running one or first
        const running = data.codespaces.find((c: any) => c.state === 'Available');
        const selected = running || data.codespaces[0];
        setActiveCodespace(selected);
        if (selected.webUrl) {
          setActiveViewerUrl(selected.webUrl);
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Start / Wake Codespace
  const handleStartCodespace = async (name: string) => {
    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Отправлена команда запуска. Машина в облаке просыпается...' });

    try {
      const res = await fetch('/api/codespaces/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ghToken.trim(), codespaceName: name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMsg({ type: 'success', text: 'Codespace запускается! Через 10-15 секунд нажмите «Подключить как экран ПК».' });
      fetchCodespaces();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop / Shutdown Codespace
  const handleStopCodespace = async (name: string) => {
    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Останавливаем Codespace для экономии бесплатных часов...' });

    try {
      const res = await fetch('/api/codespaces/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ghToken.trim(), codespaceName: name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMsg({ type: 'success', text: 'Машина выключена! Таймер 60 бесплатных часов заморожен.' });
      if (activeCodespace?.name === name) {
        setActiveCodespace((prev) => (prev ? { ...prev, state: 'Shutdown' } : null));
      }
      fetchCodespaces();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Ping Render or Direct host
  const handlePingHost = async (urlToPing: string) => {
    if (!urlToPing) return;
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/remote/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostUrl: urlToPing }),
      });

      const data = await res.json();
      if (data.online) {
        setPingLatency(data.latencyMs);
        setIsWakingUp(false);
        setStatusMsg({ type: 'success', text: `Хост в сети! Пинг: ${data.latencyMs}мс (Статус HTTP ${data.status})` });
        setActiveViewerUrl(urlToPing);
      } else if (data.isWakingUp) {
        setIsWakingUp(true);
        setStatusMsg({ type: 'info', text: 'Сервис на Render просыпается от спящего режима (~30-50 сек). Запрос отправлен!' });
      } else {
        setStatusMsg({ type: 'error', text: `Хост недоступен: ${data.error || 'Проверьте URL'}` });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;
    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Control Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">
                  Облачный ПК-посредник (Cloud Hardware Bridge)
                </h2>
                <span className="text-xs text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
                  Активен
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                Это веб-приложение подключается к удаленным мощностям (GitHub Codespaces или Render),
                позволяет управлять питанием (включать и выключать машину прямо отсюда) и выводит рабочий стол OpenCode на смартфон.
              </p>
            </div>
          </div>

          {/* Quick Power Switch for Active Host */}
          {activeCodespace && (
            <div className="flex items-center gap-2 shrink-0 self-start">
              {activeCodespace.state === 'Available' ? (
                <button
                  type="button"
                  onClick={() => handleStopCodespace(activeCodespace.name)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold shadow-sm transition-colors touch-action-manipulation"
                  title="Остановить машину и заморозить бесплатные часы"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>Выключить ПК (Stop)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartCodespace(activeCodespace.name)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors touch-action-manipulation"
                  title="Запустить машину в облаке"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Включить ПК (Start)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setHostMode('codespaces')}
            className={`p-2.5 rounded-xl border text-center transition-all touch-action-manipulation ${
              hostMode === 'codespaces'
                ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block font-semibold">GitHub Codespaces</span>
            <span className="text-[10px] text-slate-400">4 ГБ ОЗУ · 60ч Free</span>
          </button>

          <button
            type="button"
            onClick={() => setHostMode('render')}
            className={`p-2.5 rounded-xl border text-center transition-all touch-action-manipulation ${
              hostMode === 'render'
                ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block font-semibold">Render Web Service</span>
            <span className="text-[10px] text-slate-400">512 МБ ОЗУ · Docker</span>
          </button>

          <button
            type="button"
            onClick={() => setHostMode('direct')}
            className={`p-2.5 rounded-xl border text-center transition-all touch-action-manipulation ${
              hostMode === 'direct'
                ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block font-semibold">Прямой URL / VPS</span>
            <span className="text-[10px] text-slate-400">Свой сервер / OpenCode</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border shadow-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : statusMsg.type === 'error'
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{statusMsg.text}</span>
        </div>
      )}

      {/* CONNECT & CONFIGURE SECTION */}
      {hostMode === 'codespaces' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                Управление инстансами Codespaces
              </h3>
              <p className="text-slate-400 mt-0.5">
                Подключение к API GitHub для включения, выключения и перенаправления мощностей в это приложение.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCodespaces}
              disabled={isLoading || !ghToken}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs transition-colors touch-action-manipulation shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить список</span>
            </button>
          </div>

          {/* Token Input */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-medium block">
              GitHub Personal Access Token (с правами <code>codespace</code> и <code>repo</code>):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={fetchCodespaces}
                className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs touch-action-manipulation shrink-0"
              >
                Подключить
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Токен хранится только в вашем браузере. Он позволяет выключать и включать Codespace без захода на сайт GitHub.
            </p>
          </div>

          {/* Active Codespaces List */}
          {codespaces.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              <span className="text-slate-300 font-semibold block text-xs">
                Ваши виртуальные машины в облаке Microsoft:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {codespaces.map((cs) => {
                  const isRunning = cs.state === 'Available';
                  const isSelected = activeCodespace?.name === cs.name;
                  return (
                    <div
                      key={cs.name}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-950 border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-semibold text-slate-100 block truncate">{cs.repo}</span>
                          <span className="text-[11px] font-mono text-slate-400">Ветка: {cs.branch}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            isRunning
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isRunning ? '● В сети (Online)' : '○ Остановлен'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-800/80 mb-3 text-slate-400 font-mono">
                        <div>Мощность: <span className="text-slate-200">{cs.cpus} ядра, {cs.ramGb} ГБ ОЗУ</span></div>
                        <div>Таймаут сна: <span className="text-slate-200">{cs.idleTimeout} мин</span></div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCodespace(cs);
                                setActiveViewerUrl(cs.webUrl);
                              }}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs touch-action-manipulation"
                            >
                              Подключить как экран ПК
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStopCodespace(cs.name)}
                              className="py-1.5 px-3 rounded-lg bg-rose-950 border border-rose-800/60 text-rose-300 hover:bg-rose-900 text-xs touch-action-manipulation"
                              title="Остановить машину и сберечь часы"
                            >
                              Выключить
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartCodespace(cs.name)}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 touch-action-manipulation"
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>Включить эту машину (Start)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-slate-400 space-y-2">
              <p>Укажите GitHub Token выше, чтобы загрузить ваши Codespaces, или создайте Codespace на GitHub.</p>
              <a
                href="https://github.com/codespaces"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:underline text-xs"
              >
                <span>Перейти на github.com/codespaces</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* RENDER MODE */}
      {hostMode === 'render' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Подключение к сервису на Render
            </h3>
            <p className="text-slate-400 mt-0.5">
              Вставьте публичный URL вашего контейнера на Render (из раздела «Render Гайд»). Приложение проверит пинг и разбудит его при необходимости.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-medium block">URL сервиса на Render:</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={renderUrl}
                onChange={(e) => setRenderUrl(e.target.value)}
                placeholder="https://my-opencode-app.onrender.com"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handlePingHost(renderUrl)}
                className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs touch-action-manipulation shrink-0"
              >
                Проверить и разбудить
              </button>
            </div>

            {pingLatency !== null && (
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                ✓ Соединение установлено. Задержка: {pingLatency} мс.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIRECT URL MODE */}
      {hostMode === 'direct' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Прямой адрес OpenCode / Web Terminal
            </h3>
            <p className="text-slate-400 mt-0.5">
              Любой HTTPS или локальный URL (проброшенный порт Codespaces, ttyd, noVNC или IP сервера).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-medium block">Прямой URL хоста:</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="https://user-xxx-8080.app.github.dev"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setActiveViewerUrl(directUrl)}
                className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs touch-action-manipulation shrink-0"
              >
                Подключить экран
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMBEDDED CLOUD PC SCREEN / OPENCODE VIEWER */}
      <div
        ref={iframeContainerRef}
        className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[560px] h-[72vh]'
        }`}
      >
        {/* Screen Toolbar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              {activeCodespace ? `Экран ПК: ${activeCodespace.repo}` : 'Встроенный экран Облачного ПК'}
            </span>
            {activeCodespace && (
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                ({activeCodespace.cpus} ядра · {activeCodespace.ramGb} ГБ ОЗУ)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeCodespace && (
              <button
                type="button"
                onClick={() => handleStopCodespace(activeCodespace.name)}
                className="px-2 py-1 rounded bg-rose-950 border border-rose-800/60 text-rose-300 text-[11px] font-medium flex items-center gap-1 touch-action-manipulation"
                title="Выключить машину прямо отсюда"
              >
                <Power className="w-3 h-3" />
                <span className="hidden sm:inline">Выключить</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const url = activeViewerUrl;
                setActiveViewerUrl('');
                setTimeout(() => setActiveViewerUrl(url), 50);
              }}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 touch-action-manipulation"
              title="Перезагрузить экран"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {activeViewerUrl && (
              <a
                href={activeViewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 touch-action-manipulation"
                title="Открыть в отдельной вкладке браузера"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 touch-action-manipulation"
              title={isFullscreen ? 'Свернуть' : 'На весь экран'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
          {activeViewerUrl ? (
            <iframe
              src={activeViewerUrl}
              title="Cloud PC Remote Screen"
              className="w-full h-full border-none bg-slate-950"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          ) : (
            <div className="text-center p-6 space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto">
                <Server className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Экран ожидает подключения</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Выберите вверху хост (Codespaces или Render) и нажмите <strong>«Подключить как экран ПК»</strong>, чтобы транслировать интерфейс прямо сюда.
              </p>
            </div>
          )}
        </div>

        {/* Touch Keyboard helper bar on bottom */}
        <MobileKeyboardBar
          onInsertChar={(char) => {
            // Can be used if custom terminal/input is targeted
          }}
        />
      </div>
    </div>
  );
};
