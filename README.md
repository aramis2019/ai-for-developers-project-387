# Meetly — сервис записи на встречи

Meetly позволяет гостю выбрать тип встречи, найти свободный слот и записаться
к одному владельцу календаря. Регистрации и авторизации нет: гость работает
анонимно, а админская часть действует от имени заранее заданного владельца.

Это contract-first монорепозиторий:

- API-контракт — TypeSpec → OpenAPI 3.1;
- бэкенд — .NET 10, Clean Architecture, EF Core + PostgreSQL или InMemory;
- фронтенд — React 18, TypeScript, Mantine, TanStack Query, Vite;
- мок API — Prism из той же OpenAPI-спецификации.

## Возможности

**Для гостя:**

- список типов встреч;
- календарь свободных слотов на ближайшие 14 суток;
- запись с именем, e-mail и необязательным комментарием;
- подтверждение созданной встречи;
- корректная обработка гонки за слот (`409 SLOT_ALREADY_BOOKED`).

**Для владельца:**

- просмотр профиля и параметров расписания;
- создание типов событий;
- единый список предстоящих встреч всех типов.

## Ключевой инвариант

Никакие два бронирования не пересекаются по времени, даже если относятся к
разным типам событий. Интервал встречи — полуинтервал `[start, end)`.

- В PostgreSQL инвариант обеспечивает generated-колонка `during tstzrange` и
  constraint `EXCLUDE USING gist (during WITH &&)`.
- В InMemory-репозитории проверка и вставка выполняются под одним `lock`.
- При конфликте API возвращает `409 SLOT_ALREADY_BOOKED`.

Подробнее: [ADR 0001](contracts/docs/adr/0001-cross-event-type-busy.md).

## Структура

```text
contracts/                          источник истины API
  main.tsp
  spec/                             errors, models, admin, public
  dist/openapi.yaml                 generated, коммитится
  docs/domain.md                    доменная модель и инварианты
  docs/scenarios.md                 пользовательские сценарии и критерии
  docs/adr/                         архитектурные решения

backend/                            .NET 10, Clean Architecture
  src/Meetly.Api                    HTTP endpoints, DTO mapping, errors
  src/Meetly.Application            use cases и интерфейсы репозиториев
  src/Meetly.Domain                 сущности, SlotGrid, SlotRules
  src/Meetly.Infrastructure         InMemory и EF Core/PostgreSQL
  src/Meetly.Contracts              generated DTO из OpenAPI
  tests/Meetly.UnitTests
  tests/Meetly.IntegrationTests
  tests/Meetly.ContractTests

frontend/                           React + TypeScript + Mantine + Vite
  src/api/schema.d.ts               generated типы из OpenAPI
  src/api/client.ts                 типизированный openapi-fetch client
  src/api/queries.ts                TanStack Query hooks
  src/api/errors.ts                 ветвление по ErrorBody.code
  src/lib/datetime.ts               UTC → локальное время
  src/pages/                        публичные и административные страницы
```

Направление зависимостей бэкенда:

```text
Meetly.Api -> Meetly.Application -> Meetly.Domain
Meetly.Infrastructure -> Meetly.Application
Meetly.Contracts — листовой проект без доменных зависимостей
```

## Предварительные требования

- Node.js 22+
- npm
- .NET SDK 10
- PostgreSQL — опционально; без него API работает на InMemory

## Установка

Из корня репозитория:

```bash
npm install
dotnet tool restore --tool-manifest backend/dotnet-tools.json
```

## Быстрый старт на мок-сервере

Основной режим для разработки фронтенда без бэкенда:

```bash
npm run dev:mock -w @meetly/frontend
```

Команда поднимает Prism на `http://127.0.0.1:4010` и Vite на
`http://localhost:5173`.

Примеры ответов берутся из `@opExample` в TypeSpec. Ветки ошибок можно выбрать
заголовком Prism `Prefer`, например:

```bash
curl -X POST http://127.0.0.1:4010/api/bookings \
  -H "Content-Type: application/json" \
  -H "Prefer: code=409" \
  -d '{"eventTypeId":"intro-call","start":"2026-08-17T09:30:00Z","guest":{"name":"Igor","email":"i@example.com"}}'
```

## Запуск с реальным бэкендом

### InMemory

InMemory — безопасный дефолт из `appsettings.json`; PostgreSQL не требуется.

```bash
dotnet run --project backend/src/Meetly.Api --no-launch-profile --urls http://localhost:5000
```

Создайте `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Затем запустите фронтенд:

```bash
npm run dev:frontend
```

### PostgreSQL

1. Создайте базу `meetly`.
2. Создайте локальный файл
   `backend/src/Meetly.Api/appsettings.Development.local.json`:

```json
{
  "ConnectionStrings": {
    "Meetly": "Host=localhost;Port=5432;Database=meetly;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

Файл исключён из Git паттерном `backend/**/appsettings.*.local.json`.

3. Запустите API:

```bash
dotnet run --project backend/src/Meetly.Api
```

Launch profile использует окружение `Development`, где
`Storage:Provider=Postgres`. При старте API автоматически применяет EF Core
миграции и добавляет три типа событий через `DevDataSeeder`.

4. Укажите `VITE_API_URL=http://localhost:5000` во `frontend/.env.local` и
   выполните `npm run dev:frontend`.

CORS разрешён для `http://localhost:5173`.

## Запуск locally

Три способа, от самого простого к полному соответствию прод-стека:

### 1. Мок-сервер + Vite (быстрое написание UI)
```bash
npm run dev:mock -w @meetly/frontend
```
Vite слушает `http://localhost:5173`, Prism — `http://127.0.0.1:4010`. API отдаёт спецификацию из контракта, бэкенда не требуется. Открывать `http://localhost:5173`.

### 2. Фронтенд + InMemory-хранилище (без Postgres)
```bash
# Терминал 1
dotnet run --project backend/src/Meetly.Api \
  --no-launch-profile --urls http://localhost:5000

# Терминал 2
npm run dev:frontend
```
`frontend/.env.local` должен содержать `VITE_API_URL=http://localhost:5000`. Хранилище InMemory из `appsettings.json`; миграции и сейдер не применяются.

### 3. Прод-образ целиком (Docker, как на VPS)
```bash
docker build -t meetly:local .
docker run --rm -e PORT=8080 -p 8080:8080 meetly:local
```
Открывать `http://localhost:8080`. Один контейнер раздаёт и фронт, и API, хранилище InMemory (данные живут до остановки контейнера), сидер кладёт 3 демо-типа встреч. Это локальная копия `meetly.linnetlab.com`.

## Страницы

| Маршрут | Назначение |
| --- | --- |
| `/` | Публичный список типов встреч |
| `/book/:eventTypeId` | Календарь, выбор слота, форма гостя |
| `/book/:eventTypeId/done` | Подтверждение записи |
| `/admin/bookings` | Предстоящие встречи всех типов |
| `/admin/event-types` | Типы событий и создание нового типа |

Фронтенд не пересчитывает границы календаря и `start` слота самостоятельно:
используются значения, полученные от API. Ошибки различаются по
`ErrorBody.code`, а не по тексту сообщения или только по HTTP-статусу.

## API

```text
GET  /api/event-types
GET  /api/event-types/{eventTypeId}/slots
POST /api/bookings

GET  /api/admin/profile
GET  /api/admin/event-types
POST /api/admin/event-types
GET  /api/admin/bookings
```

Все ошибки имеют форму:

```json
{
  "code": "SLOT_ALREADY_BOOKED",
  "message": "Это время уже занято другой встречей.",
  "details": {}
}
```

Разделение `409`, `422`, `404` и `400` описано в
[ADR 0002](contracts/docs/adr/0002-error-status-codes.md).

## Команды

### Контракт

```bash
npm run contract:build       # TypeSpec -> OpenAPI
npm run contract:lint        # TypeSpec + Redocly lint
npm run contract:check       # сборка + проверка свежести openapi.yaml
npm run api:types            # OpenAPI -> frontend schema.d.ts
npm run contracts:csharp     # OpenAPI -> C# DTO
npm run mock                 # Prism :4010
npm run docs                 # Redoc :8080
```

### Бэкенд

```bash
npm run build:backend
npm run test:backend

# EF Core — запускать из backend/
dotnet dotnet-ef migrations add <Name> \
  --project src/Meetly.Infrastructure \
  --startup-project src/Meetly.Api
dotnet dotnet-ef database update \
  --project src/Meetly.Infrastructure \
  --startup-project src/Meetly.Api
```

Тестовые проекты:

- `Meetly.UnitTests` — интервалы, сетка и доменные правила;
- `Meetly.IntegrationTests` — HTTP user journeys на изолированном InMemory;
- `Meetly.ContractTests` — соответствие маршрутов OpenAPI-спецификации.

Пользовательские сценарии и связь с тестами:
[contracts/docs/scenarios.md](contracts/docs/scenarios.md).

### Фронтенд

```bash
npm run dev:frontend
npm run typecheck -w @meetly/frontend
npm run build:frontend
npm run lint -w @meetly/frontend
```

## CI

Проверки выполняются параллельно в **GitHub Actions** и **Jenkins**.

### GitHub Actions

Workflow `.github/workflows/ci.yml` запускается на каждый push и pull request:

| Job | Проверки |
| --- | --- |
| contract | TypeSpec/Redocly lint, свежесть openapi.yaml и schema.d.ts |
| typecheck | `tsc --noEmit` фронтенда |
| backend | Release build + тесты (unit, integration, contract) |
| docker | сборка образа (без push — push в Nexus делает Jenkins) |

### Jenkins

Multibranch job
[`hexlet/Hexlet.Meetly`](https://jenkins.lurax.ru/job/hexlet/job/Hexlet.Meetly/),
pipeline в `infrastructure/jenkins/meetly-quick-linux.jenkinsfile`.
Стадии на каждый push (webhook из GitHub):

| Стадия | Проверки |
| --- | --- |
| Contract gates | TypeSpec/Redocly lint, свежесть openapi.yaml и schema.d.ts |
| C# DTO freshness | nswag-перегенерация + `git diff` по `Generated/` |
| Typecheck | `tsc --noEmit` фронтенда |
| Backend tests | Release build + 58 unit/integration/contract тестов |
| Docker image | multi-stage сборка `linnetlab/meetly` |
| Smoke + Schemathesis | старт контейнера, curl, фаззинг всех операций против спеки |
| Contract classification | oasdiff-репорт изменений контракта с прошлого релиза |
| Push to Nexus | только `main`: образ `:BUILD-sha` и `:latest` в docker.lurax.ru |
| Deploy to VPS | только `main`: автодеплой на meetly.linnetlab.com |

Schemathesis проверяет **собранный образ** (InMemory-хранилище) и блокирует
пайплайн при дрейфе реализации от OpenAPI. Jenkins — единственный путь
в Nexus и на VPS.

### Прод-стек

`infrastructure/deploy/docker-compose.yml` — канонический источник, рабочая
копия лежит на VPS в `/home/development/meetly/` рядом с `.env`.

В compose один сервис — приложение за общим Traefik. База данных вне
compose: это **хостовый PostgreSQL 18**, тот же кластер обслуживает
iplocator. Контейнер ходит в него через `host.docker.internal`
(алиас даёт `extra_hosts: host-gateway`, на Linux он не появляется сам).

Роль и базу заводит идемпотентный `infrastructure/deploy/provision-db.sh` —
запускается на сервере один раз перед первым деплоем и повторно после
смены пароля в `.env`. Схему таблиц скрипт не создаёт: миграции применяет
само приложение при старте.

Из этого следует порядок при поднятии стека с нуля: сначала провижининг
базы, потом деплой. Если Postgres недоступен в момент старта, приложение
падает на инициализации, а `restart: unless-stopped` повторяет попытку.

## Изменение контракта

API меняется только в `contracts/main.tsp` и `contracts/spec/*.tsp`:

```text
1. Изменить TypeSpec и при необходимости domain.md / ADR / scenarios.md
2. npm run contract:build && npm run contract:lint
3. npm run api:types && npm run contracts:csharp
4. Обновить реализацию и тесты
```

Сгенерированные файлы коммитятся, но руками не редактируются:

| Файл | Генератор |
| --- | --- |
| `contracts/dist/openapi.yaml` | `npm run contract:build` |
| `frontend/src/api/schema.d.ts` | `npm run api:types` |
| `backend/src/Meetly.Contracts/Generated/` | `npm run contracts:csharp` |

## Коммиты и релизы

Коммиты оформляются по Conventional Commits:

```text
feat(backend): добавить новый сценарий бронирования
fix(frontend): обработать конфликт занятого слота
docs(contracts): уточнить пользовательские сценарии
ci: усилить проверки Schemathesis
```

`release-please` анализирует коммиты после каждого пуша в `main` и создаёт
или обновляет release PR с `CHANGELOG.md` и новой версией корневого
`package.json`. Мёрдж release PR создаёт тег `vX.Y.Z` и GitHub Release.
Локально для релиза запускать нечего.

Подробные правила: [AGENTS.md](AGENTS.md#conventional-commits).

## Перед коммитом

```bash
npm run contract:lint
npm run contract:check
npm run typecheck -w @meetly/frontend
npm run test:backend
```
