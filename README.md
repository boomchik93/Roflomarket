# Roflomarket

Шуточный рынок предсказаний на игровой валюте. Командный проект курса «Разработка JS».

## Структура

| Путь | Что это |
| --- | --- |
| `apps/web` | Интерфейс: React, Vite, TypeScript |
| `apps/gateway` | API для клиента: Node.js, Fastify |
| `apps/engine` | Ядро рынка: Go |
| `packages/contracts` | Protobuf-контракт gateway ↔ engine |
| `infra` | Docker Compose, Caddy, выкладка |
| `docs` | Спецификация рынка и архитектурные решения |

Почему так — в [docs/adr/0001-architecture.md](docs/adr/0001-architecture.md). Правила рынка — в [docs/spec.md](docs/spec.md).

## Что нужно установить

- Node.js 24 и npm
- Go 1.27 (тем, кто работает с engine)
- Docker
- [buf](https://buf.build/docs/installation) (тем, кто меняет контракт)
- Claude Code

## Первый запуск Claude Code

1. Открой репозиторий в Claude Code и подтверди MCP-серверы проекта из `.mcp.json`.
2. Выполни `/mcp` и войди в Figma. Context7 и Playwright входа не требуют.
3. Правила проекта Claude читает из `CLAUDE.md` в корне и в каталоге сервиса.

Личные настройки клади в `.claude/settings.local.json`, он не попадает в git.

## Как работаем

1. Ветка на задачу. В `main` напрямую не коммитим.
2. Если задача меняет взаимодействие gateway и engine, сначала PR с контрактом.
3. Pull request. Заголовок в формате Conventional Commits: `feat(engine): add market resolution`.
4. Проверки CI зелёные, одно одобрение, squash merge.
5. Бот release-please держит открытый release-PR с changelog. Его merge выпускает версию и выкладывает её на сервер.

## Локальный Postgres

```bash
docker compose -f infra/docker-compose.yml up -d
```

Адрес: `postgres://roflo:roflo@localhost:5432/roflo`.

Настройка сервера и секретов для выкладки — в [infra/README.md](infra/README.md).
