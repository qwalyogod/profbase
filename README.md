# Веб-портал «ПрофБаза»

ПрофБаза — учебный веб-портал для информационной поддержки молодых специалистов в Республике Беларусь. Проект объединяет новости, базу знаний, правовые материалы, центр инцидентов, личный кабинет педагога, организационные документы и административные сценарии.

## Стек

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, lucide-react.
- Backend: PHP API в папке `api` (PDO + prepared statements, проверка токена и ролей на сервере).
- База данных: MySQL/MariaDB (`profbaza_api`) — **основной источник данных портала**.
- `localStorage` хранит только токен авторизации (`api_token`), id выбранного демо-пользователя
  (`profbaza.demo-user-id`) и временные UI-настройки. **Доменные данные в localStorage больше не хранятся.**

## Быстрый запуск

Установить зависимости:

```bash
npm i
```

Запустить только frontend:

```bash
npm run dev
```

Запустить XAMPP Apache, MySQL и frontend одной командой:

```bash
npm run dev:all
```

После запуска frontend обычно доступен по адресу `http://127.0.0.1:5173/`.

## Backend и схема БД

База `profbaza_api` поднимается из миграций в `api/migrations`. Порядок применения (MySQL должен быть запущен):

```bash
MYSQL=/Applications/XAMPP/xamppfiles/bin/mysql
PHP=/Applications/XAMPP/xamppfiles/bin/php

# 1. базовые таблицы auth (roles, users, social_accounts) — если БД ещё нет
$PHP api/setup_schema.php

# 2. полная реляционная схема портала (organizations, news, documents, …)
$MYSQL -u root profbaza_api < api/migrations/002_full_portal_schema.sql

# 3. демо-данные. Любой из двух способов:
$PHP  api/migrations/import_seed.php                          # из seed_data.json (идемпотентно)
# или
$MYSQL -u root profbaza_api < api/migrations/003_seed_demo_data.sql
```

`002_full_portal_schema.sql` расширяет таблицу `users` (добавляет `public_id`, `site_role`, `is_banned`)
не ломая существующую авторизацию, и создаёт ~30 нормализованных таблиц со связями, индексами и
`created_at`/`updated_at`. `003_seed_demo_data.sql` — это дамп демо-набора (6 пользователей, 2 организации,
78 новостей, документы, инциденты, уведомления), сгенерированный из исходных TS-seed через
`node api/migrations/export_seed.mjs` + `php api/migrations/import_seed.php`. Демо-пользователи входят по
email и паролю `password`.

## Тестовые пользователи

Пароль для базовых demo-аккаунтов: `password`.

| Роль | Email |
| --- | --- |
| Суперадминистратор | `admin@profbaza.by` |
| Редактор | `editor@profbaza.by` |
| Администратор организации | `petrova@school12.minsk.edu.by` |
| Учитель | `ivanova@school12.minsk.edu.by` |
| Пользователь | `belov@example.by` |

Также в шапке есть кнопка тестового переключения ролей. Она нужна для быстрой проверки интерфейсов в учебном режиме.

## Структура проекта

- `src/app/routes.tsx` — маршруты приложения.
- `src/app/pages` — страницы портала.
- `src/app/pages/ped` — педагогический кабинет.
- `src/app/components/layout` — шапка, боковая навигация и футер.
- `src/app/state/PortalContext.tsx` — состояние портала: загружает данные из backend и вызывает API при изменениях (тот же публичный интерфейс, что и раньше).
- `src/app/api` — frontend API-слой (`client.ts` + `portalApi`, `authApi`, `usersApi`, `organizationsApi`, `documentsApi`, `newsApi`, `notificationsApi`, `incidentsApi`, `supportApi`, `cabinetApi`, `adminApi`). Компоненты не вызывают `fetch` напрямую.
- `src/app/lib/useUserState.ts` — персональный кабинет, теперь сохраняется в backend (`/api/cabinet`).
- `src/app/data/*Seed.ts` — исходные seed-данные. Используются только для генерации SQL-сидов и как значения по умолчанию для пустого кабинета; **как основная БД фронтендом не импортируются**.
- `src/app/types/portal.ts` — основные типы данных (форма, которую отдаёт `GET /api/portal/state.php`).

### Backend API (`api/`)

- `api/portal/state.php` — `GET`: собирает весь `PortalDatabase` из MySQL (для гостей — публичный каталог, для авторизованных — их данные с учётом роли). Заменяет старый `loadDatabase()`.
- `api/lib/helpers.php` — общие функции: `requireAuth`, `requireRole`, `requireOrgAdmin`, `getCurrentUser`, `readJsonBody`, `validateRequiredFields`, `jsonResponse`.
- Модульные роутеры (`POST { action, ... }`, проверка роли на сервере): `api/users`, `api/organizations`, `api/documents`, `api/news`, `api/notifications`, `api/incidents`, `api/support`, `api/admin`, `api/cabinet`.
- `api/auth` — `login`, `register`, `logout`, `demo_login` (вход под демо-пользователем для переключателя ролей); `api/user` — `me`, `update_profile`, `update_password`, `upload_avatar`.

## Основные маршруты

- `/` — главная страница и быстрый поиск.
- `/sitemap` — карта сайта, роли и маршрут первого знакомства.
- `/news` — новости и предложение публикаций.
- `/knowledge` — база знаний.
- `/employment` — трудоустройство молодого специалиста в РБ.
- `/labor-code` — правовые документы и официальные источники РБ.
- `/incidents` — центр инцидентов, нужен вход.
- `/organization` — организация, нужен вход.
- `/ped` — кабинет педагога, нужен вход.
- `/site-admin` — админка сайта.
- `/editor-admin` — админка редактора.
- `/org-admin` — админка организации.

## Проверка перед сдачей

Минимальная техническая проверка:

```bash
npm run build
/Applications/XAMPP/xamppfiles/bin/php -l api/setup_schema.php
```

Ручные сценарии:

- гость не должен видеть персональные данные и закрытые действия;
- сохранение материалов доступно только после входа;
- редактор должен видеть редакторскую админку;
- суперадминистратор должен видеть админку сайта;
- новости, база знаний и правовые разделы должны ссылаться на источники Республики Беларусь;
- журнал должен использовать 10-балльную шкалу.

## Архитектура данных (после миграции на backend)

Источник истины — MySQL. Поток данных:

```
React-страницы → usePortal()/PortalContext → src/app/api/* → PHP endpoints (api/*) → MySQL
                         ▲                                                              │
                         └──────────────  GET /api/portal/state.php  ◀─────────────────┘
```

- **Чтение:** при старте и после каждого изменения контекст вызывает `GET /api/portal/state.php` и
  кладёт результат в state. После перезагрузки страницы или очистки `localStorage` данные не теряются —
  они приходят из БД.
- **Запись:** действия (`createOrganization`, `publishNews`, `reviewNewsSubmission`, `createNotification`,
  `reportIncident`/`createIncident`, `saveCabinetNote` и т.д.) вызывают соответствующий API-эндпоинт,
  который **проверяет авторизацию и роль на сервере**, пишет в MySQL через prepared statements и
  возвращает результат; затем контекст перечитывает состояние.
- **Роли на backend:** глобальный администратор управляет пользователями/организациями; редактор модерирует
  новости; администратор организации управляет своими документами, разделами и заявками; обычный пользователь
  работает только со своими персональными данными. Несанкционированные запросы получают `401`/`403`.

## Известные ограничения и дальнейшие улучшения

- Чтение каталога (новости, инциденты, организации, список пользователей для переключателя ролей) отдаётся
  целиком авторизованным пользователям, а фильтрация для отображения выполняется на клиенте — как и раньше.
  Приватные коллекции (обращения, заявки) уже скоупятся на сервере по роли. Следующий шаг — построчный
  скоупинг чтения для всех сущностей.
- **Изображения новостей** лежат файлами в папке фронтенда `public/news-images/` (Vite отдаёт их по `/news-images/...`, при сборке копируются в `dist/`). В БД (`news.cover_image_url`, таблица `news_gallery`) хранится только **путь** к файлу. Обложки назначаются в `api/migrations/import_seed.php` циклически по файлам в папке — чтобы добавить/заменить обложки, положите файлы в `public/news-images/` и перезапустите импорт сидов. Пути корне-относительные (`/news-images/...`) и работают в dev (5173); для сборки под Apache по `/profbase/` задайте `base` в `vite.config.ts`.
- Загрузка файлов документов/вложений хранит ссылки/`dataUrl`; полноценное файловое хранилище — отдельная задача.
- `api/migrations/import_seed.php` доступен по dev-ключу для удобного ресета демо-данных; в продакшене этот
  эндпоинт нужно отключить.
