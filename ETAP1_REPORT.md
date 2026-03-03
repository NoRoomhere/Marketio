# Этап 1 — Анализ проекта Marketio + отчёт

## Текущее состояние репозитория

### Структура файлов
```
Marketio/
├── index.html          # Лендинг (Signature Marketing)
├── login.html          # Вход
├── register.html       # Регистрация (бізнес / блогер)
├── dashboard.html      # Личный кабинет (огромная одна страница)
├── styles.css          # Стили лендинга
├── auth.css            # Стили auth-страниц
├── dashboard.css       # Стили дашборда
├── auth.js             # Регистрация/вход через Firebase Auth
├── dashboard.js        # Вся логика дашборда (~1600+ строк)
├── firebase-config.js  # Инициализация Firebase (только Auth)
├── FIREBASE_INTEGRATION.md
└── FIREBASE_SETUP.md
```

### Стек текущего проекта
| Компонент | Сейчас | По ТЗ промпта |
|-----------|--------|----------------|
| Фронтенд | Статический HTML + ванильный JS | Next.js 15+ App Router + TypeScript + Tailwind + shadcn/ui |
| Стили | CSS (styles.css, auth.css, dashboard.css) | Tailwind CSS + shadcn/ui |
| Бэкенд/БД | Firebase 8 (CDN), только Auth; данные в localStorage | Firebase 10+ (Auth + Firestore + Storage) |
| Локализация | Жёстко uk в разметке | next-intl (uk / ru / en) |
| Деплой | Не настроен | Netlify |

### Вывод
Проект — **не Next.js**: нет `package.json`, нет Node-зависимостей, нет TypeScript. Это многостраничный статический сайт с подключением Firebase через `<script>` (v8). Чтобы выполнить план из промпта (этапы 2–12), нужна **новая кодовая база на целевом стеке**. Существующие файлы не удаляем — оставляем как референс; параллельно добавляем Next.js-приложение.

---

## Найденные проблемы в текущем коде

1. **auth.js**
   - `API_CONFIG.baseURL: 'https://api.example.com'` — мёртвый код/плейсхолдер (используется только Firebase).
   - Firestore в регистрации закомментирован — тип и доп. данные пользователя не сохраняются в БД, только в localStorage (теряются при смене устройства/браузера).
   - Роль при входе берётся из `localStorage` (`userType_${uid}`), а не из Firestore — при первом входе с нового устройства роль будет потеряна.

2. **dashboard.js**
   - Оголошення, заявки, чаты, повідомлення хранятся только в **localStorage** — нет многопользовательской базы, нет realtime.
   - Нет лимитов и индексов Firestore — запросов к Firestore пока нет.
   - Очень большой монолитный файл (~1600 строк) — сложно поддерживать.

3. **firebase-config.js**
   - Инициализируется только `firebase.auth()`. Firestore и Storage не инициализированы (хотя Firestore подключается в HTML).
   - Используется namespace SDK (v8), а не modular (v10+).

4. **login.html / register.html**
   - Подключён Firestore SDK, но не используется (данные в localStorage).
   - Нет восстановления пароля («Забули пароль?» — заглушка).

5. **Безопасность**
   - В репозитории лежит `firebase-config.js` с открытым `apiKey` — для Firebase это допустимо (ключ ограничивается доменами в консоли), но для продакшена нужны Security Rules и при необходимости App Check.

6. **Нет package.json**
   - Нет зависимостей, нет скриптов сборки, нет линтеров/форматтеров — «исправление зависимостей» = добавление целевого стека (Next.js + пакеты).

---

## Что сделано в рамках Этапа 1

1. **Добавлено Next.js 15 приложение** (в корень проекта, без удаления существующих HTML/CSS/JS):
   - `package.json` — Next.js 15, React 19, TypeScript, Tailwind CSS, Firebase 10, next-intl, sonner и др.
   - `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
   - `app/layout.tsx`, `app/page.tsx` — минимальный стартовый экран (название: **ReachUA**).
   - `lib/firebase.ts` — инициализация Firebase 10 (modular): Auth, Firestore, Storage.
   - `.env.local.example` — шаблон переменных для Firebase.
   - `.gitignore` — игнор node_modules, .next, .env.local и т.д.

2. **Текущие HTML/JS файлы не удалялись и не перезаписывались** — они остаются для справки и возможной миграции контента/логики позже.

3. **Название продукта**: **Marketio** — используется в новом приложении (layout, главная).

---

## Рекомендации перед Этапом 2

- Скопировать `.env.local.example` в `.env.local` и подставить свои ключи из Firebase Console (текущий проект уже использует проект `marketio-56ec8`).
- Запустить: `npm install` затем `npm run dev` — должна открыться новая главная ReachUA на Next.js.
- Дальнейшие этапы (i18n, Auth, onboarding, Firestore, маркетплейс, заявки, чат, оплаты, дашборды, админка, полировка) делаем уже в Next.js-приложении.

---

**Этап 1 завершён.**

Дальше: Этап 2 — настройка i18n (next-intl) с uk/ru/en + middleware.

Готов к следующему этапу по твоей команде.
