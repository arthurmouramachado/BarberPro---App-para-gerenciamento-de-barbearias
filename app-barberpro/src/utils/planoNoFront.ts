const PREFIXO_PLANO = /^\s*plano\s*:\s*/i;

export function ehPlanoPelaDescricao(descricao?: string | null): boolean {
  return PREFIXO_PLANO.test(descricao ?? "");
}

export function descricaoSemPrefixo(descricao?: string | null): string {
  let texto = (descricao ?? "").trim();
  // Evita acumular o prefixo quando um plano é editado várias vezes.
  while (PREFIXO_PLANO.test(texto)) texto = texto.replace(PREFIXO_PLANO, "");
  return texto.trim();
}

export function descricaoParaSalvar(descricao: string, ehPlano: boolean): string {
  const texto = descricaoSemPrefixo(descricao);
  return ehPlano ? `Plano: ${texto}`.trim() : texto;
}