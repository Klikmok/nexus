# Nexus — Инструкция по деплою на сайт

## Что изменилось в коде

| Файл | Изменение |
|------|-----------|
| `backend/app/ideas.py` | discriminator → 8b-instant, 6 идей вместо 10, семафор |
| `backend/app/routers/auth.py` | добавлен `POST /api/auth/guest` для веба |
| `backend/app/main.py` | CORS обновлён под Vercel |
| `backend/app/config.py` | добавлен параметр `FRONTEND_URL` |
| `frontend/src/App.tsx` | авто-определение Telegram vs браузер |
| `frontend/src/api.ts` | добавлена функция `authGuest()` |
| `frontend/vercel.json` | проксирование `/api/*` на Railway |

---

## Стек

```
Браузер  →  Vercel (фронт)  →  Railway (бэк + БД + Redis)  →  Groq API
```

- **Vercel** — бесплатно, CDN, auto-deploy из GitHub
- **Railway** — $5/мес (Hobby), не засыпает, PostgreSQL + Redis включены

---

## Шаг 1 — Подготовка репозитория

```bash
git clone <ваш репо>
cd nexus

# Скопируйте новые файлы из архива в проект:
# backend/app/ideas.py        (быстрая генерация)
# backend/app/routers/auth.py (гостевой вход)
# backend/app/main.py         (CORS)
# backend/app/config.py       (FRONTEND_URL)
# frontend/src/App.tsx        (без Telegram зависимости)
# frontend/src/api.ts         (authGuest)
# frontend/vercel.json        (прокси)
# .env.example                (обновлённый)

git add -A
git commit -m "feat: web deployment, optimised generation"
git push
```

---

## Шаг 2 — Railway (бэкенд + БД)

### 2.1 Создайте аккаунт и проект

1. Зайдите на [railway.app](https://railway.app) → **Start a New Project**
2. Выберите **Deploy from GitHub repo** → выберите ваш репозиторий
3. Railway спросит папку — укажите `backend`

### 2.2 Добавьте PostgreSQL

В вашем Railway проекте:
```
+ New Service → Database → PostgreSQL
```
Railway автоматически добавит переменную `DATABASE_URL` в ваш бэкенд.

### 2.3 Добавьте Redis

```
+ New Service → Database → Redis
```
Переменная `REDIS_URL` добавится автоматически.

### 2.4 Переменные окружения бэкенда

В Railway → ваш backend сервис → **Variables**:

```
GROQ_API_KEY=gsk_ваш_ключ
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_FAST=llama-3.1-8b-instant
JWT_SECRET=ваша-случайная-строка-32-символа
JWT_EXPIRE_HOURS=72
DEBUG=false
FRONTEND_URL=https://ваш-проект.vercel.app   ← заполните после шага 3
```

> `DATABASE_URL` и `REDIS_URL` Railway подставляет сам — не трогайте.

### 2.5 Настройте регион

Settings → Region → **US East** (там серверы Groq — меньше задержка).

### 2.6 Проверьте запуск

После деплоя откройте:
```
https://ваш-backend.railway.app/api/health
```
Должны увидеть: `{"status":"ok","version":"0.4.0"}`

---

## Шаг 3 — Vercel (фронтенд)

### 3.1 Создайте проект

1. Зайдите на [vercel.com](https://vercel.com) → **Add New Project**
2. Импортируйте ваш GitHub репозиторий
3. **Root Directory** → `frontend`
4. Framework → **Vite**

### 3.2 Обновите vercel.json

Откройте `frontend/vercel.json` и вставьте URL вашего Railway бэкенда:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ВАШ-BACKEND.railway.app/api/:path*"
    }
  ]
}
```

Закоммитьте изменение:
```bash
git add frontend/vercel.json
git commit -m "fix: set railway backend url"
git push
```

### 3.3 Деплой

Vercel автоматически задеплоит при пуше. Получите URL вида:
```
https://nexus-xyz.vercel.app
```

### 3.4 Обновите CORS на Railway

Вернитесь в Railway → Variables:
```
FRONTEND_URL=https://nexus-xyz.vercel.app
```
Railway передеплоит бэкенд автоматически.

---

## Шаг 4 — Проверка

Откройте `https://nexus-xyz.vercel.app`:

1. ✅ Появилась сплэш-страница
2. ✅ Кнопка «Начать» работает (гостевой вход)
3. ✅ Форма профиля сохраняется
4. ✅ Генерация идей занимает **10–15 сек** (было 20–40)
5. ✅ Финансовая модель строится

---

## Производительность после оптимизаций

```
check_contradictions   ~0 сек   детерминированный
generate_candidates    ~4-5 сек  70b, 6 идей (было 10)
run_discriminators     ~4-6 сек  8b-instant + семафор (было 15-30 сек)
aggregate_scores       ~0 сек
enrich_cards           ~2-3 сек  8b-instant параллельно
─────────────────────────────────
ИТОГО                  ~10-14 сек (было 20-40 сек)
```

---

## Возможные проблемы

### 502 Bad Gateway на /api/*
- Проверьте, что Railway бэкенд запустился: `/api/health`
- Проверьте URL в `vercel.json` — не должно быть слэша в конце

### CORS ошибка в консоли
- Убедитесь что `FRONTEND_URL` в Railway совпадает с вашим Vercel URL
- Передеплойте Railway после изменения переменной

### Rate limit от Groq (429)
- На бесплатном тарифе Groq: 30 RPM, 6000 TPM для 70b
- Семафор на 3 параллельных запроса уже встроен в новый `ideas.py`
- Если всё равно 429 — зарегистрируйтесь на [console.groq.com](https://console.groq.com) и получите бесплатный ключ (лимиты щедрые)

### База данных не подключается
- В Railway убедитесь что PostgreSQL сервис **в одном проекте** с бэкендом
- `DATABASE_URL` должен содержать `asyncpg`, а не `psycopg2`

---

## Домен (опционально)

В Vercel → Settings → Domains → добавьте свой домен.
Vercel сам выпишет SSL-сертификат.

---

## Телеграм-бот (опционально, если нужен параллельно)

Приложение автоматически определяет среду:
- В браузере → гостевой вход
- В Telegram WebApp → авторизация через initData

Для бота просто добавьте в Railway Variables:
```
BOT_TOKEN=ваш_токен
WEBAPP_URL=https://nexus-xyz.vercel.app
```
И задеплойте папку `bot` как отдельный Railway сервис.
