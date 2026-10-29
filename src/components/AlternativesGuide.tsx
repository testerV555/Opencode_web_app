import React, { useState } from 'react';
import { ALTERNATIVE_SOLUTIONS } from '../data/comparisons';
import { AlternativeSolution } from '../types';
import { CheckCircle2, ExternalLink, Sparkles, Smartphone, Terminal, Cloud, HelpCircle } from 'lucide-react';

export const AlternativesGuide: React.FC = () => {
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('codespaces');

  const selected = ALTERNATIVE_SOLUTIONS.find((s) => s.id === selectedSolutionId) || ALTERNATIVE_SOLUTIONS[0];

  return (
    <div className="space-y-6">
      {/* Intro Recommendation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Сравнение: Что лучше выбрать для работы с телефона без ПК?
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Render — не единственный и не всегда самый удобный вариант. Ниже представлены лучшие бесплатные альтернативы,
              которые дают значительно больше памяти (до 4–12 ГБ ОЗУ) и не засыпают посреди редактирования кода.
            </p>
          </div>
        </div>

        {/* Quick Comparison Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs">
          {ALTERNATIVE_SOLUTIONS.map((sol) => {
            const isSelected = sol.id === selectedSolutionId;
            return (
              <button
                key={sol.id}
                type="button"
                onClick={() => setSelectedSolutionId(sol.id)}
                className={`text-left p-3 rounded-xl border transition-all touch-action-manipulation ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-100 text-xs truncate">{sol.name}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mb-1">{sol.badge}</div>
                <div className="text-[11px] text-slate-400">{sol.ram}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Card into Selected Option */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">{selected.name}</h3>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                {selected.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selected.tagline}</p>
          </div>

          {selected.link && (
            <a
              href={selected.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors touch-action-manipulation shrink-0"
            >
              <span>Открыть {selected.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Specs Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Оперативная память</span>
            <span className="font-semibold text-slate-200 font-mono">{selected.ram}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Диск</span>
            <span className="font-semibold text-slate-200 font-mono">{selected.storage}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Без интернета (Оффлайн)</span>
            <span className={`font-semibold font-mono ${selected.offlineSupport ? 'text-emerald-400' : 'text-slate-400'}`}>
              {selected.offlineSupport ? 'Да (100% оффлайн)' : 'Требует интернет'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Время запуска</span>
            <span className="font-semibold text-indigo-400 font-mono">{selected.setupTime}</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs text-slate-300 leading-relaxed">
          {selected.description}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-semibold text-slate-200 block">
            Инструкция по настройке со смартфона:
          </span>
          <div className="space-y-2 text-xs">
            {selected.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70"
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best For Tagline */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-200">
            <strong>Для чего подходит лучше всего:</strong> {selected.bestFor}
          </span>
        </div>
      </div>

      {/* Summary Decision Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Итоговый вердикт: Что выбрать именно вам?
        </h3>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            1. <strong>Если хотите идеальный VS Code со встроенным терминалом без возни с Docker:</strong> используйте{' '}
            <strong className="text-emerald-400">GitHub Codespaces</strong>. Он в 8 раз мощнее бесплатного Render и сохраняет все файлы.
          </p>
          <p>
            2. <strong>Если у вас Android и нужен настоящий Linux оффлайн без серверов:</strong> установите{' '}
            <strong className="text-emerald-400">Termux</strong> с F-Droid. Это превратит телефон в автономную станцию разработки.
          </p>
          <p>
            3. <strong>Если нужен постоянный публичный веб-адрес (HTTPS) или хотите развернуть сервис именно на Render:</strong> используйте конфигурацию{' '}
            <strong className="text-indigo-400">Code-Server</strong> или <strong className="text-indigo-400">TTYD Web Terminal</strong> из нашего раздела «Render Гайд».
          </p>
        </div>
      </div>
    </div>
  );
};
