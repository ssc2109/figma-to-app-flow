
# Productividad 4.0 — "Living Command"

## Diagnóstico honesto de lo actual
Lo que hay ahora es una plantilla Notion+Linear rediseñada. Bloques apilados: hero → 3 stats → franja → misiones → proyectos → metas → aprender → coach. Aunque esté con acentos vivos, la estructura sigue siendo **lista sobre lista** — por eso se siente calculadora. Además:
- La franja horizontal muestra HORAS (06:00, 07:00…) → sensación de agenda vacía.
- Botón "+ evento" fijo en el header → estorba y grita "formulario".
- socIA no aparece. Es "productividad personal" desacoplado de Trax.
- Sin insights: no dice nada sobre tu negocio, solo lista lo que TÚ metiste.

## Cambio mental
La pantalla deja de ser "gestor de tareas" y pasa a ser **la conciencia productiva del negocio**. socIA vive aquí. Las tareas y metas son consecuencia de insights, no listas huérfanas. La estructura se rompe: menos filas, más composición.

## Estructura nueva (una sola pieza viva, no bloques apilados)

```text
┌────────────────────────────────────────┐
│ AMBIENT HEADER                         │
│ "Miércoles · semana 3 de julio"        │
│ Frase viva de socIA (rota c/insight)   │
├────────────────────────────────────────┤
│ PULSE — canvas circular grande         │
│  ● Anillo exterior: avance de la       │
│    meta principal del negocio          │
│  ● Anillo interior: día productivo     │
│  ● Centro: número clave con contexto   │
│    (ej. "S/ 1,240 hoy · +18%")         │
│  Sin listas. Todo condensado en 1 obj. │
├────────────────────────────────────────┤
│ SOCIA WHISPER (integrada, no card)     │
│ Franja horizontal sutil con la voz de  │
│ socIA: 1 insight accionable a la vez,  │
│ swipeable. Ejemplo:                    │
│  "Tu meta de ventas va 62%. Cierra la  │
│   cotización de Ana hoy y saltas a 78%"│
│  → botón fantasma "hazlo"              │
├────────────────────────────────────────┤
│ HORIZONTE — franja de MESES/SEMANAS    │
│ Vista mediano plazo (default: 8 sem)   │
│ Cada semana = columna con densidad de  │
│ color según carga+cumplimiento.        │
│ Puntos flotantes = hitos, deadlines,   │
│ metas venciendo. Tap semana → detalle. │
│ (Sin "+ evento". Añadir vive dentro    │
│  del detalle de esa semana.)           │
├────────────────────────────────────────┤
│ FOCUS ORB — el "ahora"                 │
│ Un solo objeto grande, no lista:       │
│ La acción que MÁS mueve la aguja hoy   │
│ elegida por socIA cruzando tareas,     │
│ metas y datos del negocio. Con         │
│ contexto ("esto sube tu Trax Score").  │
│ Acciones: hecho · después · no aplica. │
├────────────────────────────────────────┤
│ CONSTELACIÓN DE METAS                  │
│ Grid orgánico (no grid rígido) de      │
│ orbes SVG. Tamaño = ambición,          │
│ opacidad = distancia al target,        │
│ pulso = actividad reciente. Tap = det. │
│ Metas del negocio y personales mezcl.  │
├────────────────────────────────────────┤
│ PROYECTOS EN VUELO — tarjetas ancho    │
│ completo tipo "carta" con progreso     │
│ como línea de aterrizaje horizontal,   │
│ no barras. Máx 2 visibles, resto swipe.│
├────────────────────────────────────────┤
│ APRENDER — entrada editorial (intacto) │
└────────────────────────────────────────┘
```

## Piezas en detalle

### 1. Ambient Header
- Fecha larga humana ("Miércoles · semana 3 de julio").
- Debajo, 1 línea de socIA que rota cada 6s con máx 3 mensajes contextuales generados desde `briefing` (ventas hoy, deuda pendiente, meta cercana).
- Cero botones. Cero "%" flotante. Cero "+ evento".

### 2. Pulse (reemplaza Day Ring + Momentum Strip + Next Move Hero)
- Un solo canvas circular ~280px al centro.
- **Anillo exterior grueso** = % de la meta de negocio prioritaria (viene de `goals` marcada como principal, o inferida por socIA si no hay).
- **Anillo interior fino** = % de tareas hechas hoy.
- **Centro dinámico**: rota entre 3 lecturas del negocio (ventas hoy vs ayer, stock crítico, deuda por cobrar) en Bai Jamjuree grande + delta con color.
- Al tap → expande a mini-brief textual.
- Reemplaza 3 componentes actuales (DayRing + MomentumStrip + NextMoveHero) por 1.

### 3. socIA Whisper
- Franja sin card, borde superior/inferior hairline `rgba(255,255,255,0.06)`.
- 1 insight visible, chip discreto "socIA" a la izq, texto en 1-2 líneas, botón fantasma "hazlo" a la derecha que crea tarea automática o dispara acción.
- Insights vienen de: metas cerca de cumplirse, tareas vencidas, patrones de venta (día lento vs promedio), stock bajo cruzado con tarea "reponer".
- Swipe horizontal para ver otros insights.

### 4. Horizonte (reemplaza timeline horaria)
- Grid horizontal de 8 semanas por defecto (toggle 4s / 8s / 12s discreto).
- Cada columna = semana. Fondo con densidad `rgba(255,255,255,0.03 → 0.14)` según cuántas tareas/eventos hay ese periodo.
- Puntos SVG flotantes = deadlines de proyecto, metas venciendo, eventos importantes. Color por tipo.
- Línea vertical blanca fina marca "semana actual".
- Tap columna → sheet con el detalle de esa semana (ahí sí aparece "+ añadir").
- Sin horas. Sin "+ evento" en el header.

### 5. Focus Orb
- No es card rectangular con "Hecho ✓". Es un objeto orgánico: circle background con glow sutil, título grande al centro, contexto abajo ("por qué importa").
- socIA lo elige cruzando: tareas P0 vencidas > eventos hoy > tareas ligadas a la meta prioritaria > acción sugerida (ej. "Cotiza a Ana, tienes 3 pedidos suyos sin cerrar").
- Acciones minimalistas: hecho (verde), después (ámbar sutil), no aplica (elimina la sugerencia y socIA aprende).
- Si no hay nada: no muestra CTA de "captura tu primera tarea"; muestra una lectura del negocio ("Vas bien. Descansa o adelanta [X]").

### 6. Constelación de Metas
- No grid 2 columnas rígido. SVG absolute-positioned con orbes distribuidos orgánicamente en un lienzo ~340×220.
- Tamaño = importancia (target absoluto normalizado).
- Opacidad = qué tan lejos está del target (más lejos = más apagado).
- Pulso lento en las que tuvieron actividad esta semana.
- Tap orbe → sheet de meta.
- Empty state: 1 orbe grande translúcido con "Define tu norte" (sin lista).

### 7. Proyectos en Vuelo
- Máx 2 cards visibles apiladas con leve overlap tipo naipes.
- Progreso como pista de aterrizaje horizontal: línea fina con dot que avanza, no barra rellena.
- Deadline en la esquina, sin badges duros.
- Swipe lateral revela el resto.

### 8. Aprender
- Intacto. Card editorial con arrow.

## Sistema visual
- Fondo `#000` puro.
- Cero franjas horarias. Cero botones "+" flotantes en headers.
- Tipografía: Bai Jamjuree para todos los números/porcentajes/deltas; Geist para prosa.
- Acentos: verde `#4ADE80` positivo, ámbar `#F5B944` atención, blanco puro foco. Rojo `#F87171` sólo emergencia real.
- Único gradiente permitido: glow radial suave detrás del Pulse y del Focus Orb.
- Micro-motion: pulso lento en orbes activos, spring en anillos al montar, transición cross-fade en la voz de socIA.
- Densidad de scroll ~30% menor que la versión actual porque desaparecen 3 bloques de "listas".

## Datos e integración con Trax (esto es lo que la aleja de "plantilla")
Todo esto se lee vía hooks existentes (`useMe`, `useFinance`, `useInventory`) — sin migraciones nuevas.

- **Pulse centro** ← `useFinance` (ventas hoy vs ayer), fallback inventory (stock crítico), fallback debts.
- **Pulse anillo exterior** ← `goals` marcada `priority:'high'`, o la meta más cercana a target si no hay marca.
- **socIA Whisper** ← genera insights client-side cruzando:
  - `goals` con progreso ≥80% → "estás cerca".
  - `products` con stock ≤ min → "repón X".
  - `debts` con vencimiento próximo → "cobra a Y".
  - `todos` con `due` vencido y `priority` urgent → "cierra Z".
- **Horizonte densidad** ← count de `todos` + `events` + `projects.dueDate` por semana.
- **Focus Orb** ← mismo motor de prioridad que `NextMoveHero` pero enriquecido con contexto de negocio ("mueve tu meta de ventas +6%").
- **Constelación** ← `goals` mezcladas con métricas de negocio como pseudo-metas ("subir ticket promedio", "reducir stock muerto") generadas por socIA.

## Cambios técnicos
- `src/components/MeScreen.tsx`: reescritura del render principal + nuevos sub-componentes:
  - `AmbientHeader`, `PulseCanvas`, `SociaWhisper`, `HorizonteStrip`, `FocusOrb`, `GoalConstellation`, `FlightCards`.
- **Eliminar**: `DayRing`, `NextMoveHero`, `MomentumStrip`, `HorizontalTimeline` (horaria), `CommandBar` en header, botón "+ Evento" del header, `MissionCard` como bloque separado, `GoalRing` grid.
- **Conservar**: todos los sheets (TaskSheet, EventSheet, ProjectSheet, GoalSheet), `LearnView`, hooks, `WeekGantt` internamente (para el detalle de semana en Horizonte).
- Sin migraciones. Sin cambios fuera de `MeScreen.tsx` salvo un helper puro `src/lib/productivity/insights.ts` para generar los whispers de socIA a partir de los hooks.

## Fuera de alcance
- No toca Home, Negocio, ni interior de Aprender.
- No mueve al backend nada nuevo — socIA en esta pantalla es reglas locales sobre datos existentes; cuando exista endpoint dedicado se enchufa fácil.
- No añade timers ni tracking en vivo de foco.

## Resultado esperado
Abres Productividad y **no ves una lista**. Ves un pulso circular con el número que importa del negocio, una voz de socIA que te dice qué mover, un horizonte de semanas que respira según tu carga, un solo foco vivo al centro y tus metas como constelación. Trax, no una plantilla.
