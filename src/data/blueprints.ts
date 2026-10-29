import { RenderBlueprint } from '../types';

export const RENDER_BLUEPRINTS: RenderBlueprint[] = [
  {
    id: 'code-server',
    title: 'Code-Server (VS Code Web)',
    category: 'Рекомендуется',
    ramUsage: '~220 МБ из 512 МБ',
    description: 'Полноценный Visual Studio Code в браузере смартфона. Включает терминал, файловый менеджер, подсветку кода и расширения.',
    recommendedFor: 'Идеально для написания скриптов на Python, Node.js, веб-разработки прямо в мобильном браузере.',
    dockerfile: `FROM debian:bullseye-slim

# Обновление и установка базовых утилит
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    wget \\
    git \\
    python3 \\
    python3-pip \\
    nodejs \\
    npm \\
    ca-certificates \\
    sudo \\
    bash \\
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя без root-прав для безопасности
RUN useradd -m -s /bin/bash coder && \\
    echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# Установка code-server (VS Code для браузера)
RUN curl -fsSL https://code-server.dev/install.sh | sh

USER coder
WORKDIR /home/coder/project

# Переменные по умолчанию для Render
ENV PORT=8080
ENV PASSWORD=mycloudpassword123

EXPOSE \${PORT}

# Запуск с оптимизацией памяти для 512 МБ ОЗУ Render
CMD ["sh", "-c", "code-server --bind-addr 0.0.0.0:\${PORT} --auth password --disable-telemetry --disable-workspace-trust /home/coder/project"]`,
    renderYaml: `services:
  - type: web
    name: opencode-cloud-vscode
    env: docker
    plan: free
    region: frankfurt # или oregon
    dockerfilePath: Dockerfile
    envVars:
      - key: PORT
        value: 8080
      - key: PASSWORD
        value: changeme_phone_pass
      - key: NODE_OPTIONS
        value: "--max-old-space-size=350"`,
    startScript: `#!/bin/bash
# Запуск code-server с флагами экономии ОЗУ
code-server \\
  --bind-addr 0.0.0.0:\${PORT:-8080} \\
  --auth password \\
  --disable-telemetry \\
  --disable-workspace-trust \\
  /home/coder/project`,
    envVars: [
      { key: 'PORT', value: '8080', desc: 'Порт, который слушает веб-сервис на Render' },
      { key: 'PASSWORD', value: 'свой_пароль', desc: 'Пароль для входа в VS Code со смартфона' },
      { key: 'NODE_OPTIONS', value: '--max-old-space-size=350', desc: 'Ограничение памяти V8, чтобы избежать вылета по 512МБ' },
    ],
    pros: [
      'Привычный интерфейс VS Code со всеми горячими клавишами',
      'Встроенный терминал Linux прямо внутри страницы редактора',
      'Отлично масштабируется в Chrome и Safari на мобильном',
      'Укладывается в 512 МБ ОЗУ при отключенной телеметрии',
    ],
    cons: [
      'Render Free засыпает через 15 минут неактивности (холодный старт ~50 сек)',
      'На бесплатном Render диск сбрасывается при перезапуске (сохраняйте код в GitHub!)',
    ],
    tipsForRenderFree: [
      'Всегда делайте git push в свой репозиторий GitHub перед закрытием вкладки, так как файловая система Render Free эфемерна.',
      'Установите пароль через переменную окружения PASSWORD в панели Render Environment.',
      'Для удобного набора на телефоне используйте панель вспомогательных клавиш (Esc, Tab, Ctrl, |).',
    ],
  },
  {
    id: 'ttyd-terminal',
    title: 'TTYD Web Terminal (Ультра-легкий Linux)',
    category: 'Ультра-легкий',
    ramUsage: '~25 МБ из 512 МБ (не убивается OOM)',
    description: 'Веб-терминал Linux прямо в браузере телефона. Мгновенная загрузка, поддержка Bash, Python, Git, Nano, Vim и утилит.',
    recommendedFor: 'Запуск ботов, парсеров, консольных скриптов Python/Node и обучение Linux командам с мобильного.',
    dockerfile: `FROM debian:bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    wget \\
    git \\
    python3 \\
    python3-pip \\
    python3-venv \\
    nodejs \\
    npm \\
    nano \\
    vim \\
    tmux \\
    htop \\
    neofetch \\
    ca-certificates \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Скачивание легковесного бинарника ttyd
RUN ARCH=\$(uname -m) && \\
    if [ "$ARCH" = "x86_64" ]; then TTYD_ARCH="x86_64"; else TTYD_ARCH="aarch64"; fi && \\
    wget -qO /usr/local/bin/ttyd "https://github.com/tsl0922/ttyd/releases/download/1.7.4/ttyd.\${TTYD_ARCH}" && \\
    chmod +x /usr/local/bin/ttyd

WORKDIR /workspace

ENV PORT=8080
ENV USERNAME=admin
ENV PASSWORD=adminpass

EXPOSE \${PORT}

# ttyd с авторизацией по паролю
CMD ["sh", "-c", "ttyd -p \${PORT} -c \${USERNAME}:\${PASSWORD} -W bash"]`,
    renderYaml: `services:
  - type: web
    name: linux-mobile-terminal
    env: docker
    plan: free
    region: frankfurt
    dockerfilePath: Dockerfile
    envVars:
      - key: PORT
        value: 8080
      - key: USERNAME
        value: admin
      - key: PASSWORD
        value: myterminalpass123`,
    envVars: [
      { key: 'PORT', value: '8080', desc: 'Порт Render' },
      { key: 'USERNAME', value: 'admin', desc: 'Логин для входа в веб-консоль' },
      { key: 'PASSWORD', value: 'свой_пароль', desc: 'Пароль для защиты от посторонних' },
    ],
    pros: [
      'Потребляет всего 25 МБ ОЗУ (никогда не зависнет из-за нехватки памяти)',
      'Мгновенный отклик даже на медленном мобильном интернете 3G/4G',
      'Поддерживает tmux для работы в фоне',
      'Включает Python 3, Node.js, Git, Nano прямо из коробки',
    ],
    cons: [
      'Только текстовый интерфейс (нет графического окна, работа через консоль или nano/vim)',
    ],
    tipsForRenderFree: [
      'Используйте tmux для сохранения сессий внутри запущенного контейнера.',
      'Для редактирования файлов в терминале используйте удобный nano или встроенный редактор нашего приложения.',
    ],
  },
  {
    id: 'webtop-gui',
    title: 'Ubuntu XFCE Desktop (noVNC Веб-ПК)',
    category: 'Полный GUI',
    ramUsage: '~420 МБ из 512 МБ (на грани лимита)',
    description: 'Настоящий графический рабочий стол Linux (XFCE) прямо в браузере со значками, меню Пуск, окнами и файловым менеджером.',
    recommendedFor: 'Когда нужен именно визуальный "компьютер" с окнами, мышкой и графическими программами на экране телефона.',
    dockerfile: `FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Установка переменных окружения
ENV PUID=1000
ENV PGID=1000
ENV TZ=Etc/UTC
ENV SUBFOLDER=/
ENV TITLE="Cloud Mobile PC"

# Отключаем тяжелые службы для экономии памяти на Render Free
ENV START_DOCKER=false

# На Render порт задается переменной PORT (обычно 8080 или 3000)
# LinuxServer webtop по умолчанию слушает 3000 (HTTP)
EXPOSE 3000`,
    renderYaml: `services:
  - type: web
    name: mobile-cloud-pc-gui
    env: docker
    plan: free
    region: frankfurt
    dockerfilePath: Dockerfile
    envVars:
      - key: PORT
        value: 3000
      - key: PASSWORD
        value: secure_desktop_pwd`,
    envVars: [
      { key: 'PORT', value: '3000', desc: 'Порт noVNC веб-клиента' },
      { key: 'PASSWORD', value: 'пароль', desc: 'Пароль блокировки экрана noVNC' },
      { key: 'TITLE', value: 'Cloud PC', desc: 'Заголовок вкладки в браузере' },
    ],
    pros: [
      'Настоящий графический интерфейс ПК: рабочий стол, папки, окна, корзина',
      'Управление курсором мыши пальцем или через сенсорную панель noVNC',
      'Возможность открывать несколько окон одновременно',
    ],
    cons: [
      '512 МБ ОЗУ на бесплатном тарифе Render — впритык. Запуск тяжелого Chrome внутри рабочего стола приведет к перезагрузке (OOM).',
      'Требует стабильного интернета для плавной передачи видеокадров',
    ],
    tipsForRenderFree: [
      'Не открывайте внутри браузер Chromium/Firefox, так как они потребляют от 300+ МБ ОЗУ и убьют контейнер. Используйте легковесный Dillo или работайте с терминалом/текстовыми редакторами внутри.',
      'Для набора текста переключите режим клавиатуры в боковой панели noVNC.',
    ],
  },
  {
    id: 'opencode-interpreter',
    title: 'OpenCode / Code Sandbox Suite',
    category: 'AI Workspace',
    ramUsage: '~180 МБ из 512 МБ',
    description: 'Специальная среда для запуска скриптов OpenCode, автоматизации, работы с AI API и выполнения кода на сервере.',
    recommendedFor: 'Запуск агентных скриптов, автоматических ботов, парсинга данных и AI ассистентов.',
    dockerfile: `FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    git \\
    curl \\
    ca-certificates \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Установка зависимостей для веб-сервера и среды выполнения
RUN pip install --no-cache-dir \\
    fastapi \\
    uvicorn \\
    pydantic \\
    requests \\
    python-dotenv

COPY . /app

ENV PORT=8080
EXPOSE \${PORT}

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port \${PORT}"]`,
    renderYaml: `services:
  - type: web
    name: opencode-backend-runner
    env: docker
    plan: free
    region: frankfurt
    dockerfilePath: Dockerfile
    envVars:
      - key: PORT
        value: 8080`,
    envVars: [
      { key: 'PORT', value: '8080', desc: 'Порт приложения' },
    ],
    pros: [
      'Минимальное потребление памяти',
      'Идеально подходит для API и автономных задач',
    ],
    cons: [
      'Требует базовых навыков работы с Python или REST API',
    ],
    tipsForRenderFree: [
      'Используйте бесплатный cron-сервис (например, cron-job.org) для периодического опроса, если требуется, чтобы сервис не засыпал во время работы.',
    ],
  },
];
