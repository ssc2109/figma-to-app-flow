export type BriefingCtaAction =
  | "chat"
  | "reponer"
  | "cobrar_fiado"
  | "finanzas"
  | "ventas"
  | "promo";

const PRIMARY_LABEL: Record<BriefingCtaAction, string> = {
  reponer: "Reponer",
  cobrar_fiado: "Cobrar",
  finanzas: "Ver",
  ventas: "Registrar",
  promo: "Crear promo",
  chat: "Abrir",
};

const FALLBACK_LABELS: Record<BriefingCtaAction, string[]> = {
  reponer: ["Inventario", "Abrir"],
  cobrar_fiado: ["Fiados", "Abrir"],
  finanzas: ["Finanzas", "Abrir"],
  ventas: ["Venta", "Abrir"],
  promo: ["Crecer", "Abrir"],
  chat: ["Abrir", "Ir"],
};

const STOP_WORDS = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "y",
  "o",
  "en",
  "para",
  "por",
  "que",
  "con",
  "sin",
  "es",
  "le",
  "lo",
  "su",
  "tu",
  "mi",
  "hoy",
  "ya",
  "muy",
  "mas",
  "más",
]);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function tokensOverlap(labelToken: string, textToken: string) {
  if (labelToken === textToken) return true;
  if (labelToken.length >= 4 && textToken.length >= 4) {
    const labelStem = labelToken.slice(0, 4);
    const textStem = textToken.slice(0, 4);
    return labelToken.startsWith(textStem) || textToken.startsWith(labelStem);
  }
  return false;
}

function labelRepeatsInsight(label: string, insightText: string) {
  const labelNorm = normalizeText(label);
  const insightNorm = ` ${normalizeText(insightText)} `;
  if (labelNorm.length > 2 && insightNorm.includes(` ${labelNorm} `)) return true;

  const labelTokens = meaningfulTokens(label);
  const insightTokens = meaningfulTokens(insightText);
  return labelTokens.some((labelToken) =>
    insightTokens.some((textToken) => tokensOverlap(labelToken, textToken)),
  );
}

function isCompactLabel(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 2 && label.trim().length <= 16;
}

export function getDistinctCtaLabel(
  aiLabel: string | null | undefined,
  action: BriefingCtaAction,
  insightText: string,
) {
  const candidates = [
    aiLabel?.trim() || "",
    PRIMARY_LABEL[action],
    ...FALLBACK_LABELS[action],
    "Abrir",
    "Ir",
  ];

  for (const candidate of candidates) {
    if (!candidate || !isCompactLabel(candidate)) continue;
    if (!labelRepeatsInsight(candidate, insightText)) return candidate;
  }

  return "Ir";
}