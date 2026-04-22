# Деплой: Railway (бекенд) + Vercel (фронт)

Пошагово. Всё бесплатно на старте.

---

## 0. Подготовка — 1 раз

1. Заведи 3 аккаунта (если ещё нет):
   - GitHub — https://github.com/signup
   - Railway — https://railway.com (через GitHub)
   - Vercel — https://vercel.com (через GitHub)
2. Установи локально `git`.

---

## 1. Репозитории в GitHub

Распакуй оба архива и залей **два отдельных репозитория**:

```bash
# бекенд
unzip -o tg_bot_backend.zip -d tg_bot_backend && cd tg_bot_backend
git init -b main && git add . && git commit -m "init backend"
# создай пустой репозиторий tg-stars-backend на github.com, потом:
git remote add origin https://github.com/<твой_ник>/tg-stars-backend.git
git push -u origin main
cd ..

# фронтенд
unzip -o tg_stars_app.zip -d tg_stars_app && cd tg_stars_app
git init -b main && git add . && git commit -m "init frontend"
# создай пустой репозиторий tg-stars-app на github.com, потом:
git remote add origin https://github.com/<твой_ник>/tg-stars-app.git
git push -u origin main
cd ..
```

---

## 2. @BotFather — создай бота и включи Stars

В Telegram у [@BotFather](https://t.me/BotFather):

1. `/newbot` → дай имя и username → получишь **BOT_TOKEN** вида `123456:ABC-DEF…` — скопируй.
2. `/mybots` → выбери бота → **Payments** → подключи **Telegram Stars** (официальный провайдер, без внешних ключей).
3. Узнай свой Telegram user_id — напиши боту [@userinfobot](https://t.me/userinfobot). Это будет твой `ADMIN_IDS`.
4. Пока оставь в стороне — Mini App-URL добавим в конце, когда получим публичный адрес фронта.

---

## 3. Бекенд на Railway

1. Зайди на https://railway.com → **New Project** → **Deploy from GitHub repo** → выбери `tg-stars-backend`.
2. Railway увидит `railway.json` и соберёт через `backend/Dockerfile`. Ничего настраивать не надо.
3. **Variables** (вкладка в проекте) → добавь:

   | Ключ                   | Значение                                                        |
   | ---------------------- | --------------------------------------------------------------- |
   | `BOT_TOKEN`            | токен от BotFather                                              |
   | `ADMIN_IDS`            | твой Telegram ID (напр. `123456789`), через запятую можно больше|
   | `JWT_SECRET`           | любая длинная случайная строка (32+ символа)                    |
   | `ADMIN_PANEL_USER`     | `admin` (или свой)                                              |
   | `ADMIN_PANEL_PASSWORD` | длинный пароль для веб-админки `/admin/`                        |
   | `BOT_POLLING`          | `1` (чтобы бот работал в polling-режиме внутри того же процесса)|
   | `DATABASE_URL`         | см. шаг 3.5 ниже                                                |

4. **Публичный URL:** в разделе **Settings → Networking → Public Networking** нажми **Generate Domain**. Получишь адрес типа `https://tg-stars-backend-production.up.railway.app`. Добавь его в Variables:

   | Ключ         | Значение                                              |
   | ------------ | ----------------------------------------------------- |
   | `PUBLIC_URL` | `https://tg-stars-backend-production.up.railway.app` |

5. **Postgres (рекомендую, иначе БД сбросится при редеплое):**
   - В проекте Railway → **+ New** → **Database** → **PostgreSQL**.
   - Открой Postgres-сервис → **Connect** → скопируй `DATABASE_URL` (вида `postgresql://...`).
   - В **бекенд-сервисе** → Variables → добавь:
     ```
     DATABASE_URL=postgresql+asyncpg://<USER>:<PASS>@<HOST>:<PORT>/<DB>
     ```
     (обрати внимание: `postgresql+asyncpg://`, а не просто `postgresql://`).

6. Redeploy. Проверь что работает:
   - `https://<твой-домен>/api/health` → `{"status":"ok"}`
   - `https://<твой-домен>/admin/` → веб-админка (логин/пароль из переменных)
   - `https://<твой-домен>/docs` → Swagger

---

## 4. Фронтенд на Vercel

1. Зайди на https://vercel.com/new → **Import Git Repository** → выбери `tg-stars-app`.
2. Vercel сам определит **Vite**. Build command `npm run build`, output `dist` — уже прописаны в `vercel.json`, не трогай.
3. **Environment Variables** → добавь:

   | Ключ             | Значение (из Railway, шаг 3.4)                        |
   | ---------------- | ----------------------------------------------------- |
   | `VITE_API_BASE`  | `https://tg-stars-backend-production.up.railway.app` |

4. **Deploy**. Через 30 секунд получишь URL типа `https://tg-stars-app.vercel.app`.
5. Зайди по нему — должен открыться Welcome-экран Mini App.

---

## 5. @BotFather — привязка Mini App

Возвращаемся в [@BotFather](https://t.me/BotFather):

1. `/mybots` → выбери бота → **Bot Settings → Menu Button → Configure Menu Button**.
2. Пришли в чате URL фронта: `https://tg-stars-app.vercel.app` (из шага 4).
3. Придумай подпись кнопки, например `Subscribe`.
4. (опц.) `/newapp` → выбери бота → добавь название/описание/иконку и тот же URL — это даст тебе отдельную Mini App-ссылку `t.me/<твой_бот>/app`.

Готово: открываешь бота в Telegram, жмёшь синюю кнопку меню → открывается Mini App, оплата идёт Telegram Stars.

---

## 6. Проверить что всё работает

- В Telegram открой свой Mini App → **Welcome → Plans → Continue → Pay ★**. Stars списываются (можно купить/потратить в Telegram через **Buy Stars**).
- В `Profile` видишь активную подписку, каналы, историю платежей.
- У себя (как `ADMIN_IDS`) — в сайдбаре Mini App появится раздел **Admin** (Dashboard / Channels / Tariffs / Users / Payments).
- Та же админка доступна из браузера: `https://<твой-бекенд>/admin/`.

---

## 7. Дальнейшие настройки (по мере надобности)

- **Кастомный домен** → Railway: **Settings → Domains → Add Custom Domain**; Vercel: **Settings → Domains**. В обоих достаточно добавить CNAME-запись.
- **Webhook вместо polling** (стабильнее, экономит ресурсы): отключи `BOT_POLLING=1`, подключи webhook — см. раздел FAQ в `tg_bot_backend/README.md`.
- **Логи** → Railway: вкладка **Deploy → View Logs**; Vercel: **Deployments → View Function Logs**.
- **Секреты** → никогда не коммить `.env`. Всё хранится в Variables на Railway/Vercel.

---

## Troubleshooting

| Симптом                                          | Что проверить                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Фронт открывается, но плагины/планы не грузятся  | В Vercel: `VITE_API_BASE` указывает на Railway-домен **с https**              |
| `401 Unauthorized` в API                         | Telegram не передал `initData` (открыто не в Telegram-клиенте) — для теста используй веб-админку `/admin/` |
| CORS ошибка в консоли браузера                   | Она быть не должна (CORS `*`). Если появилась — проверь что бекенд вообще отвечает |
| Stars не начисляются                             | У @BotFather включён Payments → Stars? Пополнил баланс Stars в Telegram?      |
| БД сбросилась после редеплоя                     | Не подключён Postgres — см. шаг 3.5                                           |
