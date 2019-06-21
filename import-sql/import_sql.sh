#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset
shopt -s nullglob

function exec_psql_file() {
    local file_name="$1"
    PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -v ON_ERROR_STOP="1" \
        --host="$POSTGRES_HOST" \
        --port="$POSTGRES_PORT" \
        --dbname="$POSTGRES_DB" \
        --username="$POSTGRES_USER" \
        -f "$file_name"
}

function import_sql_files() {
    local sql_file
    for sql_file in `ls "$SQL_DIR"/*.sql | sort -V`; do
        echo "Importing $sql_file"
        exec_psql_file "$sql_file"
    done
}

function main() {
    import_sql_files
}

main