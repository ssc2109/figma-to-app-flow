/* Aprender — estructura extendida de 30 lecciones por categoría.
   Cada LessonNode.title queda como topic clave para `pathProgress[pathId]: string[]`. */

export type LessonKind = "lesson" | "checkpoint" | "recall" | "final";
export type LessonTier = 1 | 2 | 3;

export interface LessonVideo {
  youtubeId: string;
  title: string;
  /** Segundo exacto donde arranca el clip embebido (parámetro `start` de YouTube). */
  startSeconds: number;
  /** Segundo exacto donde se detiene el clip embebido (parámetro `end` de YouTube). */
  endSeconds: number;
  /** Duración visible del clip (endSeconds - startSeconds). Derivada, usada para UI. */
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

/* Helper para construir el clip con seconds derivado. */
function clip(youtubeId: string, title: string, startSeconds: number, endSeconds: number): LessonVideo {
  return { youtubeId, title, startSeconds, endSeconds, seconds: Math.max(1, endSeconds - startSeconds) };
}

/* VENTAS — 25 lecciones regulares (Cialdini, SPIN Selling, Challenger Sale, Pink, HBR) */
const VENTAS_BASE = [
  { title: "Qué compra realmente tu cliente", summary: "La gente no compra productos, compra la solución a un dolor." },
  { title: "El saludo que engancha", summary: "Los primeros 5 segundos marcan si te compran o no." },
  {
    title: "Escucha antes de vender",
    summary: "Una buena pregunta vende más que un discurso.",
    // Video verificado: TED oficial de Simon Sinek "How great leaders inspire action" (uploaded by TED).
    // Recorte inicial 0-55s: es el enganche autocontenido antes de que arranque el marco del "why".
    video: clip("u4ZoJKF_VuA", "Empieza por el porqué (Simon Sinek — TED)", 0, 55),
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
  { title: "Margen bruto en 1 minuto", summary: "(Precio − Costo) / Precio. Debajo de 20% estás en zona roja." },
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

/* CLIENTES — Delivering Happiness (Hsieh), Effortless Experience (Dixon), Zendesk */
const CLIENTES_BASE = [
  { title: "El cliente empieza antes de entrar", summary: "Fachada, orden y saludo definen la primera impresión." },
  { title: "Escucha activa en el mostrador", summary: "Mirar a los ojos y repetir lo pedido evita errores." },
  { title: "Tiempo de espera percibido", summary: "Un cliente entretenido siente que espera menos." },
  { title: "Reglas para dirigirte al cliente", summary: "Tono cercano, sin diminutivos forzados ni 'amigo'." },
  { title: "Recuerda nombres y compras", summary: "Un nombre repetido bien construye lealtad real." },
  { title: "La sonrisa se nota por teléfono", summary: "El tono cambia según tu cara; también en WhatsApp." },
  { title: "Manejo básico de una queja", summary: "Agradece, escucha, resuelve y hace seguimiento." },
  { title: "Reclamos en redes sociales", summary: "Responder rápido en público te salva la reputación." },
  { title: "Fideliza con detalles pequeños", summary: "Un cliente premiado con un extra vuelve tres veces más." },
  { title: "Programa de recompensas simple", summary: "10 compras = 1 gratis. Nada más complejo al inicio." },
  { title: "Segmenta a tus clientes recurrentes", summary: "El 20% de tus clientes puede dar el 80% de la venta." },
  { title: "Base de datos WhatsApp", summary: "Lista organizada por preferencias vale oro cada campaña." },
  { title: "Encuestas cortas al cerrar venta", summary: "Una pregunta ('¿Recomendarías?') basta para medir NPS." },
  { title: "Recuperar clientes perdidos", summary: "Un mensaje sincero recupera al 30% de los que se fueron." },
  { title: "Effortless Experience", summary: "Facilitar la vida del cliente lo fideliza más que sorprenderlo." },
  { title: "Personalización sin invadir", summary: "Ofrecer sí, presionar no. La línea la marca el cliente." },
  { title: "Reglas del delivery propio", summary: "Hora prometida = hora cumplida. Sin excepciones." },
  { title: "Estándares mínimos de atención", summary: "Los tres pilares: rapidez, exactitud, cordialidad." },
  { title: "Capacita a tu equipo en atención", summary: "Un colaborador mal entrenado destruye 20 clientes al día." },
  { title: "Reseñas: cómo pedirlas bien", summary: "Después de una experiencia positiva, con un link listo." },
  { title: "El cliente enojado que enseña", summary: "Cada queja profunda es un plano gratis de tus fallas." },
  { title: "Comunicación proactiva de imprevistos", summary: "Avisar antes que reclame convierte el problema en aliado." },
  { title: "CRM básico para mype", summary: "Un cuaderno o Google Sheet ya es CRM si lo usas." },
  { title: "Cultura de servicio en 3 personas", summary: "Todos, incluido el dueño, hacen limpieza y atienden si toca." },
  { title: "Cliente vitalicio: cuánto vale", summary: "Un cliente fiel 3 años vale 20x más que uno de una compra." },
];

/* PRODUCTIVIDAD — Deep Work, Atomic Habits, GTD */
const PRODUCTIVIDAD_BASE = [
  { title: "La regla del 80/20", summary: "El 20% de tus tareas produce el 80% del ingreso." },
  { title: "Bloques de trabajo profundo", summary: "90 minutos sin celular rinden más que 4 horas fragmentadas." },
  { title: "Matriz Eisenhower simple", summary: "Urgente vs importante ordena tu día en 5 minutos." },
  { title: "Regla de los 2 minutos", summary: "Si se resuelve en 2 min, hazlo ahora. GTD 101." },
  { title: "Hábitos atómicos aplicados", summary: "1% mejor cada día es el motor invisible del negocio." },
  { title: "Bandeja cero de WhatsApp", summary: "Responder por tandas ahorra 2 horas al día." },
  { title: "Un solo cuaderno de capturas", summary: "Todo pendiente cae en un mismo sitio o se pierde." },
  { title: "Planea tu día la noche anterior", summary: "5 minutos de plan valen 2 horas de improvisación." },
  { title: "Rutina de arranque del día", summary: "Los primeros 60 minutos marcan la energía completa." },
  { title: "Aprende a decir NO", summary: "Cada 'sí' te resta capacidad para el 'sí' importante." },
  { title: "Delegar sin perder control", summary: "Delega salida, no proceso: revisa resultado, no cada paso." },
  { title: "Automatizaciones baratas", summary: "Plantillas + respuestas rápidas ahorran horas cada semana." },
  { title: "Gestión de energía, no de tiempo", summary: "Haz lo difícil cuando tu energía está en pico." },
  { title: "El correo no es tu jefe", summary: "Consultarlo 3 veces al día alcanza. Todo lo demás es adicción." },
  { title: "Meditación de 5 minutos", summary: "Baja el ruido mental y mejora la toma de decisiones." },
  { title: "Sueño: el KPI invisible", summary: "Menos de 6 horas destruye 30% de tu productividad." },
  { title: "Reuniones que valen su hora", summary: "Agenda escrita, decisiones concretas o cancélala." },
  { title: "Deep Work para el dueño", summary: "Aparta 1 tarde a la semana para pensar tu negocio." },
  { title: "Sistemas > motivación", summary: "La disciplina se construye con procesos, no con ganas." },
  { title: "Multitarea: mito que empobrece", summary: "El cerebro no multitasque; solo cambia de tarea perdiendo tiempo." },
  { title: "Ley de Parkinson", summary: "Una tarea se expande al tiempo que le das. Ponle plazo corto." },
  { title: "Revisiones semanales", summary: "1 hora del viernes ordena la semana siguiente completa." },
  { title: "Kanban en un tablero", summary: "Por hacer / Haciendo / Hecho. 3 columnas mueven el negocio." },
  { title: "Descanso estratégico", summary: "Parar 10 min cada 90 acelera todo lo que sigue." },
  { title: "Auditar dónde se va tu día", summary: "Anota 3 días qué haces cada hora: te horrorizarás." },
];

/* ORGANIZACIÓN — E-Myth (Gerber), Checklist Manifesto (Gawande) */
const ORGANIZACION_BASE = [
  { title: "El negocio que no depende de ti", summary: "Si sin ti se cae, no tienes negocio: tienes autoempleo." },
  { title: "Documenta el proceso clave", summary: "Escribe cómo se hace, o cada empleado nuevo empieza de cero." },
  { title: "Checklist de apertura y cierre", summary: "Reduce errores y olvidos en el día a día." },
  { title: "Orden físico del local", summary: "Un lugar para cada cosa, cada cosa en su lugar." },
  { title: "Etiqueta cada producto y estante", summary: "Buscar mata productividad; etiquetar la salva." },
  { title: "Almacén organizado ABC", summary: "Lo que más rota debe estar más cerca de la salida." },
  { title: "Documenta lo que ya funciona", summary: "No inventes nuevo; captura lo que ya da resultado." },
  { title: "Delega lo repetitivo primero", summary: "Suelta lo mecánico antes que lo estratégico." },
  { title: "Manual mínimo viable", summary: "5 páginas con lo esencial es 100x mejor que 0 páginas." },
  { title: "El E-Myth aplicado", summary: "Trabaja EN el negocio, no solo dentro del negocio." },
  { title: "Roles y responsabilidades", summary: "Cada tarea tiene un dueño. Sin dueño, nadie responde." },
  { title: "Reuniones diarias de 5 min", summary: "Qué se hizo, qué toca, qué bloquea. Sirve incluso con 2 personas." },
  { title: "Trello / Notion gratis", summary: "Herramientas gratuitas ordenan lo que la mente olvida." },
  { title: "Estandariza tu producto estrella", summary: "Mismo sabor, mismo tamaño, mismo precio: siempre." },
  { title: "Sistema de compras interno", summary: "Quién compra, cuándo, con qué presupuesto: escrito." },
  { title: "Inventario en tiempo real", summary: "Contar semanalmente ahorra sustos y ladrones." },
  { title: "Control de caja diaria", summary: "Cierre de caja con firma cierra 90% de las mermas." },
  { title: "Manejo de proveedores por tabla", summary: "Contactos, precios, plazos en un solo lugar." },
  { title: "SOP: Procedimiento Operativo Estándar", summary: "Un paso a paso que cualquier persona nueva pueda seguir." },
  { title: "Auditoría trimestral simple", summary: "Cada 3 meses revisa: ¿qué proceso ya no sirve?" },
  { title: "Cultura de mejora continua", summary: "Kaizen: pequeñas mejoras que suman resultados enormes." },
  { title: "Roles del dueño en 5 años", summary: "Deja de ser operario, sé arquitecto del negocio." },
  { title: "Backup digital básico", summary: "Google Drive gratis salva tu contabilidad de un incendio." },
  { title: "Trazabilidad de errores", summary: "Cuando algo falla, encuentra la CAUSA, no al culpable." },
  { title: "Sistema mínimo escalable", summary: "Diseña procesos que sirvan para 1 local y para 10." },
];

/* FORMALIZACIÓN — SUNAT, SUNARP, Ministerio de la Producción */
const FORMALIZACION_BASE = [
  { title: "Por qué formalizarte importa", summary: "Facturas te abren clientes empresa y créditos formales." },
  { title: "RUC persona natural con negocio", summary: "El más simple: dueño único, trámite directo en SUNAT." },
  { title: "Diferencia entre RUC 10 y RUC 20", summary: "10 es persona natural, 20 es persona jurídica (empresa)." },
  { title: "Nuevo RUS: pagos fijos mensuales", summary: "Categoría 1 o 2 según ingresos; el más simple para empezar." },
  { title: "RER: cuándo pasar del RUS", summary: "Si ya emites facturas y creces, RER da más opciones." },
  { title: "Régimen General y MYPE Tributario", summary: "Para negocios más grandes con contabilidad completa." },
  { title: "Comprobantes electrónicos", summary: "Boleta y factura digital son obligatorias en la mayoría de casos." },
  { title: "Libros contables básicos", summary: "Registro de ventas, compras e inventario según régimen." },
  { title: "Sunarp: reserva de nombre", summary: "5 soles y 24 horas para reservar el nombre de tu empresa." },
  { title: "Constitución en línea", summary: "SID-SUNARP permite crear tu empresa 100% online." },
  { title: "Licencia municipal de funcionamiento", summary: "Obligatoria; el proceso varía según riesgo del negocio." },
  { title: "Defensa Civil según tu local", summary: "Tamaño y aforo definen si es básica o de detalle." },
  { title: "Registro de marca en Indecopi", summary: "Protege tu nombre comercial de copias por 10 años." },
  { title: "Registro Sanitario si vendes alimentos", summary: "DIGESA regula empaques y etiquetado." },
  { title: "Contratación formal de personal", summary: "Contrato, planilla electrónica y beneficios sociales." },
  { title: "REMYPE: beneficios laborales", summary: "MYPE inscrita paga menos beneficios (vacaciones 15 días, CTS 15 días)." },
  { title: "EsSalud y ONP/AFP básicos", summary: "Aportes obligatorios que protegen al trabajador." },
  { title: "Retención de renta 4ta y 5ta", summary: "Cuándo retienes al recibo por honorarios y al planilla." },
  { title: "Declaración mensual PDT", summary: "Cronograma SUNAT: fecha según último dígito del RUC." },
  { title: "Detracciones: cómo funcionan", summary: "Descuento a favor de SUNAT en ciertos rubros." },
  { title: "Percepciones e infracciones frecuentes", summary: "Errores comunes que generan multas evitables." },
  { title: "Facturación negociada B2B", summary: "Vender con factura te abre puertas a empresas grandes." },
  { title: "Cierre y baja de RUC", summary: "Cómo salir del sistema sin dejar deudas colgando." },
  { title: "Beneficios tributarios MYPE", summary: "Régimen MYPE tributario baja tasa de renta al 10% en tramos." },
  { title: "Errores comunes al formalizarse", summary: "No cambiar de régimen a tiempo cuesta miles en multas." },
];

/* MARKETING — Godin, Berger, Ries & Trout, Meta for Business */
const MARKETING_BASE = [
  { title: "Marketing = comunicar valor", summary: "No es publicidad: es hacer visible por qué te compran." },
  { title: "Define a tu cliente ideal", summary: "Si le hablas a todos, no te oye nadie." },
  { title: "Propuesta única de valor", summary: "Una frase que responde: ¿por qué yo y no la competencia?" },
  { title: "Posicionamiento en 1 palabra", summary: "Ries & Trout: dueña una palabra en la mente del cliente." },
  { title: "Marketing de permiso", summary: "Godin: gánate el derecho a comunicar antes de vender." },
  { title: "Contagio: por qué se comparte", summary: "Historia + emoción + utilidad práctica = viralidad." },
  { title: "Instagram para mype", summary: "Consistencia > perfección. Publica lo real del día a día." },
  { title: "TikTok para negocio local", summary: "Video de 15s bien contado alcanza más que 100 flyers." },
  { title: "WhatsApp Business bien usado", summary: "Catálogo + respuestas rápidas + etiquetas = venta 24/7." },
  { title: "Google Business Profile", summary: "Ficha gratis que te pone en el mapa de tu barrio." },
  { title: "SEO local básico", summary: "Nombre + ciudad + rubro. Palabras que te buscan a mano." },
  { title: "Contenido que educa vende", summary: "Enseña algo útil y el cliente asocia autoridad = compra." },
  { title: "Anuncios pagados a bajo costo", summary: "Con S/ 50 ya alcanzas 3.000 personas bien segmentadas." },
  { title: "Píxel de Meta explicado simple", summary: "Rastrea quién vio y compró; permite reimpactar." },
  { title: "Landing simple de un producto", summary: "Foto + beneficio + testimonial + botón WhatsApp." },
  { title: "Email marketing barato", summary: "Mailchimp gratis hasta 500 contactos; ROI altísimo." },
  { title: "Marketing de referidos", summary: "Cliente que recomienda gana 10% off, tú ganas cliente nuevo." },
  { title: "Programa de embajadores", summary: "Da un producto a un vecino conocido a cambio de reseña." },
  { title: "Colaboración entre mypes", summary: "Bodega + panadería + florería cruzan cliente sin costo." },
  { title: "Métricas que sí importan", summary: "Alcance, engagement, clicks, conversión, ventas." },
  { title: "A/B testing con S/ 20", summary: "Cambia 1 sola cosa y mide: aprendes barato." },
  { title: "Storytelling de marca", summary: "Cuenta por qué empezaste; conecta más que cualquier oferta." },
  { title: "Fotografía de producto en celular", summary: "Luz natural, fondo limpio: sube 40% la conversión." },
  { title: "Errores caros en publicidad", summary: "No medir, no segmentar, cambiar cada semana." },
  { title: "Plan de marketing 90 días", summary: "3 meses, 1 canal, 1 mensaje, 1 meta clara." },
];

/* INVENTARIO — The Goal (Goldratt), ASCM/APICS */
const INVENTARIO_BASE = [
  { title: "Inventario es dinero congelado", summary: "Cada producto en anaquel es soles esperando." },
  { title: "Rotación mensual básica", summary: "Cuántas veces vendes tu inventario en el mes." },
  { title: "Método ABC de productos", summary: "A: 20% de SKUs = 80% de ventas. Prioriza." },
  { title: "Stock de seguridad simple", summary: "Cantidad mínima para no quedar en cero." },
  { title: "Punto de reposición", summary: "Cuándo pedir para que llegue antes de agotarse." },
  { title: "Conteo cíclico semanal", summary: "Contar por zonas evita el cierre anual traumático." },
  { title: "Mermas y cómo controlarlas", summary: "Robo interno, caducidad y errores: mide para atacar." },
  { title: "Productos de baja rotación", summary: "Si no rota en 60 días, remátalo o discontinúalo." },
  { title: "Proveedor A vs B: cómo elegir", summary: "Precio no es todo: plazo, calidad y respaldo cuentan." },
  { title: "Lote económico de compra (EOQ)", summary: "Cuánto pedir para minimizar costo total." },
  { title: "Descuentos por volumen", summary: "Comprar más solo si vendes más rápido de lo que caduca." },
  { title: "FIFO vs LIFO", summary: "Primero entrado, primero salido: crítico en perecibles." },
  { title: "Etiquetado y fechas visibles", summary: "El equipo debe ver la fecha sin voltear el producto." },
  { title: "Cross-docking básico", summary: "Producto llega y sale sin pasar por almacén: cero costo." },
  { title: "Consignación con proveedor", summary: "Solo pagas cuando vendes; ideal para SKUs nuevos." },
  { title: "Kardex digital simple", summary: "Excel bien llevado ya es kardex funcional." },
  { title: "Alertas de stock bajo", summary: "Notificación automática evita quiebres embarazosos." },
  { title: "Costo real de un quiebre", summary: "No pierdes 1 venta: pierdes al cliente y su recomendación." },
  { title: "Análisis de temporalidad", summary: "Enero baja, diciembre sube: planifica por historia." },
  { title: "Espacio físico como recurso", summary: "M² del local también cuesta: mide margen por metro." },
  { title: "Auditoría anual de inventario", summary: "Contar TODO 1 vez al año cierra huecos contables." },
  { title: "Inventario en múltiples locales", summary: "Sistema centralizado o cada tienda es un caos." },
  { title: "Proveedor extranjero: cuándo", summary: "China rinde solo si compras +USD 3.000 y esperas 60 días." },
  { title: "Just in time para mypes", summary: "Menos stock, más frecuencia de pedidos. Requiere disciplina." },
  { title: "KPI de inventario clave", summary: "Rotación, cobertura, mermas, quiebres. Los 4 fundamentales." },
];

/* ADMINISTRACIÓN — Porter, Drucker, Doerr (OKRs) */
const ADMINISTRACION_BASE = [
  { title: "Administrar es decidir", summary: "Cada día tomas 5-10 decisiones que marcan el negocio." },
  { title: "Misión y visión útiles", summary: "En 1 frase cada una, no en un póster olvidado." },
  { title: "5 fuerzas de Porter simplificado", summary: "Competidores, sustitutos, clientes, proveedores, entrantes." },
  { title: "Ventaja competitiva real", summary: "Qué haces distinto que nadie más puede copiar rápido." },
  { title: "OKRs para mype", summary: "1 objetivo, 3 resultados medibles por trimestre." },
  { title: "KPI vs vanity metrics", summary: "Followers no pagan sueldos; ventas sí." },
  { title: "Toma de decisiones con datos", summary: "Si no lo mides, adivinas. Y adivinar cuesta caro." },
  { title: "Análisis FODA rápido", summary: "Fortalezas, Oportunidades, Debilidades, Amenazas en 30 min." },
  { title: "Presupuesto anual simple", summary: "Ingresos, gastos, inversión, colchón. 4 líneas bastan." },
  { title: "Reunión mensual de números", summary: "Revisa ventas, margen, caja, clientes activos." },
  { title: "Delegación efectiva", summary: "Delegar tarea + autoridad + fecha + resultado esperado." },
  { title: "Gestión de proveedores estratégicos", summary: "3 proveedores del top: contrato claro, precio revisado." },
  { title: "Selección de personal por competencias", summary: "No contrates por CV, contrata por lo que hace bien." },
  { title: "Plan estratégico a 3 años", summary: "Dónde quieres estar, con qué margen, con qué equipo." },
  { title: "Modelo de negocio Canvas", summary: "9 bloques que resumen cómo ganas dinero." },
  { title: "Estructura organizacional simple", summary: "Quién reporta a quién, incluso siendo 3 personas." },
  { title: "Auditoría interna trimestral", summary: "Revisar caja, inventario, procesos: prevención pura." },
  { title: "Análisis competitivo mensual", summary: "1 hora mirando qué hace la competencia = oro." },
  { title: "Sistema de reportes ejecutivos", summary: "3 números que ves cada lunes: define cuáles." },
  { title: "Gestión del cambio", summary: "Todo cambio necesita explicar el porqué al equipo." },
  { title: "Cultura organizacional", summary: "Los valores se enseñan con actos, no con carteles." },
  { title: "Innovación continua", summary: "Reserva 5% del tiempo a probar cosas nuevas." },
  { title: "Riesgos operativos", summary: "Incendio, robo, ciber: ten plan B por escrito." },
  { title: "Gestión del crecimiento", summary: "Crecer sin caja lleva a la quiebra por éxito." },
  { title: "Salida del dueño del día a día", summary: "El objetivo final: negocio que camina sin ti presente." },
];

/* NEGOCIACIÓN — Getting to Yes (Fisher & Ury), Never Split the Difference (Voss) */
const NEGOCIACION_BASE = [
  { title: "Negociar no es pelear", summary: "Es encontrar acuerdo donde los dos ganan más que no acordar." },
  { title: "Prepara antes de negociar", summary: "70% del resultado depende de lo que preparaste antes." },
  { title: "MAAN: tu mejor alternativa", summary: "Sin plan B no negocias: aceptas lo que te den." },
  { title: "ZOPA: zona de acuerdo posible", summary: "El rango donde ambos pueden decir sí." },
  { title: "Separa a la persona del problema", summary: "Duro con el problema, suave con la persona." },
  { title: "Intereses, no posiciones", summary: "'Necesito descuento' vs 'necesito mejorar mi margen'." },
  { title: "Preguntas abiertas de Voss", summary: "'¿Cómo lo hago?' pone al otro a resolverte el problema." },
  { title: "Empatía táctica", summary: "Nombra la emoción del otro y baja la tensión." },
  { title: "El 'espejo' de 3 palabras", summary: "Repite las 3 últimas palabras y ganan información." },
  { title: "Silencio como herramienta", summary: "Callarte 6 segundos después de una oferta la mejora." },
  { title: "Anclas iniciales", summary: "La primera cifra dicha condiciona todo el rango." },
  { title: "Contra-oferta con justificación", summary: "'Puedo pagar X porque…' vale más que solo X." },
  { title: "Concesiones que se sienten grandes", summary: "Da poco, muy despacio, y con esfuerzo aparente." },
  { title: "Manejo de silencios y presiones", summary: "Un negociador serio no cede por incomodidad." },
  { title: "Cuándo levantarte de la mesa", summary: "Sin MAAN, no te vas. Con MAAN, sí." },
  { title: "Negociar con tu proveedor clave", summary: "Volumen, plazo, exclusividad: 3 palancas típicas." },
  { title: "Negociar tu alquiler", summary: "Contrato largo por menor precio: ganan ambos." },
  { title: "Negociar con equipo interno", summary: "Reglas claras, feedback frecuente, revisión anual." },
  { title: "Cerrar sin arrepentimiento", summary: "Confirma acuerdo por escrito antes de irte." },
  { title: "Contrato que se cumple", summary: "Un buen contrato es el que ninguno necesita usar." },
  { title: "El BATNA del otro lado", summary: "Adivina qué pasa si no te compra: te da poder real." },
  { title: "Negociación por email", summary: "Escrito da tiempo a pensar, pero pierde matices." },
  { title: "Errores comunes de emoción", summary: "Enojo, ansiedad y ego cierran mesas antes de tiempo." },
  { title: "Negociar precio en la calle", summary: "En Perú el regateo es cultural: úsalo con respeto." },
  { title: "Ética en negociación", summary: "Trampa gana esta vez; verdad gana la próxima década." },
];

/* RRHH — Contratación, planillas, retención (marco laboral peruano) */
const RRHH_BASE = [
  { title: "Tu primer colaborador", summary: "Define bien el puesto antes de buscarlo." },
  { title: "Perfil del puesto en 1 página", summary: "Tareas, resultado esperado y valores clave." },
  { title: "Reclutamiento local barato", summary: "Vecinos, WhatsApp de vecindario, referidos internos." },
  { title: "Entrevista por competencias", summary: "Preguntas de situaciones reales, no de teoría." },
  { title: "Prueba práctica de 1 día", summary: "Ve cómo trabaja, no cómo dice que trabaja." },
  { title: "Contrato modalidad y plazos", summary: "Indefinido, sujeto a modalidad o parcial: elige bien." },
  { title: "Planilla electrónica básica", summary: "SUNAT PLAME es obligatorio en formal." },
  { title: "Beneficios MYPE REMYPE", summary: "Vacaciones 15d, CTS 15d, sin gratificación. Ahorro real." },
  { title: "Onboarding: primeros 30 días", summary: "Un nuevo mal integrado renuncia en el mes." },
  { title: "Capacitación mínima viable", summary: "Manual + shadowing + checklist = base sólida." },
  { title: "Evaluación de desempeño simple", summary: "3 criterios: actitud, resultados, aprendizaje. Semestral." },
  { title: "Feedback 1 a 1 semanal", summary: "15 min con cada colaborador cambian el clima." },
  { title: "Sueldos justos y rangos", summary: "Investiga tu rubro y tu ciudad antes de fijar." },
  { title: "Bonos ligados a resultados", summary: "Ata bono a metas cumplibles y medibles." },
  { title: "Retener buen personal", summary: "Reconocimiento, plan de carrera y trato justo. En ese orden." },
  { title: "Manejo de conflictos internos", summary: "Escuchar por separado, luego juntos, resolver rápido." },
  { title: "Cuando toca desvincular", summary: "Rápido, respetuoso y con liquidación completa." },
  { title: "Cálculo de liquidación básica", summary: "Vacaciones truncas, CTS, gratificación proporcional." },
  { title: "Salud y seguridad laboral", summary: "SST es obligación aunque seas 3 personas." },
  { title: "Comunicación interna clara", summary: "Grupo WhatsApp con reglas evita el caos." },
  { title: "Clima laboral: mídelo", summary: "Encuesta anual anónima de 5 preguntas basta." },
  { title: "Cultura de reconocimiento", summary: "Un 'gracias' público vale más que un bono privado." },
  { title: "Delegación con seguimiento", summary: "Delega tarea + medición + fecha de revisión." },
  { title: "Plan de carrera básico", summary: "Muestra ruta: junior → senior → líder. Retiene." },
  { title: "El costo de la rotación", summary: "Reemplazar cuesta 3-6 meses de sueldo. Invierte en retener." },
];

/* LIDERAZGO — Good to Great, Start with Why, Five Dysfunctions */
const LIDERAZGO_BASE = [
  { title: "Líder no es jefe", summary: "El jefe manda; el líder inspira y guía con ejemplo." },
  { title: "Liderazgo situacional", summary: "Adapta tu estilo según madurez del colaborador." },
  { title: "Empieza con el porqué", summary: "Sinek: la gente compra el propósito, no el qué." },
  { title: "El líder nivel 5 de Collins", summary: "Humildad personal + voluntad profesional férrea." },
  { title: "Confianza como base", summary: "Sin confianza no hay equipo, hay individuos coincidiendo." },
  { title: "Feedback que construye", summary: "Concreto, oportuno, respetuoso y accionable." },
  { title: "Reuniones eficientes", summary: "Agenda, resultado esperado, tiempo cerrado." },
  { title: "Delegar con confianza", summary: "Suelta el proceso, revisa el resultado, no ambos." },
  { title: "Motivación intrínseca", summary: "Autonomía + maestría + propósito. Dinero es solo higiene." },
  { title: "Comunicación 1 a 1", summary: "15 min a la semana con cada persona = base cultural." },
  { title: "5 disfunciones de un equipo", summary: "Falta de confianza, miedo al conflicto, sin compromiso, evitar rendición, no atender resultados." },
  { title: "Reconocimiento público", summary: "Alaba en público, corrige en privado. Regla simple, potente." },
  { title: "Gestionar al que rinde poco", summary: "Coaching, plan de mejora, decisión. En ese orden." },
  { title: "Cultura de excelencia", summary: "Se define por lo que toleras, no por lo que dices." },
  { title: "Toma de decisiones difíciles", summary: "Decidir es liderar: postergar también decide en tu contra." },
  { title: "Coaching básico para líderes", summary: "Preguntas > consejos. Que el otro descubra." },
  { title: "Manejo de crisis con calma", summary: "En crisis, el equipo mira tu cara antes que tus palabras." },
  { title: "Visión compartida", summary: "El equipo debe saber a dónde van y por qué importa." },
  { title: "Alineación de metas", summary: "Cada rol debe ver cómo su tarea impacta la meta." },
  { title: "Liderar cambios organizacionales", summary: "Explica por qué, cómo y qué gana cada uno." },
  { title: "Diversidad en el equipo", summary: "Distintas cabezas ven ángulos que uno solo no ve." },
  { title: "Autoconocimiento del líder", summary: "Reconoce tus sesgos antes que el equipo los sufra." },
  { title: "Mentoría interna", summary: "Empareja senior con junior: crece ambos y cultura." },
  { title: "Legado del líder", summary: "Cómo funciona el negocio cuando ya no estás mide tu éxito." },
  { title: "Liderazgo con humildad", summary: "Los mejores líderes preguntan más de lo que responden." },
];

/* IA — McKinsey Digital, MIT Technology Review, casos reales */
const IA_BASE = [
  { title: "Qué es realmente IA hoy", summary: "Herramienta que reconoce patrones y genera contenido probable." },
  { title: "ChatGPT en 5 minutos", summary: "Escribe bien el prompt y ahorra 1-2 horas diarias." },
  { title: "IA para atender clientes 24/7", summary: "Bots simples responden lo repetitivo mientras duermes." },
  { title: "Automatiza WhatsApp Business", summary: "Respuestas rápidas + IA descarga 80% de consultas." },
  { title: "Genera fotos de producto con IA", summary: "Herramientas gratuitas dan fotos profesionales sin estudio." },
  { title: "Escribe posts de Instagram", summary: "IA propone 10 versiones; tú eliges y personalizas." },
  { title: "Ideas de contenido semanal", summary: "Pide 20 ideas al mes y elige las 4 mejores." },
  { title: "Analiza ventas con IA", summary: "Sube tu Excel y pide insights: patrones invisibles emergen." },
  { title: "Predice quiebres de stock", summary: "Con historial de 3 meses, IA proyecta reposición ideal." },
  { title: "Traduce a inglés/quechua rápido", summary: "Comunica con clientes que no hablan español al toque." },
  { title: "Transcribe reuniones automáticamente", summary: "Otter.ai o Whisper te dan minuta sin tomar notas." },
  { title: "Resume documentos largos", summary: "Contratos, informes, artículos en 3 párrafos claros." },
  { title: "Genera contratos base", summary: "IA da borrador; abogado revisa y ahorras 70%." },
  { title: "Correos y cotizaciones veloces", summary: "Plantillas + IA = respuesta en 30 segundos, no 15 min." },
  { title: "IA para diseño (Canva AI)", summary: "Logos, flyers y presentaciones en minutos con calidad." },
  { title: "Chatbot en tu web gratis", summary: "Herramientas no-code te dan bot funcional en 1 hora." },
  { title: "Segmentación de clientes con IA", summary: "Sube base y IA agrupa por comportamiento real." },
  { title: "Detección de fraude básico", summary: "IA identifica ventas raras y patrones sospechosos." },
  { title: "IA generativa vs analítica", summary: "Una crea contenido, otra descubre patrones. Usa ambas." },
  { title: "Costo real de usar IA", summary: "GPT gratis alcanza para 90% de casos mype." },
  { title: "Limitaciones y errores comunes", summary: "IA se equivoca; verifica siempre lo crítico (números, leyes)." },
  { title: "Privacidad y datos del cliente", summary: "No subas datos personales a herramientas públicas." },
  { title: "IA + humano = fórmula ganadora", summary: "IA hace primer borrador, humano decide y refina." },
  { title: "Casos reales de mypes con IA", summary: "Bodega en Lima usa IA para reponer stock 3 días antes." },
  { title: "Cómo empezar mañana", summary: "Elige 1 tarea repetitiva y automatízala esta semana." },
];

/* EXPANSIÓN — Scaling Up (Harnish) */
const EXPANSION_BASE = [
  { title: "¿Estás listo para escalar?", summary: "Sin sistemas y flujo positivo, escalar acelera la caída." },
  { title: "Los 4 quebraderos al crecer", summary: "Personal, procesos, caja, cliente. Rompe uno y colapsas." },
  { title: "Estandariza antes de expandir", summary: "Copia solo lo que funciona; no repliques caos." },
  { title: "Sucursal propia vs franquicia", summary: "Propia da control; franquicia da velocidad con menos capital." },
  { title: "Elegir la 2da ubicación", summary: "Flujo peatonal, competencia, alquiler: los 3 filtros." },
  { title: "Financiamiento para crecer", summary: "Utilidad retenida > deuda > inversor. En ese orden." },
  { title: "Cuidar la marca al expandir", summary: "Todo local debe verse y sentirse igual." },
  { title: "Gerente de tienda: perfil", summary: "Confianza + habilidad operativa. No pongas a un familiar sin filtro." },
  { title: "Sistema de reportes multi-local", summary: "Ventas diarias, caja diaria, stock: dashboards obligatorios." },
  { title: "Rituales entre sucursales", summary: "Reunión semanal virtual, KPIs compartidos, comparación sana." },
  { title: "Expansión geográfica ordenada", summary: "Consolidas tu ciudad antes de saltar a otra región." },
  { title: "Modelos de negocio para escalar", summary: "Producto físico, servicio, digital, franquicia: cada uno escala diferente." },
  { title: "Cadena de suministro sólida", summary: "Un proveedor no basta cuando tienes 3 locales." },
  { title: "Tecnología para escalar", summary: "POS unificado, inventario central, contabilidad en la nube." },
  { title: "Cultura al expandir equipo", summary: "Escrita, vivida, evaluada. Sin cultura, se caen los valores." },
  { title: "Precios uniformes o zonales", summary: "Depende de costos locales; nunca por capricho." },
  { title: "Marketing multi-local", summary: "Nacional + local: campañas centrales + adaptación de barrio." },
  { title: "Métricas de escala clave", summary: "Ticket, tráfico, conversión, satisfacción por local." },
  { title: "Auditoría cruzada", summary: "El local A audita al B cada trimestre. Detectan lo que tú no ves." },
  { title: "Cuándo cerrar un local", summary: "3 meses en rojo estructural sin plan claro = cerrar." },
  { title: "Escala digital: e-commerce", summary: "Web + delivery cubren geografía sin abrir metros cuadrados." },
  { title: "Franquiciar: cuándo y cómo", summary: "Necesitas manual operativo probado y marca reconocible." },
  { title: "Inversionista minoritario", summary: "Trae capital y red; da acciones y perdés autonomía parcial." },
  { title: "Fracaso al expandir: causas", summary: "Falta de caja, elección de ubicación, equipo débil." },
  { title: "Plan de expansión a 5 años", summary: "1 local ahora, 3 en 2 años, 10 en 5. Con hitos claros." },
];

/* INVERSIÓN — The Intelligent Investor (Graham), SBS Perú */
const INVERSION_BASE = [
  { title: "Ahorro no es inversión", summary: "Guardar bajo el colchón pierde valor con inflación." },
  { title: "Fondo de emergencia primero", summary: "3-6 meses de gastos antes de invertir un sol." },
  { title: "Riesgo vs retorno", summary: "Nadie da 20% mensual sin riesgo. Es estafa o suerte." },
  { title: "Interés compuesto", summary: "La 8va maravilla del mundo; tiempo + constancia." },
  { title: "Cuentas de ahorro con rendimiento", summary: "Cajas municipales pagan 4-6% al año, seguras hasta S/ 100k." },
  { title: "Depósitos a plazo", summary: "Renta fija segura para dinero que no necesitas 6-12 meses." },
  { title: "Fondos mutuos básicos", summary: "Diversificas con S/ 100; empieza conservador." },
  { title: "Bolsa de Valores de Lima", summary: "Acciones de empresas peruanas; movimiento moderado." },
  { title: "ETFs globales", summary: "Un solo instrumento invierte en 500 empresas del mundo." },
  { title: "Bonos del gobierno", summary: "Estado peruano paga renta fija en soles y dólares." },
  { title: "Bienes raíces básicos", summary: "Alquiler pasivo; requiere capital fuerte y gestión." },
  { title: "Reinvertir utilidades del negocio", summary: "Muchas veces la mejor inversión sigue siendo tu propia mype." },
  { title: "Diversificar 3 canastas", summary: "Corto plazo, mediano, largo. No pongas todo en 1." },
  { title: "Inversiones en dólares", summary: "Cobertura contra devaluación; ojo al tipo de cambio." },
  { title: "Crédito para negocio: sano vs malo", summary: "Sano: para invertir con retorno > interés. Malo: para consumo." },
  { title: "Evaluar retorno de inversión (ROI)", summary: "(Ganancia − Costo) / Costo. Compara contra alternativas." },
  { title: "Payback: cuándo recuperas", summary: "Meses que tardas en recuperar tu inversión inicial." },
  { title: "Análisis de sensibilidad", summary: "¿Y si vendo 30% menos? Simula escenarios negativos." },
  { title: "Fundamentos para atraer inversores", summary: "Números claros, mercado grande, equipo sólido, salida definida." },
  { title: "Deuda vs equity", summary: "Deuda se paga con interés; equity da acciones. Cada una tiene costo." },
  { title: "Ángeles inversionistas en Perú", summary: "PECAP y otros conectan a mypes con capital privado." },
  { title: "Fondos de venture capital", summary: "Para startups escalables con potencial 10x." },
  { title: "Riesgos regulatorios", summary: "Cambios de ley afectan retorno; monitorea siempre." },
  { title: "Educación financiera continua", summary: "SBS y BVL dan cursos gratis; úsalos." },
  { title: "Estrategia a 20 años", summary: "Constancia + reinversión + paciencia = independencia financiera." },
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
  clientes: build30(CLIENTES_BASE, {
    c1: "Checkpoint 1: bases de atención",
    r1: "Repaso activo: atención al cliente",
    c2: "Checkpoint 2: fidelización",
    r2: "Repaso activo: experiencia y retención",
    final: "Examen final: maestría en clientes",
  }),
  productividad: build30(PRODUCTIVIDAD_BASE, {
    c1: "Checkpoint 1: fundamentos de productividad",
    r1: "Repaso activo: hábitos y foco",
    c2: "Checkpoint 2: gestión del tiempo",
    r2: "Repaso activo: sistemas productivos",
    final: "Examen final: productividad del dueño",
  }),
  organizacion: build30(ORGANIZACION_BASE, {
    c1: "Checkpoint 1: orden operativo",
    r1: "Repaso activo: procesos y orden",
    c2: "Checkpoint 2: sistemas y estándares",
    r2: "Repaso activo: organización escalable",
    final: "Examen final: negocio sistematizado",
  }),
  formalizacion: build30(FORMALIZACION_BASE, {
    c1: "Checkpoint 1: RUC y regímenes",
    r1: "Repaso activo: obligaciones básicas",
    c2: "Checkpoint 2: licencias y planillas",
    r2: "Repaso activo: formalización operativa",
    final: "Examen final: negocio formalizado",
  }),
  marketing: build30(MARKETING_BASE, {
    c1: "Checkpoint 1: bases de marketing",
    r1: "Repaso activo: posicionamiento y canales",
    c2: "Checkpoint 2: canales digitales",
    r2: "Repaso activo: marketing digital",
    final: "Examen final: marketing rentable",
  }),
  inventario: build30(INVENTARIO_BASE, {
    c1: "Checkpoint 1: bases de inventario",
    r1: "Repaso activo: rotación y control",
    c2: "Checkpoint 2: proveedores y stock",
    r2: "Repaso activo: inventario avanzado",
    final: "Examen final: gestión de inventario",
  }),
  administracion: build30(ADMINISTRACION_BASE, {
    c1: "Checkpoint 1: bases administrativas",
    r1: "Repaso activo: KPIs y decisiones",
    c2: "Checkpoint 2: gestión ejecutiva",
    r2: "Repaso activo: administración estratégica",
    final: "Examen final: administración del negocio",
  }),
  negociacion: build30(NEGOCIACION_BASE, {
    c1: "Checkpoint 1: bases de negociación",
    r1: "Repaso activo: preparación y tácticas",
    c2: "Checkpoint 2: técnicas avanzadas",
    r2: "Repaso activo: negociación estratégica",
    final: "Examen final: maestría en negociación",
  }),
  rrhh: build30(RRHH_BASE, {
    c1: "Checkpoint 1: contratar bien",
    r1: "Repaso activo: reclutamiento y planilla",
    c2: "Checkpoint 2: retener y desarrollar",
    r2: "Repaso activo: gestión de personas",
    final: "Examen final: equipo que crece contigo",
  }),
  liderazgo: build30(LIDERAZGO_BASE, {
    c1: "Checkpoint 1: bases de liderazgo",
    r1: "Repaso activo: comunicación y equipo",
    c2: "Checkpoint 2: liderazgo situacional",
    r2: "Repaso activo: liderazgo intermedio",
    final: "Examen final: líder que trasciende",
  }),
  ia: build30(IA_BASE, {
    c1: "Checkpoint 1: fundamentos de IA",
    r1: "Repaso activo: IA aplicada al día a día",
    c2: "Checkpoint 2: IA operativa",
    r2: "Repaso activo: IA en el negocio",
    final: "Examen final: IA integrada al negocio",
  }),
  expansion: build30(EXPANSION_BASE, {
    c1: "Checkpoint 1: bases para escalar",
    r1: "Repaso activo: preparación para expandir",
    c2: "Checkpoint 2: sucursales y sistemas",
    r2: "Repaso activo: expansión ordenada",
    final: "Examen final: escalar sin romper el negocio",
  }),
  inversion: build30(INVERSION_BASE, {
    c1: "Checkpoint 1: bases de inversión",
    r1: "Repaso activo: instrumentos y riesgo",
    c2: "Checkpoint 2: instrumentos y evaluación",
    r2: "Repaso activo: inversión estratégica",
    final: "Examen final: dueño inversor",
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
