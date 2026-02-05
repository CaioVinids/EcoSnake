#!/bin/bash

# Caminho para o diretório do repositório (padrão: diretório atual)
REPO_DIR="${1:-.}"

# Procura e remove todos os arquivos com sufixo ":Zone.Identifier"
find "$REPO_DIR" -type f -name '*:Zone.Identifier' -exec rm -f {} \;

echo "Arquivos ':Zone.Identifier' removidos com sucesso em '$REPO_DIR'."

