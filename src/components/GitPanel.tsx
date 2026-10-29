import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  UploadCloud,
  DownloadCloud,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
  AlertCircle,
  FileCode,
  X,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { WorkspaceFile } from '../types';

interface GitPanelProps {
  isOpen: boolean;
  onClose: () => void;
  files: WorkspaceFile[];
  onImportFiles: (newFiles: WorkspaceFile[]) => void;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  isOpen,
  onClose,
  files,
  onImportFiles,
}) => {
  const [gitTab, setGitTab] = useState<'sync' | 'clone' | 'commands'>('sync');

  // Git credentials & settings (persisted in localStorage)
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('opencode_git_repo') || '');
  const [branch, setBranch] = useState(() => localStorage.getItem('opencode_git_branch') || 'main');
  const [token, setToken] = useState(() => localStorage.getItem('opencode_git_token') || '');
  const [deployHook, setDeployHook] = useState(() => localStorage.getItem('opencode_git_hook') || '');
  const [commitMessage, setCommitMessage] = useState('feat: update project files for Render deployment');

  // Statuses
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [recentCommits, setRecentCommits] = useState<{ sha: string; message: string; time: string }[]>(() => {
    try {
      const saved = localStorage.getItem('opencode_git_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save settings
  useEffect(() => {
    localStorage.setItem('opencode_git_repo', repoUrl);
    localStorage.setItem('opencode_git_branch', branch);
    localStorage.setItem('opencode_git_token', token);
    localStorage.setItem('opencode_git_hook', deployHook);
  }, [repoUrl, branch, token, deployHook]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Clone / Import Repo
  const handleCloneRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Укажите URL репозитория GitHub' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/git/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при получении файлов из репозитория');
      }

      if (data.files && data.files.length > 0) {
        onImportFiles(data.files);
        setStatusMessage({
          type: 'success',
          text: `Успешно импортировано ${data.files.length} файлов из ветки ${data.branch || 'main'}!`,
        });
        setGitTab('sync');
      } else {
        setStatusMessage({
          type: 'error',
          text: 'В репозитории не найдено текстовых файлов или репозиторий пуст.',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Push to GitHub
  const handlePush = async () => {
    if (!token.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Для прямого пуша с телефона укажите GitHub Personal Access Token (PAT). Либо скопируйте команды терминала ниже.',
      });
      return;
    }

    const cleanUrl = repoUrl.trim().replace(/\.git$/, '').replace(/\/$/, '');
    const ghMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!ghMatch) {
      setStatusMessage({
        type: 'error',
        text: 'Укажите корректный URL GitHub (например: https://github.com/username/my-repo)',
      });
      return;
    }

    const owner = ghMatch[1];
    const repo = ghMatch[2];

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          owner,
          repo,
          branch,
          files,
          message: commitMessage || 'Update from OpenCode Mobile',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке коммита на GitHub');
      }

      const newCommit = {
        sha: data.commitSha || 'latest',
        message: commitMessage,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newCommit, ...recentCommits.slice(0, 4)];
      setRecentCommits(updatedHistory);
      localStorage.setItem('opencode_git_history', JSON.stringify(updatedHistory));

      let successText = `Коммит ${newCommit.sha} успешно отправлен в ветку ${branch}!`;

      // Trigger Render deploy hook if configured
      if (deployHook.trim().startsWith('https://api.render.com/deploy/')) {
        try {
          const hookRes = await fetch('/api/render/deploy-hook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deployHookUrl: deployHook }),
          });
          if (hookRes.ok) {
            successText += ' Авто-деплой на Render запущен!';
          }
        } catch {
          // ignore hook error
        }
      }

      setStatusMessage({ type: 'success', text: successText });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Git Control & Sync</h3>
              <p className="text-[11px] text-slate-400">Синхронизация с GitHub / GitLab для деплоя на Render</p>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/70 border-b border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              setGitTab('sync');
              setStatusMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors text-center touch-action-manipulation ${
              gitTab === 'sync'
                ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Commit & Push
          </button>

          <button
            type="button"
            onClick={() => {
              setGitTab('clone');
              setStatusMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors text-center touch-action-manipulation ${
              gitTab === 'clone'
                ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Клонировать (Clone)
          </button>

          <button
            type="button"
            onClick={() => {
              setGitTab('commands');
              setStatusMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors text-center touch-action-manipulation ${
              gitTab === 'commands'
                ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Консольные команды
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: COMMIT & PUSH */}
          {gitTab === 'sync' && (
            <div className="space-y-4">
              {/* Repository inputs */}
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    URL репозитория GitHub
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/my-render-pc"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Ветка (Branch)</label>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="bg-transparent font-mono text-slate-100 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">GitHub Token (PAT)</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Render Deploy Hook URL <span className="text-slate-500 font-normal">(опционально)</span>
                  </label>
                  <input
                    type="url"
                    value={deployHook}
                    onChange={(e) => setDeployHook(e.target.value)}
                    placeholder="https://api.render.com/deploy/srv-xxxxxxx?key=xxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Render Dashboard → Service → Settings → Deploy Hook. При пуше Render автоматически начнет сборку.
                  </span>
                </div>
              </div>

              {/* Commit Section */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                    Сообщение коммита (Commit Message)
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{files.length} файлов готово</span>
                </div>

                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat: update project"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePush}
                    disabled={isLoading || !repoUrl}
                    className="flex-1 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors touch-action-manipulation"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Отправить в GitHub & Деплой</span>
                  </button>
                </div>
              </div>

              {/* Files in staged payload */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-medium block text-[11px]">
                  Файлы проекта в текущей рабочей области:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] truncate"
                    >
                      <FileCode className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History */}
              {recentCommits.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-medium block text-[11px]">История коммитов:</span>
                  <div className="space-y-1">
                    {recentCommits.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800/40">
                            {c.sha}
                          </span>
                          <span className="text-slate-200 truncate">{c.message}</span>
                        </div>
                        <span className="text-slate-500 shrink-0">{c.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLONE REPOSITORY */}
          {gitTab === 'clone' && (
            <form onSubmit={handleCloneRepo} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-slate-300 text-xs leading-relaxed">
                Вы можете импортировать любой публичный репозиторий GitHub или репозиторий с вашим Render-контейнером.
                Все файлы автоматически загрузятся в редактор студии прямо на смартфоне!
              </div>

              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    URL репозитория GitHub для клонирования
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/my-project"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    GitHub Token <span className="text-slate-500 font-normal">(нужен только для приватных репозиториев)</span>
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !repoUrl}
                  className="w-full h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors touch-action-manipulation"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="w-4 h-4" />
                  )}
                  <span>Клонировать репозиторий в Студию</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: COMMANDS FOR TERMINAL */}
          {gitTab === 'commands' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed text-xs">
                Если вы работаете через встроенный терминал или Termux на телефоне, используйте готовые команды:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Быстрый коммит и пуш на GitHub',
                    cmd: `git add . && git commit -m "${commitMessage || 'update'}" && git push origin ${branch || 'main'}`,
                    id: 'cmd-push',
                  },
                  {
                    title: 'Клонирование репозитория',
                    cmd: `git clone ${repoUrl || 'https://github.com/username/my-project.git'}`,
                    id: 'cmd-clone',
                  },
                  {
                    title: 'Инициализация нового репозитория для Render',
                    cmd: 'git init && git branch -M main && git add . && git commit -m "initial commit"',
                    id: 'cmd-init',
                  },
                  {
                    title: 'Привязка удаленного репозитория GitHub',
                    cmd: `git remote add origin ${repoUrl || 'https://github.com/username/my-project.git'}`,
                    id: 'cmd-remote',
                  },
                ].map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.cmd, item.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 touch-action-manipulation"
                      >
                        {copiedCmd === item.id ? (
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
                    <pre className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
                      {item.cmd}
                    </pre>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                💡 <strong>Совет по токену GitHub:</strong> Пароли от аккаунта GitHub больше не поддерживаются для git push.
                Сгенерируйте Personal Access Token: github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) с галочкой <code>repo</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
