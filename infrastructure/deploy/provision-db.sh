#!/bin/sh
# Провижининг роли и базы Meetly в хостовом PostgreSQL.
#
# Запускать на VPS от пользователя с правом sudo (peer-аутентификация под
# postgres). Скрипт идемпотентен: повторный запуск безопасен и приводит
# состояние кластера в соответствие с .env.
#
#   ssh vps-5-129-226-164
#   sh /home/development/meetly/provision-db.sh
#
# Схему таблиц скрипт не создаёт — её разворачивает само приложение
# при старте (InitializeMeetlyAsync -> MigrateAsync). Расширения Postgres
# не нужны: exclusion constraint по одиночной колонке tstzrange работает
# с gist из коробки, btree_gist не требуется.
#
# Пароль берётся из .env и никуда не печатается.

set -eu

ENV_FILE="${1:-/home/development/meetly/.env}"
DB_NAME=meetly
DB_USER=meetly

if [ ! -f "$ENV_FILE" ]; then
    echo "Не найден файл окружения: $ENV_FILE" >&2
    exit 1
fi

# Читаем только нужный ключ, не подтягивая в окружение всё подряд.
DB_PASSWORD="$(grep -E '^MEETLY_DB_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d= -f2-)"

if [ -z "$DB_PASSWORD" ]; then
    echo "В $ENV_FILE нет непустого MEETLY_DB_PASSWORD" >&2
    exit 1
fi

psql_super() {
    sudo -u postgres psql --no-psqlrc --quiet "$@"
}

# Пароль уходит в psql через stdin, а не аргументом командной строки:
# аргументы видны в ps любому пользователю системы, stdin — нет.
# Одинарные кавычки внутри пароля удваиваются по правилам SQL.
escaped_password="$(printf '%s' "$DB_PASSWORD" | sed "s/'/''/g")"

# Роль. CREATE ROLE IF NOT EXISTS в PostgreSQL нет, поэтому проверяем сами.
# Пароль задаётся при каждом запуске — так кластер и .env не разъезжаются.
if [ "$(psql_super -Atc "select 1 from pg_roles where rolname = '$DB_USER'")" = "1" ]; then
    echo "Роль $DB_USER уже есть — обновляю пароль"
    action=ALTER
else
    echo "Создаю роль $DB_USER"
    action=CREATE
fi

psql_super >/dev/null <<SQL
$action ROLE $DB_USER LOGIN PASSWORD '$escaped_password';
SQL

# База. CREATE DATABASE нельзя выполнить внутри транзакции или DO-блока.
if [ "$(psql_super -Atc "select 1 from pg_database where datname = '$DB_NAME'")" = "1" ]; then
    echo "База $DB_NAME уже есть — пропускаю создание"
else
    echo "Создаю базу $DB_NAME (владелец $DB_USER)"
    psql_super -c "CREATE DATABASE $DB_NAME OWNER $DB_USER" >/dev/null
fi

# Приложение создаёт таблицы миграциями, поэтому нужны права на схему public.
# В PostgreSQL 15+ public больше не даёт CREATE всем подряд — выдаём явно.
psql_super -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER" >/dev/null

echo
echo "Готово. Проверка:"
psql_super -Atc "select datname, pg_get_userbyid(datdba) from pg_database where datname = '$DB_NAME'"
