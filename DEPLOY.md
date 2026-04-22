# Деплой: Render (бекенд) + Firebase Hosting (фронт)

Полностью бесплатно. Минимум кликов.

## Что будем делать

1. Залить оба проекта на GitHub.
2. У @BotFather получить токен + включить Telegram Stars.
3. Бекенд → **Render** (нажимаешь deploy, сам развернёт Docker из нашего `render.yaml`).
4. Фронт → **Firebase Hosting** (одна команда `firebase deploy`).
5. В BotFather указать Mini App URL.

Поехали.

---

## 0. Что тебе надо поставить локально

- [Node.js 20+](https://nodejs.org) и npm
- [Git](https://git-scm.com)
- Аккаунты: GitHub, Render (через GitHub), Google (для Firebase)

---

## 1. GitHub репозитории

Распакуй оба архива:

```bash
unzip -o tg_bot_backend.zip -d tg_bot_backend
unzip -o tg_stars_app.zip   -d tg_stars_app
```

Создай **два пустых репозитория** на https://github.com/new (например `tg-stars-backend` и `tg-stars-app`), потом:

```bash
# бекенд
cd tg_bot_backend
git init -b main && git add . && git commit -m "init backend"
git remote add origin https://github.com/<твой_ник>/tg-stars-backend.git
git push -u origin main
cd ..

# фронт
cd tg_stars_app
git init -b main && git add . && git commit -m "init frontend"
git remote add origin https://github.com/<твой_ник>/tg-stars-app.git
git push -u origin main
cd ..
```

---

## 2. @BotFather — бот и Stars

В Telegram: [@BotFather](https://t.me/BotFather)

1. `/newbot` → имя и username → сохраняешь **BOT_TOKEN** вида `1234:AAA...`.
2. `/mybots` → выбрать бота → **Payments → Connect Telegram Stars** (без API-ключей, официально).
3. Узнать свой Telegram user_id — напиши [@userinfobot](https://t.me/userinfobot). Это `ADMIN_IDS`.

Mini App URL добавим в шаге 5.

---

## 3. Бекенд на Render

1. Зайди на https://dashboard.render.com → **New +** → **Blueprint**.
2. Подключи GitHub → выбери репозиторий `tg-stars-backend`. Render автоматом найдёт `render.yaml` и предложит создать сервис — жми **Apply**.
3. В созданном сервисе → **Environment** → заполни переменные, которые помечены `sync: false`:

   | Ключ                   | Значение                                                        |
   | ---------------------- | --------------------------------------------------------------- |
   | `BOT_TOKEN`            | токен из BotFather                                              |
   | `ADMIN_IDS`            | твой Telegram id (напр. `123456789`)                            |
   | `ADMIN_PANEL_PASSWORD` | длинный пароль для веб-админки `/admin/`                        |
   | `PUBLIC_URL`           | `https://<имя-сервиса>.onrender.com` (см. URL сверху страницы)  |

   `JWT_SECRET` и `WEBHOOK_SECRET` сгенерируются сами.

4. Нажми **Manual Deploy → Deploy latest commit**. Первый билд ~3-5 минут.
5. Проверь:
   - `https://<твой-сервис>.onrender.com/api/health` → `{"status":"ok"}`
   - `https://<твой-сервис>.onrender.com/admin/` → веб-админка (логин/пароль из Environment)
   - `https://<твой-сервис>.onrender.com/docs` → Swagger со всеми API

На старте бекенд сам вызовет `setWebhook` и Telegram начнёт слать апдейты на `/tg/webhook/<WEBHOOK_SECRET>`.

### Важно про free-tier Render
- Сервис **засыпает после 15 минут без запросов**. Первый запрос после сна идёт ~30 секунд. Telegram-вебхук разбудит — не критично.
- **SQLite данные стираются при каждом редеплое** (free-тариф не даёт диск). Вариантов два:
  - На старте — ок, тарифы пересоздадутся из seed.
  - Для настоящей работы подключи бесплатный Postgres от **Neon** (neon.tech) или **Supabase** — создай проект, скопируй connection string вида `postgresql://user:pass@host/db`, в Render → Environment замени `DATABASE_URL` на `postgresql+asyncpg://user:pass@host/db` (да, `+asyncpg`), редеплой.

---

## 4. Фронт на Firebase Hosting

1. Зайди на https://console.firebase.google.com → **Add project** → придумай имя (например `tg-stars-app`) → **Continue → Create**. Analytics можно выключить.
2. После создания в адресной строке будет `console.firebase.google.com/project/<PROJECT_ID>` — скопируй `<PROJECT_ID>`.
3. У себя в терминале:

   ```bash
   cd tg_stars_app
   npm install
   npm install -g firebase-tools
   firebase login                          # откроет браузер, авторизуйся

   # подставь свой проект
   sed -i 's/REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID/<PROJECT_ID>/' .firebaserc

   # URL бекенда из шага 3
   echo "VITE_API_BASE=https://<твой-сервис>.onrender.com" > .env.production
   npm run build
   firebase deploy --only hosting
   ```

4. В конце получишь URL вида `https://<PROJECT_ID>.web.app` — это и есть URL твоей Mini App.

---

## 5. @BotFather — привязать Mini App

Возвращаемся к [@BotFather](https://t.me/BotFather):

1. `/mybots` → выбери бота → **Bot Settings → Menu Button → Configure Menu Button**.
2. Вставь URL: `https://<PROJECT_ID>.web.app`.
3. Придумай подпись кнопки, например `Subscribe`.
4. (опц.) `/newapp` → добавь название/описание/иконку и тот же URL — получишь отдельную ссылку `t.me/<твой_бот>/app`.

---

## 6. Проверка

- Открой бота в Telegram → нажми синюю кнопку меню → открывается Mini App → Welcome → Plans → Continue → оплата Telegram Stars.
- В `Profile` появится активная подписка и история платежей.
- У тебя (как `ADMIN_IDS`) в сайдбаре Mini App появится раздел **Admin** (Dashboard / Channels / Tariffs / Users / Payments).
- Та же админка в браузере: `https://<твой-сервис>.onrender.com/admin/`.

---

## FAQ / Troubleshooting

| Симптом                                              | Что проверить                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Mini App открылся, но планы не грузятся              | В `.env.production` проверь `VITE_API_BASE` = URL Render. После правки — `npm run build && firebase deploy --only hosting` |
| Бот не отвечает на `/start`                           | В Render Environment заполнены ли `BOT_TOKEN`, `PUBLIC_URL` (именно `https://`), `WEBHOOK_SECRET`? После их смены — Redeploy. Проверь `https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo` — должен быть `url` на Render |
| `401 Unauthorized` в браузере                         | initData ставит Telegram сам — если открываешь фронт не из Telegram, авторизация не пройдёт. Пользуйся веб-админкой `/admin/` вместо Mini App UI |
| Данные пропадают после редеплоя Render                | Free-диска нет → SQLite стирается. Подключи бесплатный Postgres от Neon/Supabase (см. шаг 3, «Важно») |
| Сервис долго отвечает первый раз                     | Free-tier Render засыпает через 15 мин. Первый запрос разбудит его за ~30 сек. Это нормально |

---

## Команды-шпаргалки

```bash
# Обновить фронт
cd tg_stars_app
git add . && git commit -m "update" && git push
npm run build && firebase deploy --only hosting

# Обновить бекенд
cd tg_bot_backend
git add . && git commit -m "update" && git push
# Render сам подтянет и задеплоит (autoDeploy: true)

# Посмотреть логи бекенда
# в Render дашборде → сервис → Logs

# Проверить вебхук
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```
