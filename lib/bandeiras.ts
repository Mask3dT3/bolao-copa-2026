// Mapeamento de nomes em PT-BR para códigos ISO 3166-1 alpha-2
// Usa circle-flags (jsdelivr): cobre TODAS as 211 federações FIFA, incluindo Inglaterra/Escócia/País de Gales

export const TIME_PARA_ISO: Record<string, string> = {
  // Confederações
  "Brasil": "br",
  "África do Sul": "za",
  "Marrocos": "ma",
  "Escócia": "gb-sct",
  "Haiti": "ht",
  "México": "mx",
  "EUA": "us",
  "Estados Unidos": "us",
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
  "Países Baixos": "nl",
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
  "País de Gales": "gb-wls",
  "Croácia": "hr",
  "Gana": "gh",
  "Panamá": "pa",
  // Possíveis também
  "Polônia": "pl",
  "Dinamarca": "dk",
  "Itália": "it",
  "Rússia": "ru",
  "Ucrânia": "ua",
  "Chile": "cl",
  "Peru": "pe",
  "Venezuela": "ve",
  "Camarões": "cm",
  "Nigéria": "ng",
  "Guiné": "gn",
  "Mali": "ml",
  "Burkina Faso": "bf",
};

export function getBandeiraUrl(time: string): string | null {
  const iso = TIME_PARA_ISO[time];
  if (!iso) return null;
  // circle-flags via jsdelivr: SVG circular, cobre tudo, sempre disponível, free, sem rate limit
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${iso}.svg`;
}

// URL pra bandeira circular (alternativa, mais bonita pra times)
export function getBandeiraCircularUrl(time: string): string | null {
  const iso = TIME_PARA_ISO[time];
  if (!iso) return null;
  return `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/${iso}.svg`;
}
