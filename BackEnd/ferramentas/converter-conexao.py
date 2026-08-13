"""Converte a DATABASE_URL do formato postgres:// para o formato de connection string do Npgsql."""

import os
import sys
from urllib.parse import unquote, urlparse

caminho_env = sys.argv[1] if len(sys.argv) > 1 else ".env"
valores = {}

with open(caminho_env, "r", encoding="utf-8") as arquivo:
    for linha in arquivo:
        linha = linha.strip()

        if not linha or linha.startswith("#") or "=" not in linha:
            continue

        chave, valor = linha.split("=", 1)
        valores[chave.strip()] = valor.strip().strip('"').strip("'")

url = valores.get("DATABASE_URL") or valores.get("POSTGRES_URL")

if not url:
    sys.exit("DATABASE_URL nao encontrada no arquivo informado.")

partes = urlparse(url)
host = partes.hostname or ""
porta = partes.port or 5432
banco = (partes.path or "/postgres").lstrip("/")
usuario = unquote(partes.username or "")
senha = unquote(partes.password or "")

conexao = (
    f"Host={host};Port={porta};Database={banco};Username={usuario};Password={senha};"
    "SSL Mode=Require;Trust Server Certificate=true;Pooling=true"
)

sys.stdout.write(conexao)
