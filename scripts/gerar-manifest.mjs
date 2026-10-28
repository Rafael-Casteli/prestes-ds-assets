// Gera manifest.json a partir da pasta assets/.
// Uso: node scripts/gerar-manifest.mjs
//
// Estrutura (a mesma de ds/assets no conector):
//   assets/<Grupo>/<arquivo>.svg|.png|.jpg   originais
//   assets/<Grupo>/png/<arquivo>.png          PNG gerado (+ <arquivo>_branco.png nos ícones)
//   assets/<Grupo>/_LEIAME.md                 regras de uso do grupo

import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const ASSETS = join(RAIZ, "assets");
const EXTENSOES = new Set(["svg", "png", "jpg", "jpeg"]);

function varrer(dir) {
  return readdirSync(dir).flatMap((nome) => {
    if (nome.startsWith(".")) return [];
    const p = join(dir, nome);
    return statSync(p).isDirectory() ? varrer(p) : [p];
  });
}

const grupos = {};
for (const arquivo of varrer(ASSETS).sort()) {
  const formato = extname(arquivo).slice(1).toLowerCase();
  if (!EXTENSOES.has(formato)) continue;
  const caminho = relative(RAIZ, arquivo).split("\\").join("/"); // assets/Logos/png/x.png
  const grupo = caminho.split("/")[1];
  const nome = basename(arquivo, extname(arquivo));
  (grupos[grupo] ??= []).push({
    arquivo: caminho.split("/").slice(2).join("/"), // "png/x.png" ou "x.svg"
    formato,
    variante: /_branco$/.test(nome) ? "branco" : "normal",
    bytes: statSync(arquivo).size,
  });
}

const arqVersao = join(RAIZ, "versao-atual.txt");
const versao = existsSync(arqVersao) ? readFileSync(arqVersao, "utf8").trim() : null;
const total = Object.values(grupos).reduce((n, g) => n + g.length, 0);

writeFileSync(
  join(RAIZ, "manifest.json"),
  JSON.stringify({ nome: "Design System Prestes · assets", versao, autor: "Rafael Casteli", total, grupos }, null, 2) + "\n",
);
console.log(`manifest.json: ${total} arquivos em ${Object.keys(grupos).length} grupos (versão ${versao})`);
