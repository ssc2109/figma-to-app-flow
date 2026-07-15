## Objetivo

Que cada control de Ajustes **realmente cambie el comportamiento de Trax**, no solo lo guarde. Hoy Apariencia, Notificaciones, socIA e Idioma se persisten en `profiles.preferences` pero ninguna otra parte del código los lee. Este plan cierra ese hueco.

## Auditoría (qué funciona vs qué falta)

| Pantalla | Guarda | Se aplica en la app |
|---|---|---|
| Perfil personal (nombre, foto, teléfono) | ✅ | ✅ |
| Idioma | ✅ (`prefs.language`) | ❌ (nada lo lee) |
| Correo y contraseña | ✅ | ✅ |
| Sesiones (cerrar otras/actual) | ✅ | ✅ |
| Ficha del negocio + horarios + datos fiscales | ✅ | ✅ |
| Moneda | ✅ | ✅ (formatters ya la usan) |
| Metas y umbrales | ✅ | ✅ |
| Equipo | — | Placeholder deliberado |
| **Apariencia** (tema, tamaño texto, reducir movimiento) | ✅ | ❌ |
| **Notificaciones** (maestro + 4 tipos + correo) | ✅ | ❌ (nadie las consulta) |
| **socIA** (tono, "ver conversaciones", borrar historial) | Parcial | Tono no viaja al servidor; "Ver conversaciones" no navega |
| Datos y privacidad (exportar / eliminar) | ✅ | ✅ |
| Ayuda y legal | ✅ | ✅ |

## Cambios

### 1) Provider central de preferencias
Nuevo `src/hooks/usePreferences.tsx` que lee `profile.preferences` y expone:
`{ theme, textSize, reduceMotion, sociaTone, notifMaster, notifStock, notifDebts, notifGoal, notifSummary, notifEmailWeekly, language }`, ya con defaults.

Nuevo `src/components/PreferencesEffects.tsx` (montado en `__root.tsx`) que aplica en tiempo real:
- **Tema**: `dark` fuerza `.dark` en `<html>`; `auto` sigue `prefers-color-scheme`.
- **Tamaño de texto**: setea `document.documentElement.style.fontSize` (compact 14.5px / normal 16px / large 17.5px) y una CSS var `--text-scale` para que Tailwind escale.
- **Reducir movimiento**: añade clase `reduce-motion` en `<html>`; en `src/styles.css` esa clase corta `transition`/`animation`/duraciones a `0.01ms` y desactiva Framer `motion` vía `MotionConfig reducedMotion="always"` cuando esté activo.

### 2) Notificaciones que sí notifican
Nuevo helper `src/lib/notify.ts` con `notifyBusiness({ kind: "stock"|"debts"|"goal"|"summary", title, body })` que:
- Respeta el switch maestro (`notifications_enabled`) y el switch por tipo (`prefs.notif_*`).
- Muestra `toast` (sonner) siempre que esté permitido.
- Si el navegador soporta `Notification` y el usuario dio permiso, dispara también notificación nativa.
- Añade botón "Activar notificaciones del sistema" en la pantalla de Notificaciones que llama a `Notification.requestPermission()`.

Puntos de llamada que se enganchan al helper (sustituyen `toast.*` sueltos):
- **Stock crítico**: en `useInventory` cuando un producto baja de `low_stock_threshold` (ya existe la lógica, cambiamos su emisión).
- **Fiado vencido**: en el fetch de fiados / briefing (`briefing.functions.ts` ya detecta vencidos → agregamos aviso al abrir Inicio).
- **Meta diaria alcanzada**: en `useFinance` cuando `ventasHoy >= daily_goal`.
- **Resumen del día**: al abrir Inicio si son ≥ 20:00 hora local y aún no se mostró hoy (flag en `localStorage`).

### 3) socIA
- `SettingsScreen` pasa `openThreads={() => { onBack(); onOpenSocia?.(); }}` a `SociaSettingsScreen`. `TraxNavigation` expone `onOpenSocia` que cambia la tab activa a `socia` y abre el panel de hilos.
- El **tono** viaja al backend: en `AIChat` (o donde se llame `chatCompletion`) se lee `usePreferences().sociaTone` y se envía como campo `tone`. En `src/routes/api/chat.ts` se concatena al `SYSTEM_PROMPT` una línea:  
  `cercano` → "Habla en tono cercano, cálido, con emojis moderados."  
  `formal` → "Habla en tono profesional, sin emojis, frases breves."

### 4) Idioma
El selector de idioma solo cambia formateo regional (no traducción). `usePreferences` expone `locale` (`es-PE` / `en-US` / `pt-BR`) y los formatters (`src/lib/format.ts`) usan ese locale para números y fechas. Agrego nota inline: "Trax mostrará números y fechas con este formato."

### 5) Copy y microdetalles
- Elimino la nota "opcional" engañosa donde el control ya se aplicaba.
- El botón "Ayuda y legal → Acerca de Trax" abre modal con versión + build.

## Detalles técnicos

Archivos nuevos:
- `src/hooks/usePreferences.tsx`
- `src/components/PreferencesEffects.tsx`
- `src/lib/notify.ts`

Archivos editados:
- `src/routes/__root.tsx` — monta `<PreferencesEffects />` y `<MotionConfig>`.
- `src/styles.css` — bloque `.reduce-motion *` y variables de tamaño.
- `src/components/settings/PreferencesScreens.tsx` — botón permiso de notificaciones + fix cableo threads.
- `src/components/SettingsScreen.tsx` — recibe `onOpenSocia`, lo propaga.
- `src/components/TraxNavigation.tsx` — provee `onOpenSocia` (cambia tab + abre historial).
- `src/components/SociaScreen.tsx` — acepta prop `initialPanel="threads"`.
- `src/components/AIChat.tsx` — envía `tone` al backend.
- `src/routes/api/chat.ts` — inyecta línea de tono en `SYSTEM_PROMPT`.
- `src/data/inventory.ts`, `src/data/finance.ts`, `src/lib/api/briefing.functions.ts` — usan `notifyBusiness` para stock/meta/fiado/resumen.
- `src/lib/format.ts` — usa `locale` del hook.

Sin cambios de base de datos: `preferences jsonb` ya existe con todo lo que necesitamos.

## Verificación
1. Cambiar tema a `auto` con el SO en claro → fondos no cambian (Trax es dark-first) pero se documenta.
2. Tamaño `Grande` → todo el texto crece proporcionalmente sin romper layout.
3. Reducir movimiento activo → transiciones de pantalla y aurora se pausan.
4. Apagar switch maestro de notificaciones → no salen toasts de stock ni banners nativos.
5. Cambiar tono a "Formal" → primera respuesta de socIA se nota más seca, sin emojis.
6. "Ver mis conversaciones" desde Ajustes → abre socIA con el panel de hilos.
