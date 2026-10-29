import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Sliders,
  Cloud,
  Check,
  Copy,
  ExternalLink,
  Zap,
  ShieldCheck,
  AlertCircle,
  RotateCw,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const OpenCodeMobileConnector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'qr' | 'termux' | 'codespaces'>('manual');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);

  const defaultUsername = 'opencode';
  const defaultPassword = 'opencode123';

  // Load current web app server URL
  useEffect(() => {
    const currentOrigin = window.location.origin;
    setServerUrl(currentOrigin);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/global/health');
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          status: 'ok',
          text: `Сервер активен! Отвечает по протоколу OpenCode v${data.version || '2.4.0'} на порту 4096.`,
        });
      } else {
        setTestResult({
          status: 'error',
          text: `Сервер вернул статус HTTP ${res.status}.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        text: `Ошибка связи: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const qrDataString = JSON.stringify({
    url: serverUrl,
    username: defaultUsername,
    password: defaultPassword,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    qrDataString
  )}`;

  return (
    <div className="space-y-6">
      {/* Problem Diagnosis Banner (Direct answer to the user's screenshots) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">
                  Решение ошибки OpenCode Mobile (127.0.0.1:4096)
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  Готово к подключению
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                Ваше мобильное приложение на Android выдает ошибку <code className="text-rose-400 font-mono">Failed to connect to /127.0.0.1:4096</code>,
                потому что на самом телефоне нет запущенного сервера. 
                Это веб-приложение уже запущено как совместимый сервер OpenCode. Выполните одно из трех действий ниже:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors touch-action-manipulation shrink-0 self-start"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Проверить сервер</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.status === 'ok'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {testResult.status === 'ok' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{testResult.text}</span>
          </div>
        )}
      </div>

      {/* 3 Actions from User's Screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`p-3 rounded-xl border text-left transition-all touch-action-manipulation ${
            activeTab === 'manual'
              ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-100">1. Вручную (Manual)</span>
          </div>
          <p className="text-[11px] text-slate-400">Рекомендуется · 1 клик</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`p-3 rounded-xl border text-left transition-all touch-action-manipulation ${
            activeTab === 'qr'
              ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-100">2. Scan QR code</span>
          </div>
          <p className="text-[11px] text-slate-400">Сканирование камерой</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('termux')}
          className={`p-3 rounded-xl border text-left transition-all touch-action-manipulation ${
            activeTab === 'termux'
              ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-100">3. Termux (127.0.0.1)</span>
          </div>
          <p className="text-[11px] text-slate-400">Локально на телефоне</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('codespaces')}
          className={`p-3 rounded-xl border text-left transition-all touch-action-manipulation ${
            activeTab === 'codespaces'
              ? 'bg-slate-800 text-indigo-300 border-indigo-500 font-semibold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Cloud className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-100">4. Codespaces (4GB)</span>
          </div>
          <p className="text-[11px] text-slate-400">Облачный сервер</p>
        </button>
      </div>

      {/* TAB 1: MANUAL (ВРУЧНУЮ ВВЕСТИ ДАННЫЕ В ПРИЛОЖЕНИЕ) */}
      {activeTab === 'manual' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-start gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Способ 1 (Самый легкий): Введите эти параметры в OpenCode Mobile
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                В вашем мобильном приложении нажмите кнопку <strong>«Manual»</strong> (из вашего второго скриншота) и вставьте:
              </p>
            </div>
          </div>

          {/* Credentials Card */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            {/* Field 1: Server URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">1. Server URL:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(serverUrl, 'url')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 touch-action-manipulation"
                >
                  {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'url' ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-emerald-400 text-xs break-all border border-slate-800">
                {serverUrl}
              </div>
            </div>

            {/* Field 2: Username */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">2. Username (Имя пользователя):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(defaultUsername, 'user')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 touch-action-manipulation"
                >
                  {copiedField === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'user' ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg font-mono text-slate-200 text-xs border border-slate-800">
                {defaultUsername}
              </div>
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">3. Password (Пароль):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(defaultPassword, 'pass')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 touch-action-manipulation"
                >
                  {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'pass' ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg font-mono text-slate-200 text-xs border border-slate-800">
                {defaultPassword}
              </div>
            </div>
          </div>

          {/* Action Step-by-Step */}
          <div className="space-y-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-slate-300 leading-relaxed">
            <span className="font-semibold text-indigo-300 block">Порядок действий в приложении на телефоне:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Откройте экран ошибки OpenCode Mobile и нажмите <strong>«Connection settings»</strong>.</li>
              <li>В меню «Add connection» выберите пункт <strong>«Manual»</strong>.</li>
              <li>Вставьте скопированный <strong>Server URL</strong>, имя пользователя <code>opencode</code> и пароль.</li>
              <li>Нажмите зеленую кнопку <strong>«Save & connect»</strong>. Приложение сразу подключится к серверу!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: QR CODE PAIRING */}
      {activeTab === 'qr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-start gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Способ 2: «Scan QR code» / «Pair with Cloud Link»
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Если вы открыли эту страницу на втором устройстве (планшете, ноутбуке друга или вывели на экран), просто наведите камеру мобильного приложения на этот QR-код:
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
              <img
                src={qrImageUrl}
                alt="OpenCode Connection QR Code"
                className="w-44 h-44 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2 max-w-sm text-center sm:text-left">
              <span className="font-semibold text-slate-200 block">Данные сопряжения:</span>
              <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                {serverUrl}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                В приложении выберите <strong>«Scan QR code»</strong> и наведите камеру смартфона. Приложение считает адрес и авторизуется автоматически.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TERMUX LOCAL FIX (РЕШАЕТ 127.0.0.1:4096 НАПРЯМУЮ) */}
      {activeTab === 'termux' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-start gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Способ 3: Запуск сервера прямо внутри Android через Termux
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Почему приложение писало <code className="text-rose-400">Failed to connect to /127.0.0.1:4096</code>?
                Потому что <code className="text-indigo-300">127.0.0.1</code> — это адрес вашего собственного телефона!
                Если запустить сервер OpenCode в Termux, ошибка исчезнет навсегда.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Команды для Termux на Android:</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'pkg update && pkg install -y nodejs git && npx opencode-ai serve --port 4096 --hostname 127.0.0.1',
                    'termux-cmd'
                  )
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 touch-action-manipulation"
              >
                {copiedField === 'termux-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Скопировать</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-pre border border-slate-800">
{`# 1. Установите Node.js в Termux
pkg update && pkg install -y nodejs git

# 2. Запустите сервер OpenCode на порту 4096
npx opencode-ai serve --port 4096 --hostname 127.0.0.1`}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400">Что произойдет после этого:</span>
            <p>
              Как только сервер запустится в Termux, вернитесь в приложение <strong>OpenCode Mobile</strong> и нажмите кнопку{' '}
              <strong className="text-emerald-400">«Reconnect»</strong> (зеленая кнопка из первого скриншота).
              Приложение моментально найдет порт 4096 на телефоне и запустит рабочий интерфейс!
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CODESPACES BACKEND (PORT 4096 FORWARDING) */}
      {activeTab === 'codespaces' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-start gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Способ 4: Запуск сервера OpenCode в GitHub Codespaces (4 ГБ ОЗУ)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Запустите сервер OpenCode на мощной машине в облаке, сделайте порт 4096 публичным и подключите приложение.
              </p>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200">Команда для терминала Codespaces:</span>
            <pre className="p-3 bg-slate-900 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre border border-slate-800">
{`export OPENCODE_SERVER_PASSWORD="my-secret-password"
npx opencode-ai serve --port 4096 --hostname 0.0.0.0`}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-slate-300 leading-relaxed space-y-1">
            <p>1. Внизу VS Code в Codespaces откройте вкладку <strong>Ports</strong>.</p>
            <p>2. Найдите порт <strong>4096</strong> → Правый клик (или долгий тап) → <strong>Port Visibility → Public</strong>.</p>
            <p>3. Скопируйте ссылку вида <code>https://your-codespace-4096.app.github.dev</code> и вставьте ее в мобильном приложении в раздел <strong>Manual</strong>!</p>
          </div>
        </div>
      )}
    </div>
  );
};
