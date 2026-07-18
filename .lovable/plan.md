# Plan — Rediseño funcional de Ajustes

**Regla dura:** no toco `auth/*` (SMS/Twilio), catálogo, inventario, ni ninguna lógica fuera de lo listado abajo.

---

## 1. Interacciones generales

**`src/components/settings/shared.tsx`**
- `Toggle`: revisar `translateX`. El track avanza a la derecha cuando `value=true`, pero el knob visualmente parece invertido con ciertos anchos → alinear a `translateX(20px|2px)` con `left-0` explícito, y añadir transición coherente (`transition-transform duration-200 ease-out`). Verificar también `SegmentedControl` si aplica.

## 2. Perfil Personal (`AccountScreens.tsx > ProfileScreen`)

- **Teléfono:** dividir en `<CountryCodeSelect />` (dropdown con +51, +1, +52, +54, +56, +57, +58, +34, etc.) + input con `inputMode="numeric"`, `pattern="[0-9]*"` y filtro `value.replace(/\D/g,'')`. Longitud 6-15. Guardar como E.164 (`${code}${digits}`).
- **Idiomas:** eliminar el row/select. Fijar `locale='es'` en profile default; no exponer UI.

## 3. Cuenta

- **Duplicado "Perfil personal"** dentro de `SettingsHub` → eliminar de la sección "Cuenta" (ya está arriba como avatar/nombre). Verificar en `SettingsHub.tsx`.
- **Reset password:**
  - Bug: el link llega a la app pero `/reset-password` responde 404 o queda bloqueado.
  - Revisar `src/routes/reset-password.tsx` — asegurar que:
    - es ruta pública (no bajo `_authenticated`),
    - parsea `type=recovery` desde el hash `#access_token=...&type=recovery`,
    - llama `supabase.auth.setSession()` con los tokens antes de `updateUser({password})`,
    - libera el estado del botón "Reenviar" cuando falla (limpiar `cooldown` en error o al desmontar).
  - En `EmailPasswordScreen`: reset del `sending`/`sent` state para permitir reenvío tras error.
- **Multicuenta + 2FA:**
  - Nueva subvista `AccountsSwitcherScreen` bajo "Sesiones y dispositivos" (o item nuevo "Cambiar de negocio").
  - Tabla nueva `linked_accounts (owner_user_id uuid, member_user_id uuid, business_name text, created_at)` — el usuario puede vincular sesiones adicionales. Al alternar: pedir OTP por SMS al teléfono verificado del negocio destino (reutiliza `phone_otps` + `phone-otp.functions.ts` sin tocarlos, solo consumir).
  - Server fn `switchAccount({targetUserId, otpCode})` que valida OTP y devuelve una nueva sesión (usa `supabaseAdmin.auth.admin.generateLink` tipo `magiclink`, luego el cliente hace `setSession`).

## 4. Negocio (`BusinessScreens.tsx`)

- **BusinessInfoScreen:** los inputs actualmente son display-only o no persisten → habilitar `useState` local + `SaveButton` que hace `update profiles set business_name, business_type, address, ruc, razon_social, direccion_fiscal, actividad_economica` y `refreshProfile()`.
- **Moneda y Formato:** remover el `NavRow` del hub y la subpantalla del switch en `SettingsScreen`. Mantener `currency='PEN'` hardcoded como default en profile. No borrar el archivo por si algo importa el componente — dejar export vacío o quitar la referencia.
- **Metas y Umbrales:**
  - `low_stock_threshold` (ya existe en profile) init default = 10.
  - Consumidores actuales de umbral fijo → buscar (`grep low_stock`) y reemplazar por `useAuth().profile?.low_stock_threshold ?? 10`. Afecta insights de inventario y home.
- **Equipo:** intacto.

## 5. Preferencias (`PreferencesScreens.tsx` + `PreferencesEffects.tsx`)

- **AppearanceScreen:**
  - Eliminar toggle/segmented de tema (fijar `theme='dark'` en `PreferencesEffects`, quitar mql y UI).
  - Eliminar selector de `text_size` (fijar `--text-scale:1`).
  - Conservar `reduce_motion`. Ampliar efecto en `styles.css` para cubrir Framer Motion (`.reduce-motion * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }`) y añadir hook `useReduceMotion()` que lee `profile.preferences.reduce_motion`, y usarlo en `AnimatePresence`/`motion` clave (transiciones de pantalla en `ScreenTransition`, `SettingsScreen`).
- **NotificationsScreen:** al togglear cualquier notificación, dispararla también:
  - **Email** via server fn `sendNotificationEmail` usando Resend/Lovable Emails (¿o mantener sencillo con `supabase.auth.admin` no aplica?). Recomendación: crear server fn `notifyUser(userId, kind, payload)` que:
    1. Inserta en tabla `notifications` (nueva: `id, user_id, kind, title, body, read, created_at`) — esto alimenta el feed interno de socIA en home.
    2. Envía email vía connector (Lovable Emails si está disponible; si no, dejar TODO documentado en la fn con un `console.warn` sin romper).
  - En Home/socIA insight component, leer `notifications` no leídas y renderizarlas.
- **SocIA:** editar el system prompt base en `src/lib/api/briefing.functions.ts` y `src/routes/api/chat.ts` — añadir tono empático, cercano, humano, "acompaña al emprendedor como una socia real". Ajuste sutil, no borrar reglas existentes.

## 6. Plan y Sistema

- **Planes/Suscripciones:**
  - Eliminar cualquier flujo simulado (buscar en `PlansScreen.tsx` / `CheckoutSheet.tsx` botones tipo "activar demo"/"simular pago" y removerlos).
  - En rutas de edición sensibles (crear producto, editar negocio, invitar equipo, etc.), envolver la acción con `usePlan()`: si el plan actual no cubre esa capability → `UpgradeGate` con copy "Requiere plan Pro/Avanzado. Realiza el pago de la suscripción o solicita aprobación del líder de Lovable."
  - Añadir en `SystemScreens.tsx` un card "Estado de permisos" con el plan actual y CTA a `PlansScreen`.

---

## Detalles técnicos

**Nuevas tablas (migración):**
```sql
create table public.notifications (
  id uuid pk default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  kind text not null, -- 'low_stock' | 'daily_goal' | 'debt_due' | 'system'
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);
-- GRANT + RLS por auth.uid()

create table public.linked_accounts (
  id uuid pk default gen_random_uuid(),
  primary_user_id uuid references auth.users(id) on delete cascade not null,
  linked_user_id uuid not null,
  business_name text,
  created_at timestamptz default now(),
  unique(primary_user_id, linked_user_id)
);
-- GRANT + RLS por primary_user_id = auth.uid()
```

**Nuevos archivos:**
- `src/lib/api/notifications.functions.ts` — `notifyUser`, `listNotifications`, `markRead`.
- `src/lib/api/accounts.functions.ts` — `listLinkedAccounts`, `requestAccountSwitchOTP`, `confirmAccountSwitch`.
- `src/hooks/useReduceMotion.ts`
- `src/components/settings/AccountsSwitcherScreen.tsx`

**Archivos editados:**
- `settings/shared.tsx`, `settings/SettingsHub.tsx`, `settings/AccountScreens.tsx`, `settings/BusinessScreens.tsx`, `settings/PreferencesScreens.tsx`, `settings/SystemScreens.tsx`
- `SettingsScreen.tsx` (routing: quitar 'currency', añadir 'accounts')
- `PreferencesEffects.tsx` (fijar dark + text_size)
- `styles.css` (reduce-motion global)
- `routes/reset-password.tsx` (fix callback + hash parse)
- `hooks/useAuth.tsx` (default low_stock_threshold 10 si null)
- `api/briefing.functions.ts`, `routes/api/chat.ts` (prompt empático)
- Componentes que usen umbral hardcoded → leer del profile.

---

## Fuera de alcance (confirmar antes)

- ¿Aprobación de "líder de Lovable" es un email a un buzón concreto o solo copy visual? Voy a implementarlo como copy + CTA a soporte, sin enviar aprobación real (no hay canal definido).
- Envío real de emails: si no hay connector Resend/Mailgun linkeado, dejo la fn preparada con TODO y notificación interna funcionando; el email se activa cuando conectes proveedor.

¿Procedo con este plan tal cual, o ajustamos alguna parte (especialmente multicuenta 2FA y bloqueo por plan)?
