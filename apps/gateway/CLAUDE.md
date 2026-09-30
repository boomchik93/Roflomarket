# gateway

API для клиента. Node.js, Fastify, TypeScript (strict), Drizzle, схема Postgres `gateway`.

Отвечает за: auth и сессии, профили, CRUD рынков (описание, категории, статус публикации), комментарии, WebSocket-рассылку событий.

Не отвечает за: балансы, сделки, цены, расчёт рынков. Это engine.

## Правила

- В схему `engine` не пиши и не читай. Баланс, цену, позицию получай через RPC из `packages/contracts`.
- Запрос на сделку передавай в engine вместе с idempotency key от клиента. Свой ключ не генерируй: повтор запроса клиентом должен дать тот же результат.
- Входные данные проверяй на границе: схема на каждый route. Внутрь сервиса идут уже типизированные значения.
- Денежные значения в JSON отдавай строкой.
- Сервис stateless. Состояние сессии и подписок не храни в памяти процесса так, чтобы вторая реплика его не видела.
- Обязательный endpoint `GET /healthz`. По SIGTERM перестань принимать новые запросы и заверши текущие.
- Миграции обратно совместимые. Используй skill `add-migration`.

## Команды

Из корня репозитория:

```bash
npm run dev -w apps/gateway
npm run lint -w apps/gateway
npm run typecheck -w apps/gateway
npm test -w apps/gateway
npm run build -w apps/gateway
```

Интеграционным тестам нужен Postgres: `docker compose -f infra/docker-compose.yml up -d`.
