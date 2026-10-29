import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Enable CORS for OpenCode Mobile app connection
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// OpenCode Mobile Protocol Endpoints (Port 4096 compatibility)
app.get(['/global/health', '/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    version: '2.4.0',
    service: 'opencode-server',
    hostname: req.hostname,
    port: 4096,
    platform: 'linux-cloud',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/sessions', '/api/sessions'], (req, res) => {
  res.json([]);
});

app.post(['/session', '/api/session'], (req, res) => {
  res.json({
    id: `sess-${Date.now()}`,
    status: 'active',
    created_at: new Date().toISOString(),
  });
});

// Return connection pair data for OpenCode Mobile app
app.get('/api/opencode/pair-info', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'localhost:3000';
  const serverUrl = `${protocol}://${host}`;

  res.json({
    serverUrl,
    defaultPort: 4096,
    username: 'opencode',
    password: process.env.OPENCODE_PASSWORD || 'opencode123',
    qrPayload: JSON.stringify({
      url: serverUrl,
      username: 'opencode',
      password: process.env.OPENCODE_PASSWORD || 'opencode123',
    }),
  });
});

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// AI Assistant endpoint for Cloud PC / OpenCode / Render guidance & code generation
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { message, code, logs, systemMode } = req.body;

    if (!message && !logs && !code) {
      return res.status(400).json({ error: 'Сообщение или контекст не указаны' });
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not set
      return res.json({
        reply: `Вы работаете в мобильном окружении. Чтобы развернуть OpenCode / Code-Server на бесплатном тарифе Render:
1. Создайте репозиторий на GitHub с предоставленным Dockerfile.
2. В Render создайте Web Service и выберите бесплатный тариф (Free).
3. Установите переменные PASSWORD и PORT=8080.
(Для подключения ИИ-ассистента в реальном времени укажите ключ GEMINI_API_KEY).`
      });
    }

    const systemPrompt = `Ты — эксперт по облачной разработке, Linux, Docker, Render.com и веб-разработке на мобильных устройствах (смартфонах Android и iOS).
Пользователь обращается к тебе: он хочет работать в коде/OpenCode со своего телефона, не имея компьютера (ПК).
Твоя цель:
1. Давать точные, практичные и лаконичные советы на русском языке.
2. Учитывать ограничения бесплатного тарифа Render (512 МБ ОЗУ, отключение после 15 мин простоя, эфемерный диск).
3. Помогать с Dockerfile, render.yaml, настройкой code-server, ttyd, Termux, GitHub Codespaces.
4. Отвечать структурированно, с готовыми командами и файлами для копирования.
Режим: ${systemMode || 'general'}`;

    const promptText = `Системный контекст: ${systemPrompt}\n\nПользовательский запрос:\n${message || ''}\n\n${
      code ? `Текущий код:\n\`\`\`\n${code}\n\`\`\`\n` : ''
    }${logs ? `Логи / Ошибки:\n\`\`\`\n${logs}\n\`\`\`\n` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    return res.json({ reply: response.text || 'Ответ сформирован.' });
  } catch (error: any) {
    console.error('Error in /api/ai/assistant:', error);
    return res.status(500).json({
      error: error.message || 'Ошибка генерации ответа',
      reply: 'Произошла ошибка при обращении к ИИ. Проверьте подключение или воспользуйтесь готовыми шаблонами ниже.'
    });
  }
});

// Git Clone / Import endpoint
app.post('/api/git/clone', async (req, res) => {
  try {
    const { repoUrl, token } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Укажите URL репозитория' });
    }

    // Clean URL
    const cleanUrl = repoUrl.trim().replace(/\.git$/, '').replace(/\/$/, '');
    const ghMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);

    if (ghMatch) {
      const owner = ghMatch[1];
      const repo = ghMatch[2];

      const headers: Record<string, string> = {
        'User-Agent': 'OpenCode-Mobile-Studio',
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      // Check default branch
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok) {
        return res.status(repoRes.status).json({
          error: `GitHub вернул статус ${repoRes.status}: ${repoRes.statusText}. Проверьте правильность URL или наличие токена для приватного репозитория.`
        });
      }
      const repoData = (await repoRes.json()) as any;
      const defaultBranch = repoData.default_branch || 'main';

      // Fetch tree
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
      if (!treeRes.ok) {
        return res.status(treeRes.status).json({ error: 'Не удалось получить дерево файлов репозитория' });
      }
      const treeData = (await treeRes.json()) as any;
      const blobs = (treeData.tree || []).filter((item: any) => item.type === 'blob').slice(0, 20); // Top 20 files

      const files: any[] = [];
      for (const item of blobs) {
        // Skip huge or binary files
        if (item.path.match(/\.(png|jpg|jpeg|gif|ico|webp|mp4|zip|tar|gz|exe|pdf|woff|woff2)$/i)) {
          continue;
        }

        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`;
          const fileRes = await fetch(rawUrl, { headers });
          if (fileRes.ok) {
            const content = await fileRes.text();
            let lang = 'javascript';
            if (item.path.endsWith('.py')) lang = 'python';
            else if (item.path.endsWith('.html')) lang = 'html';
            else if (item.path.endsWith('.yaml') || item.path.endsWith('.yml')) lang = 'yaml';
            else if (item.path.endsWith('.json')) lang = 'json';
            else if (item.path.endsWith('.md')) lang = 'markdown';
            else if (item.path.endsWith('.sh')) lang = 'shell';
            else if (item.path.toLowerCase().includes('dockerfile')) lang = 'dockerfile';

            files.push({
              id: item.path,
              name: item.path,
              language: lang,
              content,
            });
          }
        } catch {
          // ignore individual file fetch errors
        }
      }

      return res.json({
        success: true,
        owner,
        repo,
        branch: defaultBranch,
        filesCount: files.length,
        files: files.length > 0 ? files : null,
      });
    }

    return res.status(400).json({ error: 'Поддерживаются репозитории GitHub (например, https://github.com/user/repo)' });
  } catch (error: any) {
    console.error('Git clone error:', error);
    return res.status(500).json({ error: error.message || 'Ошибка клонирования репозитория' });
  }
});

// Git Push directly to GitHub via API
app.post('/api/git/push', async (req, res) => {
  try {
    const { token, owner, repo, branch = 'main', files, message = 'Update from OpenCode Mobile' } = req.body;

    if (!token || !owner || !repo || !files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Необходимо указать: token, owner, repo и список файлов' });
    }

    const headers = {
      'User-Agent': 'OpenCode-Mobile-Studio',
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    };

    // Get branch ref
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    if (!refRes.ok) {
      return res.status(refRes.status).json({
        error: `Не удалось получить ветку ${branch} (статус ${refRes.status}). Проверьте токен доступа (Personal Access Token с правами repo).`
      });
    }
    const refData = (await refRes.json()) as any;
    const latestCommitSha = refData.object.sha;

    // Get latest commit tree
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
    const commitData = (await commitRes.json()) as any;
    const baseTreeSha = commitData.tree.sha;

    // Create blobs & tree items
    const treeItems: any[] = [];
    for (const f of files) {
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: f.content,
          encoding: 'utf-8',
        }),
      });
      if (blobRes.ok) {
        const blobData = (await blobRes.json()) as any;
        treeItems.push({
          path: f.name,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        });
      }
    }

    // Create new tree
    const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });
    if (!newTreeRes.ok) {
      return res.status(newTreeRes.status).json({ error: 'Не удалось создать дерево Git' });
    }
    const newTreeData = (await newTreeRes.json()) as any;

    // Create new commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        tree: newTreeData.sha,
        parents: [latestCommitSha],
      }),
    });
    if (!newCommitRes.ok) {
      return res.status(newCommitRes.status).json({ error: 'Не удалось создать коммит' });
    }
    const newCommitData = (await newCommitRes.json()) as any;

    // Update branch reference
    const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    });

    if (!updateRefRes.ok) {
      return res.status(updateRefRes.status).json({ error: 'Не удалось обновить ветку' });
    }

    return res.json({
      success: true,
      commitSha: newCommitData.sha.substring(0, 7),
      commitUrl: newCommitData.html_url,
      branch,
    });
  } catch (error: any) {
    console.error('Git push error:', error);
    return res.status(500).json({ error: error.message || 'Ошибка выполнения git push' });
  }
});

// Render Deploy Hook trigger (1-click trigger to immediately redeploy on Render)
app.post('/api/render/deploy-hook', async (req, res) => {
  try {
    const { deployHookUrl } = req.body;
    if (!deployHookUrl || !deployHookUrl.startsWith('https://api.render.com/deploy/')) {
      return res.status(400).json({ error: 'Укажите корректный Deploy Hook URL от Render' });
    }

    const deployRes = await fetch(deployHookUrl, { method: 'POST' });
    if (!deployRes.ok) {
      return res.status(deployRes.status).json({ error: 'Render отклонил запрос вебхука' });
    }

    return res.json({ success: true, message: 'Деплой на Render успешно запущен!' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Ошибка вызова Render Deploy Hook' });
  }
});

// GitHub Codespaces: List user codespaces
app.post('/api/codespaces/list', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Укажите GitHub Personal Access Token (с правами codespace)' });
    }

    const ghRes = await fetch('https://api.github.com/user/codespaces', {
      headers: {
        'User-Agent': 'OpenCode-Mobile-Studio',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        error: (errData as any).message || `GitHub API вернул статус ${ghRes.status}. Проверьте наличие прав 'codespace' у токена.`,
      });
    }

    const data = (await ghRes.json()) as any;
    const codespaces = (data.codespaces || []).map((cs: any) => ({
      name: cs.name,
      state: cs.state, // Available, Shutdown, Awaiting, Starting, Rebooting, Updating, etc.
      webUrl: cs.web_url,
      repo: cs.repository?.full_name || 'custom-repo',
      branch: cs.git_status?.ref || 'main',
      machineName: cs.machine?.display_name || '2 cores, 4 GB RAM',
      cpus: cs.machine?.cpus || 2,
      ramGb: cs.machine?.memory_in_bytes ? Math.round(cs.machine.memory_in_bytes / (1024 * 1024 * 1024)) : 4,
      idleTimeout: cs.idle_timeout_minutes || 30,
      lastUsedAt: cs.last_used_at,
      createdAt: cs.created_at,
    }));

    return res.json({ success: true, codespaces });
  } catch (error: any) {
    console.error('Codespaces list error:', error);
    return res.status(500).json({ error: error.message || 'Ошибка при получении списка Codespaces' });
  }
});

// GitHub Codespaces: Start / Wake codespace
app.post('/api/codespaces/start', async (req, res) => {
  try {
    const { token, codespaceName } = req.body;
    if (!token || !codespaceName) {
      return res.status(400).json({ error: 'Укажите token и имя Codespace' });
    }

    const ghRes = await fetch(`https://api.github.com/user/codespaces/${codespaceName}/start`, {
      method: 'POST',
      headers: {
        'User-Agent': 'OpenCode-Mobile-Studio',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        error: (errData as any).message || `Не удалось включить Codespace (${ghRes.status})`,
      });
    }

    const data = (await ghRes.json()) as any;
    return res.json({
      success: true,
      message: 'Команда запуска отправлена. Codespace просыпается!',
      state: data.state || 'Starting',
      webUrl: data.web_url,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Ошибка запуска Codespace' });
  }
});

// GitHub Codespaces: Stop / Sleep codespace to save hours
app.post('/api/codespaces/stop', async (req, res) => {
  try {
    const { token, codespaceName } = req.body;
    if (!token || !codespaceName) {
      return res.status(400).json({ error: 'Укажите token и имя Codespace' });
    }

    const ghRes = await fetch(`https://api.github.com/user/codespaces/${codespaceName}/stop`, {
      method: 'POST',
      headers: {
        'User-Agent': 'OpenCode-Mobile-Studio',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        error: (errData as any).message || `Не удалось выключить Codespace (${ghRes.status})`,
      });
    }

    const data = (await ghRes.json()) as any;
    return res.json({
      success: true,
      message: 'Codespace остановлен! Таймер бесплатных часов заморожен.',
      state: data.state || 'Shutdown',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Ошибка остановки Codespace' });
  }
});

// Remote Host Ping & Wake-up Check (Render / Codespaces / Custom URL)
app.post('/api/remote/ping', async (req, res) => {
  try {
    const { hostUrl } = req.body;
    if (!hostUrl) {
      return res.status(400).json({ error: 'Укажите URL удаленного хоста' });
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for waking up sleeping Render

    try {
      const pingRes = await fetch(hostUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'OpenCode-Mobile-Gateway' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      return res.json({
        online: pingRes.status < 500,
        status: pingRes.status,
        statusText: pingRes.statusText,
        latencyMs,
        isWakingUp: pingRes.status === 502 || pingRes.status === 503 || pingRes.status === 504,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      return res.json({
        online: false,
        error: fetchErr.name === 'AbortError' ? 'Таймаут (хост засыпает или долго запускается)' : fetchErr.message,
        latencyMs: Date.now() - startTime,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Ошибка пинга хоста' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
