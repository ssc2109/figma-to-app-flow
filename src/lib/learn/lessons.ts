/* Aprender — estructura extendida de 30 lecciones por categoría.
   Cada LessonNode.title queda como topic clave para `pathProgress[pathId]: string[]`. */

export type LessonKind = "lesson" | "checkpoint" | "recall" | "final";
export type LessonTier = 1 | 2 | 3;

export interface LessonVideo {
  youtubeId: string;
  title: string;
  seconds: number;
}

export interface LessonNode {
  id: string;
  title: string;
  kind: LessonKind;
  tier: LessonTier;
  summary: string;
  video?: LessonVideo;
}

const T1: LessonTier = 1;
const T2: LessonTier = 2;
const T3: LessonTier = 3;

function build30(
  base: Array<{ title: string; summary: string; video?: LessonVideo }>,
  labels: { c1: string; r1: string; c2: string; r2: string; final: string },
): LessonNode[] {
  const nodes: LessonNode[] = [];
  const tierOf = (i: number): LessonTier => (i < 10 ? T1 : i < 20 ? T2 : T3);
  let idx = 0;
  for (let pos = 1; pos <= 30; pos++) {
    if (pos === 10) {
      nodes.push({ id: `l${pos}`, kind: "checkpoint", tier: T1, title: labels.c1, summary: "Test rápido de las lecciones 1 a 9." });
    } else if (pos === 15) {
      nodes.push({ id: `l${pos}`, kind: "recall", tier: T2, title: labels.r1, summary: "Repaso activo de lo visto en las lecciones 1 a 14." });
    } else if (pos === 20) {
      nodes.push({ id: `l${pos}`, kind: "checkpoint", tier: T2, title: labels.c2, summary: "Test rápido de las lecciones 11 a 19." });
    } else if (pos === 25) {
      nodes.push({ id: `l${pos}`, kind: "recall", tier: T3, title: labels.r2, summary: "Repaso activo de lo visto en las lecciones 16 a 24." });
    } else if (pos === 30) {
      nodes.push({ id: `l${pos}`, kind: "final", tier: T3, title: labels.final, summary: "Examen final: los 3 tramos completos." });
    } else {
      const b = base[idx++];
      nodes.push({ id: `l${pos}`, kind: "lesson", tier: tierOf(pos - 1), title: b.title, summary: b.summary, video: b.video });
    }
  }
  return nodes;
}

/* VENTAS — 25 lecciones regulares (Cialdini, SPIN Selling, Challenger Sale, Pink, HBR) */
const VENTAS_BASE = [
  { title: "Qué compra realmente tu cliente", summary: "La gente no compra productos, compra la solución a un dolor." },
  { title: "El saludo que engancha", summary: "Los primeros 5 segundos marcan si te compran o no." },
  {
    title: "Escucha antes de vender",
    summary: "Una buena pregunta vende más que un discurso.",
    // Video demo verificado y embebible mundialmente (Simon Sinek — Start With Why).
    video: { youtubeId: "u4ZoJKF_VuA", title: "Empieza por el porqué (Simon Sinek)", seconds: 55 },
  },
  { title: "Presenta beneficios, no features", summary: "Traduce cada característica al beneficio real para el cliente." },
  { title: "El precio se justifica con valor", summary: "Nunca defiendas un precio: muestra por qué vale la pena." },
  { title: "Cierre suave: la pregunta final", summary: "Termina con una pregunta que asuma la venta." },
  { title: "Objeciones comunes y respuestas", summary: "La objeción es interés disfrazado, no rechazo." },
  { title: "Cross-selling básico", summary: "Sumar 1 producto complementario aumenta el ticket 20-30%." },
  { title: "El post-venta que fideliza", summary: "Un mensaje después de comprar te consigue la siguiente venta." },
  { title: "Psicología de la escasez", summary: "Lo escaso se percibe valioso; úsalo con verdad." },
  { title: "Prueba social real", summary: "Testimonios reales convierten más que cualquier descuento." },
  { title: "Anclaje de precio", summary: "El primer precio que muestras condiciona lo que el cliente considera caro." },
  { title: "Bundles que enamoran", summary: "Combos bien diseñados suben margen y satisfacción." },
  { title: "Storytelling que vende", summary: "Una historia hace que el cliente se vea usando tu producto." },
  { title: "Up-selling sin ser invasivo", summary: "Ofrecer el siguiente nivel de producto duplica valor sin fricción." },
  { title: "Segmenta a tu cliente", summary: "No todos compran igual: adapta el mensaje al segmento." },
  { title: "Ciclo de venta consultivo", summary: "Diagnóstico → propuesta → cierre. Sigue el orden." },
  { title: "Manejo de clientes difíciles", summary: "Escuchar, validar y proponer: 3 pasos que desactivan la tensión." },
  { title: "Precios psicológicos", summary: "S/ 9.90 se percibe muy distinto que S/ 10.00: por qué y cuándo usarlo." },
  { title: "Ventas por WhatsApp que convierten", summary: "Plantillas + tiempo de respuesta = tasa de cierre 3x." },
  { title: "El vendedor consultor", summary: "Vende ayudando: cuando el cliente confía, compra sin resistencia." },
  { title: "Automatización de seguimiento", summary: "El 80% de las ventas se pierden por no dar seguimiento a tiempo." },
  { title: "KPI reales de ventas", summary: "Ticket promedio, tasa de conversión, recurrencia: los 3 números que importan." },
  { title: "Vender a empresas (B2B mype)", summary: "Cambia el juego: proceso más largo, decisión colectiva, mayor ticket." },
  { title: "Ventas éticas de largo plazo", summary: "Vender lo que no sirve destruye el negocio a los 6 meses." },
];

/* FINANZAS — 25 lecciones regulares (Profit First, Financial Intelligence, Investopedia, BID) */
const FINANZAS_BASE = [
  { title: "Separa dinero personal del negocio", summary: "Sin esta separación no puedes medir nada real." },
  { title: "Qué es realmente 'ganancia'", summary: "Ganancia = ingresos − TODOS los costos, no solo los productos." },
  {
    title: "Margen bruto en 1 minuto",
    summary: "(Precio − Costo) / Precio. Debajo de 20% estás en zona roja.",
    video: { youtubeId: "u4ZoJKF_VuA", title: "Fundamentos de valor (Simon Sinek)", seconds: 50 },
  },
  { title: "Registra cada venta y gasto", summary: "Sin datos no hay decisiones, solo intuición." },
  { title: "Flujo de caja diario", summary: "El dinero que entra menos el que sale hoy. Esa es tu foto real." },
  { title: "Costos fijos vs variables", summary: "Los fijos te matan si no vendes; los variables suben con la venta." },
  { title: "Punto de equilibrio", summary: "Cuánto necesitas vender para no perder. Toda mype debe saberlo." },
  { title: "Fija precios con criterio", summary: "Costo + margen + posicionamiento, no solo 'lo que cobra el vecino'." },
  { title: "Cuida el fiado", summary: "Vender fiado sin control es prestar dinero sin intereses." },
  { title: "Margen neto real", summary: "Después de TODO: sueldos, alquiler, luz, impuestos. Ahí ganas o pierdes." },
  { title: "Ciclo de caja del negocio", summary: "Días entre pagar al proveedor y cobrar al cliente." },
  { title: "Provisión para imprevistos", summary: "10-15% de utilidad reservado. No es opcional, es supervivencia." },
  { title: "Presupuesto mensual simple", summary: "Proyectar ingresos y gastos evita sorpresas dolorosas." },
  { title: "Analiza tus 3 productos top", summary: "El 80% de la ganancia suele venir del 20% del catálogo." },
  { title: "Gestión de inventario financiera", summary: "Cada producto parado es dinero congelado; rótalo o descuéntalo." },
  { title: "Crédito de proveedor bien usado", summary: "Pagar a 30 días te da capital de trabajo gratis." },
  { title: "Impuestos básicos para mypes", summary: "Nuevo RUS, RER o General: elegir bien te ahorra miles al año." },
  { title: "Reinvierte con cabeza", summary: "No toda la ganancia se reinvierte. Regla 50-30-20 aplicada al negocio." },
  { title: "Rentabilidad por producto", summary: "Vender más de lo menos rentable te empobrece." },
  { title: "Costo hora del dueño", summary: "Si tu tiempo no vale nada, el negocio no tiene margen real." },
  { title: "Financiamiento sano", summary: "Deuda solo si el retorno esperado supera claramente al interés." },
  { title: "KPIs financieros clave", summary: "Margen, rotación, caja, ROA. 4 números que gobiernan el negocio." },
  { title: "Estado de resultados mensual", summary: "Un P&L simple te muestra la verdad sin adornos." },
  { title: "Planeación financiera anual", summary: "Meta de ventas, meta de margen, meta de caja. Sin números no hay rumbo." },
  { title: "Riesgos financieros a evitar", summary: "Concentración de clientes, apalancamiento alto y caja negativa: los tres mata-mypes." },
];

export const EXPANDED_LESSONS: Record<string, LessonNode[]> = {
  ventas: build30(VENTAS_BASE, {
    c1: "Checkpoint 1: fundamentos de venta",
    r1: "Repaso activo: lo esencial en ventas",
    c2: "Checkpoint 2: técnicas intermedias",
    r2: "Repaso activo: ventas intermedias y avanzadas",
    final: "Examen final: maestría en ventas",
  }),
  finanzas: build30(FINANZAS_BASE, {
    c1: "Checkpoint 1: bases del dinero",
    r1: "Repaso activo: fundamentos financieros",
    c2: "Checkpoint 2: gestión financiera",
    r2: "Repaso activo: finanzas intermedias",
    final: "Examen final: finanzas del negocio",
  }),
};

export function isExpanded(pathId: string): boolean {
  return Object.prototype.hasOwnProperty.call(EXPANDED_LESSONS, pathId);
}

export function expandedTopicTitles(pathId: string): string[] {
  return (EXPANDED_LESSONS[pathId] ?? []).map((l) => l.title);
}

export const TIER_RANGES: Record<LessonTier, [number, number]> = {
  1: [1, 10],
  2: [11, 20],
  3: [21, 30],
};

export const TIER_LABEL: Record<LessonTier, string> = {
  1: "Tramo 1 · Fundamentos",
  2: "Tramo 2 · Intermedio",
  3: "Tramo 3 · Avanzado",
};
