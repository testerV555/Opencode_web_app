import React, { useState } from 'react';
import { RENDER_BLUEPRINTS } from '../data/blueprints';
import { RenderBlueprint } from '../types';
import { Copy, Check, ExternalLink, AlertTriangle, ShieldCheck, Zap, Server, Smartphone, Info } from 'lucide-react';

export const RenderGuide: React.FC = () => {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('code-server');
  const [activeCodeTab, setActiveCodeTab] = useState<'dockerfile' | 'renderyaml'>('dockerfile');
  const [copied, setCopied] = useState<string | null>(null);

  const blueprint = RENDER_BLUEPRINTS.find((b) => b.id === selectedBlueprintId) || RENDER_BLUEPRINTS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Reality Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 shrink-0 mt-0.5">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Как развернуть «ПК» на Render.com (Free Tier) с телефона
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Вы можете запустить легковесный облачный сервер разработки и подключаться к нему через браузер смартфона.
              Ниже приведены проверенные конфигурации с учётом ограничений бесплатного тарифа Render.
            </p>
          </div>
        </div>

        {/* Free Tier Fact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Лимит памяти</span>
            <span className="font-semibold text-emerald-400 font-mono">512 МБ ОЗУ</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Спящий режим</span>
            <span className="font-semibold text-amber-400 font-mono">15 мин простоя</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Пробуждение</span>
            <span className="font-semibold text-indigo-400 font-mono">~50 секунд</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Файловая система</span>
            <span className="font-semibold text-rose-400 font-mono">Эфемерная</span>
          </div>
        </div>
      </div>

      {/* Blueprint Selector (Segmented Tabs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Выберите тип облачного «ПК»</h3>
          <span className="text-xs text-slate-400 font-mono">ОЗУ: {blueprint.ramUsage}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {RENDER_BLUEPRINTS.map((bp) => {
            const isSelected = bp.id === selectedBlueprintId;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => setSelectedBlueprintId(bp.id)}
                className={`text-left p-3.5 rounded-xl border transition-all touch-action-manipulation ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-100">{bp.title}</span>
                </div>
                <div className="text-[11px] text-indigo-400 font-mono mb-1">{bp.category}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {bp.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Blueprint Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{blueprint.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{blueprint.recommendedFor}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
              Потребление: {blueprint.ramUsage}
            </span>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Преимущества на телефоне:
            </span>
            <ul className="space-y-1 text-slate-300">
              {blueprint.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">·</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Ограничения на бесплатном тарифе:
            </span>
            <ul className="space-y-1 text-slate-300">
              {blueprint.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">·</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Files Station */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCodeTab('dockerfile')}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors touch-action-manipulation ${
                  activeCodeTab === 'dockerfile'
                    ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dockerfile
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('renderyaml')}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors touch-action-manipulation ${
                  activeCodeTab === 'renderyaml'
                    ? 'bg-slate-800 text-indigo-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                render.yaml
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  activeCodeTab === 'dockerfile' ? blueprint.dockerfile : blueprint.renderYaml,
                  activeCodeTab
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors touch-action-manipulation"
            >
              {copied === activeCodeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать {activeCodeTab === 'dockerfile' ? 'Dockerfile' : 'render.yaml'}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 font-mono text-xs overflow-x-auto text-slate-300 max-h-72 select-text">
            <pre className="whitespace-pre">
              {activeCodeTab === 'dockerfile' ? blueprint.dockerfile : blueprint.renderYaml}
            </pre>
          </div>
        </div>

        {/* Required Environment Variables on Render */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Обязательные переменные окружения в панели Render (Environment):
          </span>
          <div className="space-y-1.5">
            {blueprint.envVars.map((ev) => (
              <div
                key={ev.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-300">{ev.key}</span>
                  <span className="text-slate-500">=</span>
                  <span className="font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {ev.value}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">{ev.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step by step deployment checklist for smartphones */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          Пошаговая инструкция: Запуск на телефоне за 4 шага
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-200">Создайте репозиторий на GitHub с телефона</p>
              <p className="text-slate-400 mt-0.5">
                Откройте github.com в браузере телефона, нажмите «New repository» (например, <code className="text-indigo-300">my-phone-pc</code>).
                Нажмите «Add file» → «Create new file», назовите его <code className="text-indigo-300">Dockerfile</code> и вставьте скопированный выше код.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-200">Зарегистрируйтесь на Render.com и создайте Web Service</p>
              <p className="text-slate-400 mt-0.5">
                Зайдите на dashboard.render.com, нажмите кнопку «New +» и выберите «Web Service».
                Подключите ваш GitHub аккаунт и выберите только что созданный репозиторий.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-200">Укажите бесплатный план и переменные</p>
              <p className="text-slate-400 mt-0.5">
                В поле Instance Type обязательно выберите <strong>Free ($0/mo)</strong>. В разделе Environment добавьте переменные:
                <code className="text-emerald-300 ml-1">PORT=8080</code> и <code className="text-emerald-300 ml-1">PASSWORD=ваш_пароль</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div>
              <p className="font-semibold text-slate-200">Нажмите «Deploy Web Service» и откройте сайт со смартфона</p>
              <p className="text-slate-400 mt-0.5">
                Сборка займет 2–3 минуты. Когда появится зелёная надпись «Live», перейдите по выданной ссылке (например, <code className="text-indigo-300">https://your-app.onrender.com</code>),
                введите пароль и работайте в коде со своего смартфона!
              </p>
            </div>
          </div>
        </div>

        {/* Lifehack for Sleep mode */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1.5">
          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Лайфхак: Как предотвратить засыпание Render Free?
          </span>
          <p className="text-slate-300 leading-relaxed">
            Бесплатный Render уходит в сон через 15 минут, если нет запросов. Чтобы он не засыпал во время работы,
            зарегистрируйтесь на бесплатном сервисе <strong>cron-job.org</strong> или <strong>uptimerobot.com</strong> и настройте
            автоматический пинг вашей ссылки каждые 10 минут.
          </p>
        </div>
      </div>
    </div>
  );
};
