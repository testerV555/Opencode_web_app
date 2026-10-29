import { WorkspaceFile } from '../types';

export const INITIAL_FILES: WorkspaceFile[] = [
  {
    id: 'main.py',
    name: 'main.py',
    language: 'python',
    content: `# OpenCode Mobile Environment
import sys
import platform
import math

print("=== Запуск OpenCode на мобильном устройстве ===")
print(f"Платформа: {platform.system()} {platform.release()}")
print(f"Python версия: {sys.version.split()[0]}")

# Пример вычислений
numbers = [1, 2, 3, 4, 5, 10, 25]
squares = [x**2 for x in numbers]
sqrt_sum = sum([math.sqrt(x) for x in numbers])

print(f"Числа: {numbers}")
print(f"Квадраты: {squares}")
print(f"Сумма квадратных корней: {sqrt_sum:.2f}")

print("\\n[OK] Скрипт успешно выполнен прямо в вашем телефоне!")
`,
  },
  {
    id: 'app.js',
    name: 'app.js',
    language: 'javascript',
    content: `// Node.js / JavaScript скрипт в мобильной веб-среде
console.log("Запуск JavaScript среды OpenCode...");

const systemInfo = {
  device: "Смартфон / Мобильный браузер",
  cloudTier: "Render Free (512MB RAM)",
  status: "Работает активно",
  timestamp: new Date().toLocaleTimeString('ru-RU')
};

console.log("Статус системы:", JSON.stringify(systemInfo, null, 2));

function calculatePerformance() {
  const start = performance.now();
  let acc = 0;
  for (let i = 0; i < 50000; i++) {
    acc += Math.sin(i);
  }
  const end = performance.now();
  return (end - start).toFixed(2);
}

console.log(\`Время вычислений 50,000 итераций: \${calculatePerformance()} ms\`);
console.log("Готово! Код успешно выполнен.");
`,
  },
  {
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Мой мини-сайт со смартфона</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 24px;
      background: #0f172a;
      color: #f8fafc;
      text-align: center;
    }
    .card {
      background: #1e293b;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #334155;
      max-width: 400px;
      margin: 40px auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      margin-top: 16px;
      transition: background 0.2s;
    }
    button:active {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Привет с телефона! 📱</h2>
    <p>Этот проект написан и запущен без компьютера в веб-студии OpenCode.</p>
    <button onclick="showAlert()">Нажми меня</button>
    <p id="output" style="margin-top: 16px; color: #38bdf8;"></p>
  </div>
  <script>
    function showAlert() {
      document.getElementById('output').textContent = 'Успех! Веб-страница работает на 100%.';
    }
  </script>
</body>
</html>
`,
  },
  {
    id: 'Dockerfile',
    name: 'Dockerfile',
    language: 'dockerfile',
    content: `FROM debian:bullseye-slim

# Установка базовых инструментов для работы без ПК
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl wget git python3 python3-pip nodejs npm ca-certificates sudo bash \\
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash coder && \\
    echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# Установка VS Code в браузере (code-server)
RUN curl -fsSL https://code-server.dev/install.sh | sh

USER coder
WORKDIR /home/coder/project

# Переменная порта для Render
ENV PORT=8080
ENV PASSWORD=phonecoder123

EXPOSE \${PORT}

# Оптимизировано под 512 МБ ОЗУ бесплатного Render
CMD ["sh", "-c", "code-server --bind-addr 0.0.0.0:\${PORT} --auth password --disable-telemetry --disable-workspace-trust /home/coder/project"]
`,
  },
  {
    id: 'render.yaml',
    name: 'render.yaml',
    language: 'yaml',
    content: `services:
  - type: web
    name: opencode-phone-pc
    env: docker
    plan: free
    region: frankfurt
    dockerfilePath: Dockerfile
    envVars:
      - key: PORT
        value: 8080
      - key: PASSWORD
        value: my_super_secret_phone_pass
      - key: NODE_OPTIONS
        value: "--max-old-space-size=350"
`,
  },
];
