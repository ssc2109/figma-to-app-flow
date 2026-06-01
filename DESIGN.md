# Trax — Design System

> Contrato visual de la app. **Toda pantalla nueva debe cumplir este documento.**
> Si algo no está aquí, improvisar con el mismo lenguaje. Si hay referencia de Google Stitch, esa manda — pero se normaliza a estos tokens antes de portarla al código.

---

## 0. Filosofía

**Dark-first, premium, calmado.** Lenguaje visual de fintech moderna (Revolut, Linear, Arc), no de POS tradicional. El negro es el lienzo; todo lo demás se gana su espacio respirando sobre él.

Tres palabras guía: **silencioso · preciso · confiable.**

Reglas no negociables:
1. Fondo **negro puro `#000000`** — nunca `#0A0A0A` ni grises.
2. Solo dos familias tipográficas: **Geist** (texto) y **Bai Jamjuree** (números + headings de sección).
3. Acento de marca = **blanco bien usado**. Sin morados, azules saturados ni gradientes de marca.
4. Color **solo** para semántica: verde = ingreso, rojo = egreso.
5. Esquinas suaves (radios 16–24px). Nada cuadrado-duro.
6. Jerarquía por **escala tipográfica + opacidad**, no por color.

---

## 1. Color tokens

### Superficies
| Token | Valor | Uso |
|---|---|---|
| `bg/base` | `#000000` | Fondo de toda la app |
| `surface/1` | `rgba(255,255,255,0.04)` → `0.06` | Cards, inputs, tabs, botones circulares |
| `surface/2` | `rgba(255,255,255,0.08)` → `0.10` | Cards elevados, hover, AI card |
| `border/hairline` | `rgba(255,255,255,0.06)` → `0.10` | Bordes 1px en cards |

### Texto
| Token | Valor | Uso |
|---|---|---|
| `text/primary` | `#FFFFFF` | Títulos, números, labels activos |
| `text/secondary` | `rgba(255,255,255,0.60)` | Timestamps, descripciones, "Ver todo" |
| `text/tertiary` | `rgba(255,255,255,0.30–0.50)` | Placeholders, tabs inactivos, iconos secundarios |

### Semántico (confirmado)
| Token | Valor | Uso |
|---|---|---|
| `accent/positive` | `#4ADE80` (verde lima suave, tipo Tailwind `green-400`) | Ingresos `+S/`, estados de éxito, indicadores positivos |
| `accent/negative` | `#F87171` (rojo coral suave, tipo Tailwind `red-400`) | Egresos `-S/`, errores, deudas |

> Ambos verdes/rojos son **desaturados** para no romper la calma del dark mode. Nunca usar `#00FF00` ni `#FF0000`.

### Reservado
- **Acento de marca:** sin definir. Por ahora blanco. Cuando exista, se reservará para CTAs primarios únicos (no para decorar).

---

## 2. Tipografía

Dos familias, roles **estrictos**:

- **Geist** → todo texto (UI, labels, descripciones, botones, navegación, body).
- **Bai Jamjuree** → solo **números** y **headings de sección** (montos, contadores, "Para ti hoy", "Actividad Reciente", logo "Trax").

### Escala

| Rol | Familia | Tamaño | Peso | Tracking | Uso |
|---|---|---|---|---|---|
| Display hero | Bai Jamjuree | 64px | 700 Bold | -1.6 | Monto principal del día |
| Display moneda | Bai Jamjuree | 32px | 500 Medium | -1.6 | Símbolo `S/` junto al display |
| H1 saludo | Geist | 20px | 500 Medium | -0.5 | "Buenos días, Alberto" |
| H2 sección | Bai Jamjuree | 20px | 600 SemiBold | 0 | "Para ti hoy", "Actividad Reciente" |
| Logo | Bai Jamjuree | 20px | 700 Bold | -0.5 | "Trax" |
| Body / título de card | Geist | 16px | 500 Medium | 0 | "Rosa, hoy es un buen día…" |
| Botón principal | Geist | 16px | 700 Bold | 0 | "Carrito", CTAs |
| Input / placeholder | Geist | 16px | 400 Regular | 0 | Búsqueda |
| Subtítulo de card | Geist | 14px | 500 Medium | 0 | "Venta Mostrador" |
| Monto en row | Bai Jamjuree | 16px | 700 Bold | 0 | "+S/ 120.00" |
| Label / acción | Geist | 14px | 400 Regular | 0 | "Cobrar", "Fiar", "Escanear" |
| Eyebrow grande | Geist | 14px | 500 Medium | +1.4 uppercase | "VENTAS DE HOY", "TRAX AI" |
| Timestamp / meta | Geist | 12px | 400 Regular | 0 | "Hoy, 10:42 AM" |
| Eyebrow pequeño | Geist | 12px | 500 Medium | +0.6 uppercase | "Ecoarom" |
| Nav tab | Geist | 11px | 400 Regular | 0 | "Inicio", "Ventas", "Negocio", "Crecer" |
| Badge / micro | Geist | 10–11px | 500–700 | 0 | Contador "12", stock |

### Reglas de uso
- **Tracking negativo** (-0.5 a -1.6) en displays grandes.
- **Tracking positivo** (+0.6 a +1.4) + uppercase en eyebrows.
- **Nunca** usar Bai Jamjuree para texto descriptivo o párrafos.
- **Nunca** usar Geist para el monto display grande.

---

## 3. Espaciado y grilla

- **Mobile-first**, ancho máximo del contenido: **430px**, centrado.
- **Padding lateral global: 16px** (excepción: hero puede ir a 20px).
- **Padding interno de cards: 16px** (a veces 20px en eje Y).
- **Gap entre cards apiladas: 12px.**
- **Gap entre secciones grandes: 32–40px.**
- **Bottom safe-area: 180px** (para que no tape la nav flotante).

Ritmo vertical generoso. **La app respira.** Antes de apretar contenido para meter más, preferir scroll.

Escala de spacing recomendada (múltiplos de 4): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`.

---

## 4. Forma y radio

| Elemento | Radio |
|---|---|
| Cards | **20–24px** |
| Bottom nav flotante | 24–28px |
| Inputs | 16–20px |
| Botones / píldoras | `9999px` (full pill) o 16px |
| Iconos circulares | 50% (círculo) — diámetro 40–44px |
| Badges pequeños | `9999px` |

**Prohibido:** radios de 4–8px (se sienten antiguos y rompen el lenguaje).

---

## 5. Elevación y profundidad

- **Sin shadows duros.** La elevación se logra con **diferencia de opacidad de superficie** (`surface/1` vs `surface/2`) + un border hairline de 1px.
- **Hero glow:** detrás del monto display, un `radial-gradient` blanco al **8–12% de opacidad** que se desvanece. Esto "ilumina" el número desde adentro — es la firma visual de la app.
- **Bottom nav flotante:** sí lleva sombra suave + blur:
  - `box-shadow: 0 8px 32px rgba(0,0,0,0.6)`
  - `backdrop-filter: blur(20px)` con fondo `rgba(20,20,20,0.8)`.

---

## 6. Iconografía

- **Estilo:** outline, **stroke 1.5–2px**, esquinas redondeadas.
- **Librería sugerida:** Lucide (default) o Phosphor Regular. Mantener una sola voz geométrica.
- **Tamaño base:** 20–24px dentro de círculos de 40px.
- **Color:** blanco sólido. Si el ícono es secundario, bajar opacidad — no cambiar color.
- **Prohibido:** íconos rellenos, colores, gradientes, ilustraciones 3D.

---

## 7. Componentes (catálogo)

### 7.1 Eyebrow + Hero number
Eyebrow uppercase pequeño + número gigante debajo. Contraste de escala (14px → 64px) = firma visual.
```
VENTAS DE HOY        ← Geist Medium 14px uppercase tracking +1.4 op 60%
S/  1.25K            ← Bai Jamjuree (32 + 64) Bold tracking -1.6
[radial glow blanco 10% detrás]
```

### 7.2 Activity Row (el componente más reusable)
```
[icono ⊙ 40px] [Título 14px Medium]                    [Monto Bai Jamjuree Bold 16px]
               [Timestamp 12px Regular 60% opacity]
```
- Fondo: `surface/1`
- Radio: 20px
- Padding: 16px
- Gap entre rows: 12px

### 7.3 Section header
```
Actividad Reciente                          [Ver todo →]  ← opcional
```
- Título: Bai Jamjuree SemiBold 20px
- Alineado izquierda
- Margen inferior: 16px
- "Ver todo" (si existe): Geist Regular 14px, opacidad 60%

### 7.4 AI card
- Fondo: `surface/2` (un poco más visible)
- Border: hairline
- Eyebrow: `✨ TRAX AI` (Geist SemiBold 14px tracking +0.7 uppercase)
- Body: Geist Medium 16px
- Chevron `>` a la derecha, opacidad 50%

### 7.5 Quick action button
- Círculo 56px, fondo `surface/1`
- Ícono blanco 24px centrado
- Label debajo: Geist Regular 14px, centrado
- Fila de 4 con `justify-between`

### 7.6 Bottom nav flotante
- **Flotante**, separada 32px del borde inferior
- Ancho: `100% - 32px`, max **398px**, alto **80px**
- Fondo: `rgba(20,20,20,0.85)` + `backdrop-blur(20px)`
- Radio: 24–28px
- Tab activo: texto blanco opacidad 1 + **dot blanco 4px** debajo del ícono
- Tab inactivo: texto blanco opacidad 0.5

### 7.7 Floating cart bar (Ventas)
- Píldora flotante por encima de la nav
- Fondo blanco sólido o `surface/2` muy elevado
- Contador con badge circular pequeño

### 7.8 Search input
- Fondo `surface/1`, radio 16–20px, altura 48px
- Ícono lupa 20px izquierda, opacidad 50%
- Placeholder: Geist Regular 16px opacidad 30%

### 7.9 Filter chip / category pill
- Píldora 9999px, padding 8×16
- Activa: fondo blanco, texto negro
- Inactiva: fondo `surface/1`, texto blanco opacidad 70%

---

## 8. Estados e interacción

- **Activo / inactivo** se comunica con **opacidad**, no con color:
  - Activo: `opacity: 1`
  - Inactivo: `opacity: 0.5`
- **Press feedback:** `active:scale-95` + transición **150ms ease-out**. Sin ripple.
- **Hover** (cuando aplica, sobre todo desktop): `surface/1` → `surface/2`.
- **Disabled:** `opacity: 0.3`, sin cursor pointer.
- **Loading:** skeleton con `surface/1` pulsando entre `0.04` y `0.10` de opacidad.

---

## 9. Motion

- **Curva default:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out).
- **Duraciones:** micro 150ms · estándar 250ms · transición de pantalla 350ms.
- **Transiciones de pantalla:** fade + slide-up sutil (8–12px).
- **Números que cambian:** preferir tick suave (no flip dramático).
- **Sin** parallax exagerado, sin animaciones rebotantes, sin confetti.

---

## 10. Tono de copy

- **Tutea siempre:** "Buenos días, Alberto", "Hoy tienes 3 cosas que cuidar".
- **Frases cortas, cálidas, directas.** Nunca corporativo, nunca formal.
- **Formato moneda Perú:** `S/ 120.00` (con espacio).
- **Miles abreviados** en displays grandes: `1.25K`, `3.4M`.
- **Timestamps en lenguaje natural:** "Hoy, 10:42 AM" · "Ayer, 04:30 PM" · "Hace 5 min".
- **Signo en montos:** `+S/ 120.00` (verde), `-S/ 350.00` (rojo). El signo va antes del símbolo.

---

## 11. Layout patrones por tipo de pantalla

### Pantalla tipo "Resumen / Home"
1. Header (16px lateral, 20px superior): logo o eyebrow + saludo
2. Hero block con número display + acciones rápidas
3. Section: "Para ti hoy" con AI card
4. Section: "Actividad Reciente" con activity rows
5. Bottom safe-area 180px

### Pantalla tipo "Lista / Catálogo" (Ventas)
1. Header con logo + iconos a la derecha (búsqueda, perfil)
2. Search input
3. Filtros (chips horizontales scrollables)
4. Grid 2-col o lista vertical de cards
5. Floating cart bar
6. Bottom nav

### Pantalla tipo "Detalle"
1. Header con back button (chevron-left círculo) + título + acción
2. Hero del item (imagen / número grande)
3. Bloques de información en cards apiladas
4. CTA fijo abajo (pill blanca grande)

### Pantalla tipo "Formulario"
1. Header con back + título
2. Inputs apilados con gap 16px
3. Labels arriba del input (Geist Medium 12px uppercase tracking +0.6 op 60%)
4. CTA primario abajo, fijo o al final

---

## 12. Sobre Google Stitch

Stitch genera con un dialecto Material 3 oscurecido + ajustes Figma Make. Encaja bien con este sistema **siempre que al portar**:

1. ✅ Sustituir fuentes por Geist + Bai Jamjuree según el rol.
2. ✅ Fondo a negro puro `#000000` (Stitch suele dar `#0F0F0F`).
3. ✅ Quitar cualquier acento de color saturado (morados, azules) que meta por defecto.
4. ✅ Llevar radios de cards a 20–24px.
5. ✅ Reemplazar shadows duros por hairline + surface elevation.
6. ✅ Verde/rojo solo si es semántico (ingreso/egreso/éxito/error).

Si el usuario manda screenshots de Stitch, **se respeta la composición** (layout, jerarquía, posición de elementos) pero se normaliza el sistema visual a estos tokens.

---

## 13. Checklist antes de entregar una pantalla nueva

- [ ] Fondo `#000000`
- [ ] Solo Geist y Bai Jamjuree, con los roles correctos
- [ ] Padding lateral 16px, max-width 430px
- [ ] Cards con radio 20–24px y `surface/1`
- [ ] Sin colores saturados salvo verde/rojo semánticos
- [ ] Bottom safe-area 180px si la nav está visible
- [ ] Eyebrows uppercase con tracking positivo
- [ ] Displays con tracking negativo
- [ ] Iconos outline 1.5–2px, blancos
- [ ] Tap targets ≥ 44×44px
- [ ] Estados activo/inactivo por opacidad
- [ ] Copy en español, tuteando, cálido

---

*Documento vivo. Actualizar cuando se reserve el color de acento de marca o se agreguen patrones nuevos.*
