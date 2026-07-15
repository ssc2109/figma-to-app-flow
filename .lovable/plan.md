
# Productividad 2.0 — Notion × Linear, adaptado a Trax

Deja de ser un menú de tarjetas para entrar a submódulos. Pasa a ser **una sola pantalla-cockpit** donde todo se ve y se opera en línea: cronograma, entregables, tareas, metas, aprender. Menos clicks, más señal.

## Principios

- **Densidad útil sin ruido.** Como Linear: filas compactas, tipografía Geist mono para IDs/fechas, estados con puntos de color pequeños, hairlines en vez de cards infladas.
- **Bloques editoriales tipo Notion.** Cada sección es un "block" con título mínimo, contenido inline y acción rápida (+) a la derecha. Nada se abre en modal si puede editarse in-place.
- **Fondo negro puro `#000`.** Fuera aurora azul, fuera degradados. Un solo acento blanco + puntos de color semántico (rojo urgencia, ámbar en riesgo, verde hecho). Sin morados ni azules eléctricos.
- **Cronograma siempre visible.** No es un tile para entrar; es el corazón de la vista.
- **Un solo scroll vertical.** Sin submódulos con back button (excepto Aprender, que se mantiene tal cual).

## Estructura de la pantalla (top → bottom)

```text
┌────────────────────────────────────────┐
│ Header: "Hoy, mié 15 jul"  · nombre    │  ← eyebrow + fecha viva
│ Ribbon de foco (3 números clave)       │  ← pendientes · en riesgo · hechas
├────────────────────────────────────────┤
│ ⌘ Command bar   [+ Añadir]  [Hoy ▾]   │  ← Linear-style quick add
├────────────────────────────────────────┤
│ CRONOGRAMA (timeline vertical de hoy) │  ← inline, siempre visible
│  08 ─── (vacío)                       │
│  09 ── ● Reunión proveedor  30m       │
│  10 ── ● Reponer bebidas    tarea     │
│  ...                                   │
│  ahora ──────────────── línea viva     │
├────────────────────────────────────────┤
│ INBOX / PRIORIDADES (lista Linear)    │
│  ● TRX-12  Cobrar fiado Juan   P1 hoy │
│  ● TRX-13  Pedido harina       P2     │
│  + Añadir tarea (inline)              │
├────────────────────────────────────────┤
│ ENTREGABLES (proyectos, tabla Notion) │
│  ▸ Lanzar delivery      75% ▓▓▓▓░ 3d  │
│  ▸ Rebranding local     20% ▓░░░░ 2s  │
├────────────────────────────────────────┤
│ METAS (OKRs compactos)                │
│  Ventas jul   S/ 8.2k / 12k  68%      │
├────────────────────────────────────────┤
│ APRENDER (intacto, carruseles)        │
├────────────────────────────────────────┤
│ RECOS IA (chips inline, no card)      │
└────────────────────────────────────────┘
```

## Bloques en detalle

### 1. Header vivo
Fecha larga en Bai Jamjuree, saludo corto. Debajo, **ribbon de 3 métricas** en fila (Pendientes · En riesgo · Hechas hoy) con números Bai Jamjuree grandes y label Geist uppercase. Reemplaza el "TodayStatus" actual.

### 2. Command bar (Linear)
Barra sticky con:
- Input "Añadir tarea, evento o meta…" (parsea `mañana 9am`, `p1`, `#proyecto`).
- Botón `+` que abre menú rápido: Tarea · Evento · Proyecto · Meta.
- Selector de vista: Hoy · Semana · Todo.

### 3. Cronograma inline (reemplaza el módulo Calendario)
Timeline vertical de 06:00 → 22:00, hora a hora, con:
- Línea "ahora" animada.
- Bloques de eventos y tareas con `due` de hoy, coloreados por tipo (evento = borde blanco, tarea = punto de prioridad).
- Tap en bloque → edición inline expandible (Notion-style), no modal.
- Long-press vacío → crear evento en esa hora.
- Toggle "Semana" cambia a mini-Gantt horizontal de 7 días (respeta preferencia del usuario por Gantt).

### 4. Inbox / Prioridades (Linear)
Lista densa de tareas no completadas:
- Fila: `●` status · `TRX-###` id mono · título · pill prioridad P0-P3 · due relativo.
- Swipe derecha = hecho, swipe izquierda = pospone 1 día.
- `+ Añadir tarea` inline al final (sin modal).
- Filtros chip: Hoy · Vencidas · Esta semana.

### 5. Entregables / Proyectos (Notion tabla)
Reemplaza Bento actual por **tabla-lista** compacta:
- Nombre · barra progreso · deadline · estado (En curso / En riesgo / Bloqueado / Hecho).
- Expandir fila → subtareas inline con checkbox.

### 6. Metas (OKR)
Una fila por meta: título · valor actual / target · barra · % · trend arrow. Sin submódulo.

### 7. Aprender
**Se mantiene igual** — LearnView completo (rutas, sesiones IA, quiz). Solo cambia el punto de entrada: pasa de tile bento a un bloque tipo Notion con título "Aprender" y los carruseles horizontales ya existentes embebidos, sin necesidad de entrar a otra pantalla. Botón "Ver todo" para el detalle profundo.

### 8. Recos IA
Chips horizontales scrollables al final. Tap → acción directa (crear tarea, abrir chat socIA).

## Cambios visuales globales

- **Elimino `AuroraBg`** y todo `bg-[#...]` azul/morado en esta pantalla.
- Fondo: `#000`. Separadores: `rgba(255,255,255,0.06)` de 1px.
- Cards → bloques con `bg: rgba(255,255,255,0.03)` + `border: rgba(255,255,255,0.06)`, radio 16.
- Tipos:
  - Números y fechas: Bai Jamjuree.
  - Texto UI: Geist.
  - IDs (TRX-12): Geist con `font-variant-numeric: tabular-nums`.
- Puntos de color semánticos: `#F87171` urgente, `#F5B944` en riesgo, `#4ADE80` hecho, blanco = neutral. Nada más.
- Bottom safe-area 180px (nav flotante).

## Navegación y estado

- `view` se elimina para todo lo que hoy es submódulo (priorities, calendar, projects, goals, recos). Todo vive en el hub.
- Solo `learn` conserva su vista detallada (mantener rutas, sesiones, quiz).
- Se conservan todos los hooks/datos existentes (`useMe`, `useFinance`, `useInventory`) y los sheets de edición (TaskSheet, ProjectSheet, GoalSheet, EventSheet) — se reusan disparados desde el hub.

## Detalles técnicos

- Archivo objetivo: `src/components/MeScreen.tsx` (reescritura del render principal + nuevos sub-componentes: `FocusRibbon`, `CommandBar`, `DayTimeline`, `WeekGantt`, `TaskInbox`, `DeliverablesTable`, `GoalsList`, `LearnBlock`, `RecosStrip`).
- Se conservan (y se reutilizan) los sheets y componentes Learn existentes.
- Se borra `AuroraBg` de uso; se puede dejar el `function` si otras vistas la usan (verificaré con `rg`).
- Cero cambios de backend, cero migraciones.

## Fuera de alcance (por ahora)
- No toca `Home`, `Negocio`, ni Aprender por dentro (solo su punto de entrada).
- No añade colaboración multi-usuario (Linear-style asignaciones a equipo) — el módulo Empleados ya existe aparte.
- No agrega drag & drop entre horas del cronograma en esta iteración (se puede añadir después).

## Resultado esperado
Una sola pantalla negra, densa y viva. Abres Productividad y ves: qué toca ahora (cronograma), qué debes cerrar (inbox), qué está en marcha (entregables), a dónde vas (metas), y qué aprender. Cero navegación innecesaria. Sensación Notion + Linear, identidad Trax intacta.
