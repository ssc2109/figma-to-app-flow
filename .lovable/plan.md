## Métodos finales
1. **Google** (ya activo).
2. **Apple** — botón mostrado solo en iOS/macOS (detección UA). Se habilita en Cloud con `configure_social_auth`.
3. **Correo + contraseña** — cuenta clásica.
4. **OTP por SMS** — el usuario ingresa su celular, recibe código de 6 dígitos por SMS, entra. Auth de teléfono nativo de Supabase + Twilio como proveedor (ya hay conector oficial `standard_connectors`).

## Backend

- `supabase--configure_social_auth` → `providers: ["apple", "google"]` (sin desactivar email).
- `standard_connectors--connect twilio` → linkea la conexión Twilio, expone `TWILIO_API_KEY`, `TWILIO_ACCOUNT_SID`, y `TWILIO_PHONE_NUMBER` como env vars.
- Configurar Supabase Phone Auth con Twilio: como Lovable Cloud no expone la UI de Supabase, se hace vía llamada Admin API en un pequeño script server-fn (`configurePhoneAuth`) que corre una vez desde el panel; alternativamente, si `configure_auth` no soporta phone provider hoy, se implementa el OTP a mano — Trax genera y valida el código, y solo usa Twilio para el envío. **Voy con la ruta manual** para no depender de configs no expuestas:
  - Nueva tabla `phone_otps(id, phone text, code_hash text, expires_at, attempts, consumed_at, created_at)` con RLS server-only.
  - Server fn `requestPhoneOtp({ phone })`: rate-limit (1 código/60s, 5/hora por número), genera código 6 dígitos, guarda hash bcrypt, envía por Twilio (`/Messages.json`).
  - Server fn `verifyPhoneOtp({ phone, code })`: valida, incrementa attempts (bloqueo a 5), consume, y usa `supabaseAdmin.auth.admin` para: (a) buscar user por phone, (b) crear si no existe, (c) generar sesión (`generateLink` type `magiclink` + intercambio, o `admin.createUser` + `signInWithPassword` interno). Devuelve tokens que el cliente aplica con `supabase.auth.setSession`.
- Ajustar trigger `handle_new_user` para tolerar signups sin metadata (ya lo hace con COALESCE — verificado).
- Nueva tabla `password_resets` no requerida (Supabase maneja `resetPasswordForEmail`).
- Habilitar `password_hibp_enabled: true` en `configure_auth` (fortaleza sin costo).

## Estructura UX — 3 subpantallas con transición horizontal

**SignInScreen** (default)
```
        [logo trax]

     Bienvenido de vuelta

 [🍎 Continuar con Apple]      ← solo iOS/macOS
 [G  Continuar con Google]

 ────── o entra con ──────

 [ 📧 Correo ] [ 📱 Celular ]  ← toggle segmentado
    ─── panel según selección ───
    Correo:                        Celular:
    [ tu@correo.com     ]           [ +51 987 654 321 ]
    [ ••••••••          ]           [    Enviar código  ]
    [    Entrar         ]
    ¿Olvidaste tu contraseña?

 ───────────────────────────

 ¿Nuevo en Trax? Crear cuenta →
```

**SignUpScreen** — mismo layout, sin "olvidaste contraseña", copy "Crear cuenta" + legal.

**OtpScreen** — cuando eligen celular:
- 6 casillas de código (`InputOTP` de shadcn ya disponible).
- Countdown 60s + "Reenviar código".
- "Cambiar número" arriba.

**ForgotPasswordScreen** + ruta `/reset-password` para el flujo completo.

## Archivos

**Modificar**
- `src/components/AuthScreen.tsx` — reescritura completa; container de subpantallas con `AnimatePresence`.
- `src/routes/[.]lovable.oauth.consent.tsx` — swap wordmark por logo real.

**Crear**
- `src/components/auth/SignInView.tsx`
- `src/components/auth/SignUpView.tsx`
- `src/components/auth/OtpView.tsx`
- `src/components/auth/ForgotPasswordView.tsx`
- `src/components/auth/shared.tsx` — Field, AppleIcon, GoogleIcon, PhoneIcon, primitives.
- `src/routes/reset-password.tsx` — ruta pública.
- `src/lib/auth/phone-otp.functions.ts` — `requestPhoneOtp`, `verifyPhoneOtp`.
- `src/assets/trax-logo-wordmark.png.asset.json` — vía `lovable-assets create` desde `/mnt/user-uploads/Trax-_Kit_de_logo_16-3.png`.
- Migración SQL para `phone_otps` (GRANT solo a service_role, RLS ON, sin policies para anon/authenticated).

## Diseño

- Negro puro, hairlines `rgba(255,255,255,0.08)`, cards `rgba(255,255,255,0.04)`.
- Logo `h-[52px] object-contain`, margin-bottom 32px.
- Apple/Google botones equivalentes (fondo `rgba(255,255,255,0.06)`, border hairline, icono a la izquierda).
- Toggle correo/celular tipo segmented (patrón iOS), altura 44px.
- InputOTP: casillas 48x56px, gap 8px, radio 12px, Bai Jamjuree para dígitos.
- Motion: subpantallas con slide horizontal 200ms + fade; entrada de la card con `y: 12 → 0` 350ms.

## Verificación (Playwright)
1. `/` renderiza → logo real, no wordmark texto.
2. Toggle a "Celular" → aparece input phone.
3. Enviar código con número dummy → server fn responde OK (mockeable) → aparece OtpScreen con 6 casillas.
4. Botón "Crear cuenta" → slide a SignUpView, sin campos de negocio/nombre.
5. UA iOS mock → Apple visible; UA Android → Apple oculto.
6. Screenshots de las 4 pantallas para review.

## Fuera de scope
- No toco `OnboardingFlow` (business_name/owner_name se piden ahí).
- No toco `usePlan` ni suscripciones.
- No implemento WhatsApp OTP (Twilio SMS es suficiente y más barato para Perú con ruta A2P local).
