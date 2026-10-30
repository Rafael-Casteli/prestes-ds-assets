// Publica uma versão dos assets. Funciona no PowerShell, no Git Bash e no Linux.
//
//   node scripts/publicar.mjs              → próxima correção (1.0.2 → 1.0.3)
//   node scripts/publicar.mjs 1.1.0        → versão escolhida
//   node scripts/publicar.mjs 1.0.3 "Novos ícones de lazer"
//   node scripts/publicar.mjs --voltar 1.0.2   → rollback: o conector volta a servir 1.0.2
//
// O que faz: atualiza versao-atual.txt → gera manifest.json → commit → tag → push.
// O conector lê versao-atual.txt na branch main e passa a servir a versão nova em até 5 minutos.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const sh = (cmd) => execSync(cmd, { cwd: RAIZ, stdio: "inherit" });
const shOut = (cmd) => execSync(cmd, { cwd: RAIZ }).toString().trim();
const SEMVER = /^\d+\.\d+\.\d+$/;
const arqVersao = join(RAIZ, "versao-atual.txt");
const atual = readFileSync(arqVersao, "utf8").trim();
const tags = shOut("git tag --list").split(/\s+/).filter(Boolean);

const args = process.argv.slice(2);

if (args[0] === "--voltar") {
  const alvo = args[1];
  if (!SEMVER.test(alvo ?? "") || !tags.includes(alvo)) {
    console.error(`Informe uma versão publicada. Disponíveis: ${tags.join(", ")}`);
    process.exit(1);
  }
  writeFileSync(arqVersao, alvo + "\n");
  sh(`git add versao-atual.txt`);
  sh(`git commit -m "Rollback: conector volta a servir ${alvo}"`);
  sh(`git push origin main`);
  console.log(`\nPronto. O conector volta a servir ${alvo} em até 5 minutos.`);
  process.exit(0);
}

let versao = args[0];
if (!versao || !SEMVER.test(versao)) {
  const [a, b, c] = atual.split(".").map(Number);
  versao = `${a}.${b}.${c + 1}`;
} else {
  args.shift();
}
const mensagem = args.join(" ") || `Assets ${versao}`;

if (tags.includes(versao)) {
  console.error(`A versão ${versao} já existe. Use outra (atual: ${atual}).`);
  process.exit(1);
}

writeFileSync(arqVersao, versao + "\n");
sh(`node scripts/gerar-manifest.mjs`);
sh(`git add -A`);
sh(`git commit -m "${mensagem.replace(/"/g, "'")}"`);
sh(`git tag -a ${versao} -m "${mensagem.replace(/"/g, "'")}"`);
sh(`git push --atomic origin main ${versao}`); // atômico: se a tag for recusada, o main também não sobe (evita servir versão sem tag)
console.log(`\nPublicado ${versao}. O conector passa a servir esta versão em até 5 minutos.`);
