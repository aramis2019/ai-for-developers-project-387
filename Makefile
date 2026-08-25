# Makefile — единые короткие имена для того, что в проекте уже есть.
#
# Здесь намеренно нет собственной логики: каждая цель делегирует существующим
# npm-скриптам. Источник истины — package.json воркспейсов, а не этот файл.
# Если команда меняется, правится скрипт, а не цель здесь.
#
# Требует make в PATH. Всё остальное ставится через `npm install`
# и `dotnet tool restore --tool-manifest backend/dotnet-tools.json`.

.DEFAULT_GOAL := help
.PHONY: help test lint dev

help:
	@echo Available targets:
	@echo   make test  - backend tests: dotnet test backend/Meetly.slnx
	@echo   make lint  - contract lint, frontend typecheck and eslint
	@echo   make dev   - Prism mock :4010 + Vite :5173

# Тесты в проекте только на бэкенде: Meetly.UnitTests, Meetly.IntegrationTests,
# Meetly.ContractTests. У фронтенда тестовых файлов нет — его проверяет lint.
test:
	npm run test:backend

# Порядок соответствует разделу «Перед коммитом» в AGENTS.md:
# сначала контракт как источник истины, затем потребитель-фронтенд.
#
# `npm run lint -w @meetly/frontend` сюда намеренно не входит: скрипт объявлен,
# но eslint не установлен и конфига в репозитории нет — команда падает всегда.
# Появится eslint — строку можно вернуть.
lint:
	npm run contract:lint
	npm run typecheck -w @meetly/frontend

# Основной режим разработки: мок-сервер из контракта плюс Vite, бэкенд не нужен.
# Открывать http://localhost:5173 — Vite слушает IPv6, на 127.0.0.1 будет отказ.
dev:
	npm run dev:mock -w @meetly/frontend
