---
name: socIA Assistant
description: Arquitectura de la pantalla de IA — chat con AI SDK, Gemini, orbe shader OGL, threading DB
type: feature
---
**Pantalla:** `src/components/SociaScreen.tsx` (mobile-first 430px).

**Layout (vacío):** header → ShaderOrb (240px) centrado → greeting → chat bar → quick prompts → cards de funciones horizontales.

**Layout (chateando):** header con mini-orb (56px) → mensajes scrollables (pb-[340px]) → chat bar + cards fijos abajo.

**Backend:**
- Tablas: `chat_threads` y `chat_messages` (RLS por user_id, parts jsonb).
- Server fns en `src/lib/api/chat.functions.ts`: list/create/delete/getMessages.
- Streaming route: `src/routes/api/chat.ts` — AI SDK `streamText` con `google/gemini-3-flash-preview` vía Lovable AI Gateway. Autovalida bearer, autocrea hilo, persiste user msg + assistant msg en onFinish, devuelve `X-Thread-Id`.
- System prompt inyecta contexto vivo del negocio (ventas, gastos, fiados, stock crítico) cada request.

**Frontend:**
- `useChat` con `DefaultChatTransport`, headers async leen `supabase.auth.getSession()` cada call.
- Hilos en sheet lateral (drawer) — no en URL para no romper el patrón single-route con bottom-nav.
- Features: foto/escaneo (vision Gemini vía file part), voz (WebSpeech API es-PE), análisis (prompt directo).

**ShaderOrb:** `src/components/socia/ShaderOrb.tsx` — OGL + GLSL custom: simplex fbm, fake lighting con normal de esfera implícita, especular, fresnel, halo. Reacciona a `intensity` (0=idle, 0.55=chat, 1=loading).

**Pendiente futuro:** Perplexity (usuario rechazó conectar), tools de AI SDK (registrar venta/gasto directamente), URL routing por hilo.
