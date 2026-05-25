// Mapeamento de nomes em PT-BR para códigos ISO 3166-1 alpha-2
// Usado pra mostrar bandeiras via flagcdn.com (gratuito, sem chave)

export const TIME_PARA_ISO: Record<string, string> = {
  // Confirmados Copa 2026
  "Brasil": "br",
  "África do Sul": "za",
  "Marrocos": "ma",
  "Escócia": "gb-sct",
  "Haiti": "ht",
  "México": "mx",
  "EUA": "us",
  "Canadá": "ca",
  "Coreia do Sul": "kr",
  "República Tcheca": "cz",
  "Bósnia e Herzegovina": "ba",
  "Catar": "qa",
  "Suíça": "ch",
  "Paraguai": "py",
  "Austrália": "au",
  "Turquia": "tr",
  "Alemanha": "de",
  "Curaçao": "cw",
  "Costa do Marfim": "ci",
  "Equador": "ec",
  "Holanda": "nl",
  "Japão": "jp",
  "Suécia": "se",
  "Tunísia": "tn",
  "Bélgica": "be",
  "Egito": "eg",
  "Irã": "ir",
  "Nova Zelândia": "nz",
  "Espanha": "es",
  "Cabo Verde": "cv",
  "Arábia Saudita": "sa",
  "Uruguai": "uy",
  "França": "fr",
  "Senegal": "sn",
  "Iraque": "iq",
  "Noruega": "no",
  "Argentina": "ar",
  "Argélia": "dz",
  "Áustria": "at",
  "Jordânia": "jo",
  "Portugal": "pt",
  "RD Congo": "cd",
  "Uzbequistão": "uz",
  "Colômbia": "co",
  "Inglaterra": "gb-eng",
  "Croácia": "hr",
  "Gana": "gh",
  "Panamá": "pa",
};

export function getBandeiraUrl(time: string, tamanho: "small" | "medium" | "large" = "small"): string | null {
  const iso = TIME_PARA_ISO[time];
  if (!iso) return null;

  const sizes = { small: "w40", medium: "w80", large: "w160" };
  return `https://flagcdn.com/${sizes[tamanho]}/${iso}.png`;
}
