# Roflomarket

Шуточный рынок предсказаний на игровой валюте. Командный учебный проект: 5 человек, сдача в декабре 2026.

## Структура

- `apps/web` — интерфейс. React, Vite, TypeScript.
- `apps/gateway` — API для клиента. Node.js, Fastify, TypeScript. Auth, REST, WebSocket, профили, CRUD рынков, комментарии.
- `apps/engine` — ядро рынка. Go. Ledger, AMM, сделки, расчёт рынков.
- `packages/contracts` — protobuf-контракт gateway ↔ engine и сгенерированный код для TS и Go.
- `infra` — Docker Compose, Caddy, скрипт выкладки.
- `docs/spec.md` — правила рынка, формулы, инварианты. Читай перед любой задачей, которая касается денег или цен.
- `docs/adr/` — принятые архитектурные решения и причины.

В каждом сервисе лежит свой CLAUDE.md с командами и правилами этого сервиса.

## Границы сервисов

- Один Postgres, две схемы: `gateway` и `engine`. Сервис читает и пишет только свою схему. Данные другого сервиса получает только через RPC.
- В таблицы денег и сделок пишет только engine.
- Любое изменение взаимодействия gateway ↔ engine начинается с `.proto`. Используй skill `change-contract`.
- Задача в одном сервисе не даёт права править другой. Если нужна правка у соседа, скажи об этом и остановись на границе контракта.

## Деньги

- Суммы, цены и количество долей — целые числа в минимальных единицах. Никаких `float`.
- В Go это `int64`. В TypeScript это `bigint` или строка, не `number`.
- Формулы и правила округления — только из `docs/spec.md`. Не придумывай свои.

## Команды

Каждый JS-пакет обязан иметь скрипты `lint`, `typecheck`, `test`, `build`. Запуск из корня:

```bash
npm ci
npm run lint -w apps/web          # так же: typecheck, test, build; так же для apps/gateway
docker compose -f infra/docker-compose.yml up -d   # локальный Postgres
```

Go-сервис, из `apps/engine`:

```bash
go vet ./...
go test -race ./...
```

Перед тем как сказать «готово», запусти lint, typecheck и тесты затронутого сервиса. Если что-то не запускал, скажи это прямо.

## Git

- В `main` напрямую не коммить. Ветка на задачу, потом pull request.
- Merge только squash. Заголовок PR становится коммитом в `main`, поэтому он в формате Conventional Commits: `feat(engine): add market resolution`.
- Типы: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `revert`. Области: `web`, `gateway`, `engine`, `contracts`, `infra`.
- `CHANGELOG.md` и `version.txt` ведёт release-please. Руками не правь.
- Секреты и `.env` не коммить. Пример переменных — в `.env.example`.

## Агенты

- `reviewer` — ревью ветки перед PR.
- `test-writer` — тесты без правки рабочего кода.
- `figma-implementer` — вёрстка фрейма Figma со сверкой в браузере.
