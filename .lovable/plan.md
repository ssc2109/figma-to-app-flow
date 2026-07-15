
# Productividad 3.0 — "Command Deck"

Fuera la sensación de libreta Notion. Entra una **central ejecutiva viva** donde cada elemento empuja al usuario a moverse: números que laten, progreso que avanza a la vista, cronograma comprimido a una franja, y un "próximo movimiento" siempre destacado.

## Diagnóstico de lo actual
- El cronograma vertical 06:00–22:00 se come 60% del scroll y está vacío el 90% del tiempo → muerto visual.
- Todo son bloques grises con títulos y "+" → estética de plantilla.
- No hay jerarquía: pendientes, entregables, metas y aprender pesan igual → nada llama a actuar.
- Cero feedback de progreso, momentum o recompensa.

## Principios nuevos
1. **Un héroe, no diez tarjetas.** Arriba un único bloque grande que responde "¿qué hago AHORA?".
2. **Cronograma = franja, no columna.** Timeline horizontal de 1 sola fila (~110px alto), scrolleable, con la hora actual centrada.
3. **Momentum visible.** Barras de progreso, ring de día, contadores que animan, chips de racha de acción.
4. **Densidad con energía.** Fondo negro puro, pero acentos vivos: verde momentum, ámbar riesgo, rojo urgencia, blanco foco. Micro-gradientes sutiles solo en el héroe y en el ring del día.
5. **Cero estados vacíos aburridos.** Cada bloque vacío = CTA visual con ilustración tipográfica y verbo de acción ("Lanza tu primera meta", "Captura la primera tarea del día").

## Estructura nueva (top → bottom)

```text
┌────────────────────────────────────────┐
│ HEADER compacto: fecha · saludo · ring │  ← ring circular = % del día productivo
├────────────────────────────────────────┤
│ NEXT MOVE  (HERO)                      │
│  ▸ Tarea/evento inmediato, grande      │
│  ▸ Botón "Hecho" gigante + "Posponer"  │
│  ▸ Contador "en 12 min" en Bai Jamjuree│
├────────────────────────────────────────┤
│ MOMENTUM STRIP (3 stats vivos)         │
│  Hechas hoy · Racha · Foco (min)       │
│  Números grandes + sparkline mini      │
├────────────────────────────────────────┤
│ TIMELINE HORIZONTAL (110px)            │
│  ── 08 09 [10●] 11 12 13 14 15 ──      │
│  scroll horizontal, "ahora" centrado   │
├────────────────────────────────────────┤
│ COMMAND BAR sticky (compacta)          │
│  + Añadir…  ⌘K                         │
├────────────────────────────────────────┤
│ MISSIONS (Prioridades reimaginadas)    │
│  Cards tipo "misión" con XP visual,   │
│  P0/P1 en color, swipe-hecho           │
├────────────────────────────────────────┤
│ PROYECTOS EN VUELO (max 3, cards)      │
│  Barra progreso gruesa + días restantes│
│  Estado con dot pulsante si en riesgo  │
├────────────────────────────────────────┤
│ METAS · anillo compacto por meta       │
│  Grid 2 col, ring SVG + % + trend      │
├────────────────────────────────────────┤
│ APRENDER (intacto, entrada editorial) │
├────────────────────────────────────────┤
│ COACH IA (chips proactivos)            │
└────────────────────────────────────────┘
```

## Bloques en detalle

### 1. Header + Day Ring
- Fecha corta + saludo en 1 línea.
- **Ring SVG** a la derecha (56px): % de día productivo = `hechas / (hechas + pendientes de hoy)`. Animado al montar.
- Reemplaza el "ribbon" de 3 números frío.

### 2. Next Move (héroe motivacional)
- La única card grande de la pantalla (~160px alto).
- Elige automáticamente: evento en <60 min > tarea P0 vencida > tarea P0 hoy > tarea con hora más próxima > tarea sin hora P1 > "Captura tu próxima acción".
- Fondo con gradiente sutil `radial-gradient` blanco 4% desde arriba-izq.
- Título 22px, meta info Bai Jamjuree ("en 12 min", "vence hoy 18:00").
- **Botón primario grande** "Hecho ✓" (verde suave) + secundario "+15 min" (posponer).
- Al marcar hecho: micro-animación de check + confeti mínimo + el bloque hace flip al siguiente.

### 3. Momentum Strip
- 3 pills horizontales: **Hechas hoy** (número que anima con CountUp) · **Racha** (🔥 días seguidos con ≥1 tarea) · **Foco** (min acumulados en tareas con hora hoy).
- Cada pill con sparkline de últimos 7 días (SVG mini).

### 4. Timeline horizontal (reemplaza el gigante vertical)
- Franja 110px alto, scroll-x snap por hora.
- Rango dinámico: primera hora con evento −1h hasta última +1h; default 07:00-20:00.
- Bloques de eventos como pills coloreadas; tareas con hora como puntos.
- Línea "ahora" vertical con label `HH:mm` fijo, centrada al montar.
- Tap en hueco → crear evento a esa hora.
- Toggle "Semana" pasa a mini-Gantt horizontal de 7 días (mantenido).

### 5. Command Bar
- Sticky bajo el timeline. Compacta (44px). Input + `+` menú (Tarea/Evento/Entregable/Meta).

### 6. Missions (Prioridades)
- Ya no filas Linear grises. Cards horizontales con:
  - Barra vertical izquierda 3px de color por prioridad (rojo/ámbar/blanco).
  - Título + due relativo Bai Jamjuree.
  - "XP" implícito: chip con puntos (P0=30, P1=20, P2=10, P3=5) → suma al momentum del día.
  - Swipe → hecho (confeti mini) / posponer.
- Filtros chip Hoy · Vencidas · Semana en la esquina.
- Vacío: card ilustrada "Sin misiones. Añade la primera y arranca el día."

### 7. Proyectos en vuelo
- Máx 3 cards apiladas (el resto tras "Ver todos").
- Barra progreso 8px con gradiente verde→blanco, número % Bai Jamjuree grande.
- Deadline con badge días restantes, rojo si <3.
- Dot pulsante ámbar si `status === 'late'` o en riesgo.

### 8. Metas — Anillos
- Grid 2 columnas de mini-anillos SVG (60px), % dentro, label debajo.
- Tap → sheet de edición existente.
- Trend arrow (↑/↓) según semana anterior (placeholder si no hay data).

### 9. Aprender
- Se mantiene. Card editorial de entrada + carruseles al expandir. Sin cambios internos.

### 10. Coach IA
- Chips horizontales al final con recomendaciones proactivas + acción directa (crear tarea desde chip, abrir socIA).
- Copy motivacional, no descriptivo ("Cierra tu P0 antes de las 12 y libera la tarde", no "Tienes 1 tarea urgente").

## Sistema visual

- Fondo: `#000` puro. Cero azul aurora.
- **Acentos vivos** (reservados, no dispersos):
  - Verde momentum `#4ADE80` — hechas, progreso positivo.
  - Ámbar `#F5B944` — en riesgo, racha.
  - Rojo `#F87171` — urgencia, vencidas.
  - Blanco puro — foco, CTA primario.
- Único gradiente permitido: `radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 60%)` en el héroe.
- Tipografía: Bai Jamjuree para TODO número/tiempo/%; Geist para texto UI.
- Radios 20px cards grandes, 14px cards secundarias, 999px pills.
- Micro-animaciones con `framer-motion`: CountUp en Momentum, flip en Next Move al completar, spring en Ring y anillos de metas al montar.

## Cambios técnicos

- Archivo: `src/components/MeScreen.tsx` — reescritura del render principal + nuevos sub-componentes:
  - `DayRing`, `NextMoveHero`, `MomentumStrip`, `HorizontalTimeline`, `MissionCard`, `ProjectFlightCard`, `GoalRing`, `CoachStrip`.
- Se **elimina** el `DayTimeline` vertical actual y el `FocusRibbon`.
- Se **conservan y reusan** todos los sheets existentes (TaskSheet, EventSheet, ProjectSheet, GoalSheet) y todos los hooks (`useMe`, `useFinance`, `useInventory`).
- Se conservan `WeekGantt` (para toggle Semana) y todo `LearnView`.
- Cero migraciones, cero cambios de backend, cero cambios fuera de MeScreen.

## Fuera de alcance
- No toca Home, Negocio ni el interior de Aprender.
- No añade tracking de tiempo real ("foco" se calcula desde tareas con hora completadas, no un timer).
- La racha se calcula desde `todos` con `done` de días previos (client-side por ahora).

## Resultado esperado
Abres Productividad y ves inmediatamente: **qué hacer ahora** (héroe), **cuánto llevas** (momentum + ring), **qué viene en el día** (franja horizontal), y luego misiones, proyectos, metas y aprender apilados con densidad viva. Sensación de central ejecutiva, no de libreta.
