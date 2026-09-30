# Выкладка

Один VPS, Docker Compose. Версию выпускает workflow `Release` после merge release-PR.

## Что происходит при релизе

1. `release-please` создаёт тег и GitHub Release, обновляет `CHANGELOG.md`.
2. Собираются три образа и отправляются в GHCR: `web`, `gateway`, `engine`. Тег образа равен тегу релиза.
3. На сервер копируются `docker-compose.prod.yml`, `Caddyfile`, `deploy.sh`.
4. `deploy.sh` скачивает образы, применяет миграции, обновляет контейнеры и ждёт, пока они станут healthy.

## Требования к сервисам

Выкладка рассчитывает на следующее. Пока этого нет, релиз упадёт.

- `apps/web/Dockerfile`, `apps/gateway/Dockerfile`, `services/engine/Dockerfile`. Контекст сборки — корень репозитория.
- В каждом Dockerfile есть `HEALTHCHECK`.
- web отдаёт статику на порту 80. gateway слушает 3000, engine — 8080.
- gateway и engine отвечают на `GET /healthz`.
- Образ engine запускает миграции командой `migrate`. Образ gateway — командой `node dist/migrate.js`.
- Caddy направляет `/api/*` и `/ws` в gateway, остальное в web.

## Разовая настройка сервера

1. Установить Docker с плагином Compose.
2. Создать пользователя для выкладки и добавить его в группу `docker`. Не использовать root.
3. Создать каталог `/opt/roflomarket`, владелец — пользователь выкладки.
4. Положить в `/opt/roflomarket/.env` значения по образцу `.env.example`.
5. Направить DNS-запись домена на сервер, открыть порты 80 и 443. Сертификат Caddy получит сам.
6. Если пакеты GHCR приватные: выполнить на сервере `docker login ghcr.io` с токеном, у которого есть право `read:packages`.

## Разовая настройка GitHub

Settings → Environments → `production`, секреты:

| Секрет | Значение |
| --- | --- |
| `DEPLOY_HOST` | адрес сервера |
| `DEPLOY_USER` | пользователь выкладки |
| `DEPLOY_SSH_KEY` | приватный ключ ed25519, созданный только для выкладки |
| `DEPLOY_KNOWN_HOSTS` | вывод `ssh-keyscan -t ed25519 <адрес сервера>` |

Settings → Actions → General: включить «Allow GitHub Actions to create and approve pull requests». Без этого release-please не сможет открыть release-PR.

Settings → Branches, правило для `main`:

- требовать pull request и одно одобрение;
- требовать проверки `ci-ok` и `conventional`;
- разрешить только squash merge (Settings → General → Pull Requests).

## Ограничения

- Один сервер — единая точка отказа.
- `docker compose up` пересоздаёт контейнеры без гарантии нулевого простоя. Разрыв сглаживают две реплики и повторные попытки в Caddy.
- Резервных копий пока нет. Нужен `pg_dump` по расписанию во внешнее хранилище.
