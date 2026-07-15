
# Upgrade total: Configuración profesional

## Diagnóstico del estado actual
`src/components/SettingsScreen.tsx` es una sola pantalla de 565 líneas con 5 secciones apiladas (Perfil, Operaciones, Preferencias, Suscripción, Cuenta). No hay búsqueda, no hay subpantallas, no hay categorías modernas (seguridad, sesiones, dispositivos, datos, facturación, equipo, apariencia, notificaciones granulares, ayuda, legales). Se siente a proyecto de estudiante: útil, pero plano.

## Referencias del nicho
- **Revolut / Wise**: Settings hub con avatar hero + tarjetas de categoría. Cada categoría abre subpantalla con push transition. Chevrons a la derecha. Estados y valores actuales visibles en la fila (right-aligned).
- **Linear / Notion**: Búsqueda global de ajustes en el tope. Agrupación por dominio (Account · Workspace · Preferences · Billing · Advanced). Copy corto, con descripción secundaria bajo cada fila.
- **Stripe Dashboard / Shopify Mobile**: sección de facturación con estado de plan como banner destacado, uso del ciclo actual, y "Danger zone" separada.
- **Apple Settings**: fila con icono a color, título + valor actual truncado a la derecha, chevron. Nunca formularios inline en el hub — siempre subpantalla.

## Arquitectura de navegación
Un **hub** + **subpantallas** con transición push (usando el patrón `ScreenTransition` ya existente). El hub se ve como un índice, no como formulario.

```text
Configuración (hub)
├── Buscar en ajustes           (barra al tope, filtra filas de hub y subpantallas)
├── [Card hero perfil]          Avatar + nombre + email + plan actual + edit
│
├── CUENTA
│   ├── Perfil personal         (nombre, avatar, teléfono, idioma)
│   ├── Correo y contraseña     (cambio de email/pw, verificación)
│   └── Sesiones y dispositivos (cerrar sesión de otros dispositivos)
│
├── NEGOCIO
│   ├── Ficha del negocio       (nombre, tipo, RUC, dirección, horario)
│   ├── Moneda y formato        (moneda, separadores, zona horaria)
│   ├── Metas y umbrales        (meta diaria, stock crítico, alerta fiados)
│   └── Equipo                  (invitar, roles — placeholder "Próximamente" real)
│
├── APARIENCIA Y ACCESIBILIDAD
│   ├── Tema                    (Oscuro / Auto — sistema)
│   ├── Tamaño de texto         (Compacto / Normal / Grande)
│   └── Reducir movimiento
│
├── NOTIFICACIONES
│   ├── Push del dispositivo    (master switch + estado permiso)
│   ├── Alertas de negocio      (stock, fiados vencidos, meta, resumen diario, backup)
│   └── Correo                  (resumen semanal, cambios de plan)
│
├── SOCIA (IA)
│   ├── Uso de créditos         (barra de consumo del ciclo, reset)
│   ├── Tono de respuestas      (formal / cercano)
│   └── Historial de chats      (limpiar, exportar)
│
├── FACTURACIÓN
│   ├── [Banner plan actual]    Plan, precio, días de prueba/renovación
│   ├── Cambiar plan            (abre PlansScreen existente)
│   ├── Método de pago          (placeholder integrado con Culqi)
│   └── Historial de facturas
│
├── DATOS
│   ├── Exportar todo           (JSON + Excel — reusa lógica de InfoView Avanzado)
│   ├── Importar productos      (CSV)
│   └── Copia de seguridad      (info del último backup automático)
│
├── AYUDA Y SOPORTE
│   ├── Centro de ayuda         (link externo)
│   ├── Contactar soporte       (mailto/whatsapp)
│   ├── Reportar un problema
│   └── Novedades               (changelog)
│
├── LEGAL
│   ├── Términos de servicio
│   ├── Privacidad
│   └── Licencias open source
│
├── ACERCA DE
│   ├── Versión de la app
│   └── Estado del sistema
│
└── ZONA DE PELIGRO             (visualmente separada, borde tenue rojo)
    ├── Cerrar sesión
    └── Eliminar cuenta         (con confirmación por texto)
```

## Diseño visual (respetando DESIGN.md)
- **Superficies**: `rgba(255,255,255,0.04)` con hairline `rgba(255,255,255,0.06)`, radio 20px. Sin sombras.
- **Tipografía**: Geist para labels y descripciones, Bai Jamjuree para valores numéricos y títulos de sección.
- **Iconos**: `lucide-react`, stroke 1.7, en cuadrado 34px con fondo `rgba(255,255,255,0.05)`. Solo la "zona de peligro" usa tint `#F87171`.
- **Fila hub estándar**: `[icon 34] [title + descripción 12px/40 opacidad] [valor actual truncado, right-aligned, tabular-nums cuando sea número] [chevron 14px/30 opacidad]`.
- **Card hero de perfil**: avatar 72px, nombre en Bai Jamjuree 20px, email 12.5px/45, y chip del plan actual (Gratis/Pro/Avanzado) con `usePlan`.
- **Banner de plan** en Facturación: full-width, con progreso de créditos socIA cuando aplica, CTA sutil "Cambiar plan".
- **Search bar** sticky bajo el header: filtra tanto títulos de fila como palabras clave (aliases: "clave" → contraseña, "backup" → copia de seguridad, etc.).
- **Transiciones**: reusar `ScreenTransition` con dirección `push`. Header de subpantalla con `ArrowLeft`, título en Bai Jamjuree 18px, breadcrumb corto "Ajustes · Cuenta".
- **Guardado**: en subpantallas, footer sticky con "Cancelar" y "Guardar cambios" (mismo patrón que `InfoView`). Autosave silencioso para toggles.
- **Estados vacíos y disabled**: filas con "Próximamente" en 11px uppercase, opacidad 40, sin chevron.

## Estructura de archivos
```text
src/components/settings/
├── SettingsHub.tsx              (nuevo, reemplaza SettingsScreen)
├── SettingsSearch.tsx           (barra + índice indexable)
├── shared/
│   ├── SettingsShell.tsx        (header + footer sticky reutilizable)
│   ├── SettingsRow.tsx          (fila estándar con valor + chevron)
│   ├── SettingsSection.tsx      (título uppercase + card)
│   ├── DangerRow.tsx
│   └── PlanChip.tsx
├── screens/
│   ├── ProfileScreen.tsx
│   ├── EmailPasswordScreen.tsx
│   ├── SessionsScreen.tsx
│   ├── BusinessInfoScreen.tsx
│   ├── CurrencyFormatScreen.tsx
│   ├── GoalsThresholdsScreen.tsx
│   ├── TeamScreen.tsx
│   ├── AppearanceScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── SociaSettingsScreen.tsx
│   ├── BillingScreen.tsx
│   ├── DataScreen.tsx
│   ├── SupportScreen.tsx
│   ├── LegalScreen.tsx
│   ├── AboutScreen.tsx
│   └── DangerZoneScreen.tsx
└── index.ts
```
`SettingsScreen.tsx` original se convierte en un shim que renderiza `SettingsHub` para no romper imports de `Container.tsx` / `TraxNavigation.tsx`.

## Estado y persistencia
- Se reusa `useAuth` + `profiles`, `useInventory`, `usePlan`, `useSubscription`, `useUsageCounters`.
- Nuevas preferencias (tema, tamaño de texto, reducir movimiento, tono socIA, notificaciones granulares) se guardan como JSON en columna `preferences` de `profiles`. Migración: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;` con GRANTs ya existentes de profiles.
- Cambio de email/contraseña: `supabase.auth.updateUser`. Cerrar otras sesiones: `supabase.auth.signOut({ scope: 'others' })`.
- Exportar: reusa las funciones de export ya construidas en `InfoView`; se mueven a `src/lib/api/data-export.functions.ts` para compartirse.
- Eliminar cuenta: server function con `requireSupabaseAuth` que borra profile + subscripciones + llama a `supabaseAdmin.auth.admin.deleteUser(userId)`. Confirmación por escritura del nombre del negocio.

## Fuera de alcance (no tocar)
- Identidad visual global, tokens de color, tipografía base.
- Lógica de negocio de ventas, socIA, aprender, planes.
- Nada del hub Home / MeScreen / SociaScreen.

## Verificación
1. Build limpio (`tsgo`).
2. Playwright: capturas de hub, subpantalla Perfil, subpantalla Facturación, búsqueda con "contraseña", zona de peligro con confirmación abierta.
3. Verificar en 390x844 que no haya overflow horizontal y que el footer sticky no tape contenido con la barra de navegación inferior (usar 180px de safe-area).

---
**Nota técnica**: la navegación entre hub y subpantallas se maneja con estado local + `ScreenTransition` para mantener el patrón mobile-first existente y no añadir rutas nuevas al router.
