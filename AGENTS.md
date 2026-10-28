# AGENTS.md · Repositório de assets do Design System Prestes

Guia para agentes (Claude, Codex e outros) e pessoas que forem atualizar este repositório. Leia inteiro antes de mexer.

- **Dono e mantenedor:** Rafael Casteli, Área de Marca · Prestes. Nenhuma mudança de marca entra sem ele.
- **O que é:** a cópia **pública** dos arquivos de marca (logos, grafismos, ícones, logos de produto e fachadas) que o conector MCP do Design System Prestes entrega às pessoas. O conector devolve links `raw.githubusercontent.com` daqui, porque o ambiente de código do Claude não consegue baixar do Worker.
- **Fonte da verdade:** `ds/assets` do conector (`C:\projetos\design-system-prestes-mcp`). Este repositório é um **espelho** daquela pasta. Nunca edite um asset só aqui.
- **Guia completo:** `AGENTS.md` do conector, seção **8.1 Atualizar assets: passo a passo**. O resumo abaixo basta para a parte deste repositório.

---

## Como o conector usa este repositório

1. O conector lê `versao-atual.txt` na branch `main` (cache de 5 minutos).
2. Monta o link `https://raw.githubusercontent.com/Rafael-Casteli/prestes-ds-assets/<versão>/assets/<Grupo>/...`.
3. `<versão>` é uma **tag** git. Sem a tag no GitHub, o link dá 404.

Por isso:
- Não renomeie nem mova arquivos sem uma versão maior (`2.0.0`): links antigos apontam para os caminhos atuais.
- Não apague tags: peças antigas dependem delas.
- A estrutura de `assets/` tem de ser idêntica à de `ds/assets` do conector.

---

## Versões

Formato `MAIOR.MENOR.CORREÇÃO`, sem prefixo `v`, **igual à versão do Design System** no conector (`ds/versao.json`).

| Mudança | Exemplo |
|---|---|
| Correção: arquivo trocado, cor ou recorte corrigido | `1.0.2 → 1.0.3` |
| Conteúdo novo: ícone, logo de produto, fachada | `1.0.3 → 1.1.0` |
| Quebra: arquivo renomeado ou removido | `1.1.0 → 2.0.0` |

---

## Atualizar assets (parte deste repositório)

Pré-requisito: o asset já foi incluído em `ds/assets` do conector, com `_LEIAME.md` atualizado, PNGs gerados pelo `preparar_ds.py` e `ds/versao.json` na versão nova (passos 1 a 5 da seção 8.1 do conector).

1. **Atualize o clone:** `git pull`
2. **Espelhe a pasta do conector** (inclui remoções):
   - PowerShell: `robocopy C:\projetos\design-system-prestes-mcp\ds\assets C:\projetos\prestes-ds-assets\assets /MIR`
   - Linux/WSL: `rsync -a --delete ../design-system-prestes-mcp/ds/assets/ assets/`
3. **Confira** com `git status` e `git diff --stat` que só mudou o esperado.
4. **Publique** com a mesma versão do conector:
   ```
   node scripts/publicar.mjs 1.0.3 "Ícone de bicicletário"
   ```
   O script grava `versao-atual.txt`, gera `manifest.json`, faz commit, cria a tag e envia `main` + tag.
5. **Se a tag não subir** (alguns ambientes de agente recusam enviar tags), crie a release no navegador: `https://github.com/Rafael-Casteli/prestes-ds-assets/releases/new`, tag = versão, target = `main`, *Publish release*.
6. **Verifique:**
   - `https://raw.githubusercontent.com/Rafael-Casteli/prestes-ds-assets/<versão>/versao-atual.txt` responde com a versão.
   - O link de um arquivo novo responde 200 e o arquivo abre.
   - No Claude, `prestes_asset` mostra `(assets <versão>)` e o link novo (em até 5 minutos).
7. **Avise** o Rafael para rodar `npm run deploy` no conector, se ainda não rodou.

### Voltar para uma versão anterior

```
node scripts/publicar.mjs --voltar 1.0.2
```

Só muda `versao-atual.txt`. Em até 5 minutos o conector volta a servir a versão escolhida.

---

## O que nunca entra aqui

Este repositório é público. Ficam de fora:
- A fonte **Lufga** (licença por máquina).
- O **brandbook em PDF**, books digitais e relatórios.
- Material de empreendimento que ainda não pode ser público (teaser, pré-lançamento): confirme com o Rafael.
- Tokens de acesso do conector, segredos ou qualquer arquivo de `_acessos/`.
- Regras, receitas, tokens de design e catálogo: ficam só no conector privado.

---

## Arquivos

| Arquivo | Para quê |
|---|---|
| `assets/` | espelho de `ds/assets` do conector |
| `versao-atual.txt` | versão que o conector serve |
| `manifest.json` | índice gerado por `scripts/gerar-manifest.mjs` (não edite à mão) |
| `scripts/publicar.mjs` | publica uma versão ou faz rollback |
| `scripts/gerar-manifest.mjs` | gera o `manifest.json` |
| `.github/` | banner e imagens do README (gerados a partir dos assets oficiais) |
| `README.md` | apresentação do repositório |
| `LICENSE` | direitos da marca Prestes e autoria do design system |
