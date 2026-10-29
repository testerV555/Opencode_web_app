/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_FILES } from './data/initialFiles';
import { WorkspaceFile } from './types';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CodeStudio } from './components/CodeStudio';
import { Terminal } from './components/Terminal';
import { RenderGuide } from './components/RenderGuide';
import { AlternativesGuide } from './components/AlternativesGuide';
import { CodespacesHub } from './components/CodespacesHub';
import { CloudPcBridge } from './components/CloudPcBridge';
import { OpenCodeMobileConnector } from './components/OpenCodeMobileConnector';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { GitPanel } from './components/GitPanel';
import { Smartphone, Sparkles, Server, Terminal as TermIcon, FileCode, CheckCircle2, FolderGit2, Cpu, Monitor, Zap } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<WorkspaceFile[]>(() => {
    try {
      const saved = localStorage.getItem('opencode_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_FILES;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return files[0]?.id || 'main.py';
  });

  const [activeTab, setActiveTab] = useState<'connect' | 'bridge' | 'studio' | 'terminal' | 'render' | 'codespaces' | 'alternatives'>('connect');

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGitOpen, setIsGitOpen] = useState(false);
  const [aiCodeContext, setAiCodeContext] = useState<string | undefined>();
  const [aiLogsContext, setAiLogsContext] = useState<string | undefined>();

  const handleAddDevcontainerFiles = (newFiles: { name: string; content: string }[]) => {
    setFiles((prev) => {
      const updated = [...prev];
      for (const nf of newFiles) {
        const existingIdx = updated.findIndex((f) => f.name === nf.name);
        let lang: WorkspaceFile['language'] = 'javascript';
        if (nf.name.endsWith('.json')) lang = 'json';
        else if (nf.name.endsWith('.sh')) lang = 'shell';
        const item: WorkspaceFile = {
          id: nf.name,
          name: nf.name,
          language: lang,
          content: nf.content,
        };
        if (existingIdx >= 0) {
          updated[existingIdx] = item;
        } else {
          updated.push(item);
        }
      }
      return updated;
    });
    if (newFiles[0]) {
      setActiveFileId(newFiles[0].name);
    }
  };

  // Persist files in browser storage
  useEffect(() => {
    try {
      localStorage.setItem('opencode_files', JSON.stringify(files));
    } catch {
      // ignore
    }
  }, [files]);

  const handleUpdateFileContent = (id: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent } : f))
    );
  };

  const handleCreateFile = (name: string, content: string) => {
    const newFile: WorkspaceFile = {
      id: name,
      name,
      language: name.endsWith('.py')
        ? 'python'
        : name.endsWith('.html')
        ? 'html'
        : name.endsWith('.yaml')
        ? 'yaml'
        : name.endsWith('.dockerfile') || name === 'Dockerfile'
        ? 'dockerfile'
        : 'javascript',
      content,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      setActiveFileId(remaining[0]?.id || '');
    }
  };

  const handleAskAiWithCode = (code: string) => {
    setAiCodeContext(code);
    setAiLogsContext(undefined);
    setIsAiOpen(true);
  };

  const handleAskAiWithLogs = (logs: string) => {
    setAiLogsContext(logs);
    setAiCodeContext(undefined);
    setIsAiOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAi={() => {
          setAiCodeContext(undefined);
          setAiLogsContext(undefined);
          setIsAiOpen(true);
        }}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-24 md:pb-6 flex flex-col">
        {/* Contextual Mobile Welcome Strip (Unboxed metadata, zero-pill discipline) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Мобильная веб-студия</span>
            <span aria-hidden="true">·</span>
            <span>Без ПК</span>
            <span aria-hidden="true">·</span>
            <span>Среда Render Free & Python/Node/Linux</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation flex items-center gap-1.5 ${
                activeTab === 'connect'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Подключение к OpenCode</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bridge')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation flex items-center gap-1.5 ${
                activeTab === 'bridge'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Облачный ПК</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation ${
                activeTab === 'studio'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Редактор кода
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Терминал Linux
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('codespaces')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation flex items-center gap-1.5 ${
                activeTab === 'codespaces'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Codespaces</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('render')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation ${
                activeTab === 'render'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Render Гайд
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alternatives')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors touch-action-manipulation ${
                activeTab === 'alternatives'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Альтернативы
            </button>
            <button
              type="button"
              onClick={() => setIsGitOpen(true)}
              className="px-3 py-1.5 rounded-md font-medium transition-colors text-indigo-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 touch-action-manipulation border border-indigo-900/60 bg-indigo-950/40"
              title="Панель Git: Clone, Commit, Push"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Git Sync</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Panes */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          {activeTab === 'connect' && <OpenCodeMobileConnector />}

          {activeTab === 'bridge' && <CloudPcBridge />}

          {activeTab === 'studio' && (
            <CodeStudio
              files={files}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              onUpdateFileContent={handleUpdateFileContent}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onAskAiWithCode={handleAskAiWithCode}
              onOpenGit={() => setIsGitOpen(true)}
            />
          )}

          {activeTab === 'terminal' && (
            <div className="flex-1 min-h-[520px]">
              <Terminal
                files={files}
                onFileCreate={handleCreateFile}
                onAskAiWithLogs={handleAskAiWithLogs}
              />
            </div>
          )}

          {activeTab === 'render' && <RenderGuide />}

          {activeTab === 'codespaces' && (
            <CodespacesHub
              onAddDevcontainerFiles={handleAddDevcontainerFiles}
              onOpenGit={() => setIsGitOpen(true)}
            />
          )}

          {activeTab === 'alternatives' && <AlternativesGuide />}
        </div>
      </main>

      {/* Git Management Panel (Clone, Commit, Push, Render Webhook) */}
      <GitPanel
        isOpen={isGitOpen}
        onClose={() => setIsGitOpen(false)}
        files={files}
        onImportFiles={(newFiles) => {
          setFiles(newFiles);
          if (newFiles[0]) setActiveFileId(newFiles[0].id);
        }}
      />

      {/* Floating or Drawer AI Cloud Assistant */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialCodeContext={aiCodeContext}
        initialLogsContext={aiLogsContext}
      />

      {/* Fixed Ergonomic Bottom Tab Bar for Mobile Thumb Zone */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAi={() => {
          setAiCodeContext(undefined);
          setAiLogsContext(undefined);
          setIsAiOpen(true);
        }}
      />
    </div>
  );
}
