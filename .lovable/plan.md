## Alcance

Dos tandas de trabajo, sin tocar identidad visual, paleta, tipografía, navegación general ni arquitectura. Todo el copy y componentes nuevos reutilizan tokens y patrones de `DESIGN.md`.

## Tanda A — Bugs críticos de flujo

1. **Onboarding "Registra tu primera venta"**: el CTA del `ProactiveHero`/estado vacío del Home dispara la acción `venta` de `quickActions` (abre `SalesOverlay` completo). Hoy resuelve a `payments` → se reemplaza el handler.
2. **Registrar venta / registrar movimiento no deben abrir "Métodos de pago"**: auditar `quickActions.tsx` y todos los CTAs que hoy hacen `setView("payments")` al invocar venta o movimiento. `PaymentsView` sólo se abre desde su tarjeta en `BusinessHub` o como paso final dentro del cobro.
3. **Cobrar y Fiar dentro del flujo de venta**: en `SalesOverlay` el selector de método de pago pasa a incluir explícitamente `Efectivo · Yape · Plin · Tarjeta · Fiado`, y agrega botón secundario "Cobrar ahora" (marca `paid=true`) y "Registrar fiado" (fuerza `is_credit=true, paid=false`) para que no dependan del menú rápido.
4. **Cliente en fiado**: al elegir Fiado, aparece un bloque con:
   - selector "Elegir cliente" (busca en `customers` del user, ilike),
   - o "Crear cliente rápido" (nombre + tel opcional → insert en `customers`),
   - guarda `customer_id` y `customer_name` tanto en `sales` como en `fiados` (fila creada al cerrar la venta fiada).

## Tanda B — Módulos faltantes / incompletos (estructura + lógica mínima)

Todos siguen el patrón visual de `BusinessScreen` (hub → vista con header + back) y usan `shared.tsx`.

5. **RUC real**: `InfoView` se divide en dos secciones:
   - "Datos del negocio" (lo actual).
   - Nueva "Información tributaria": campos `ruc`, `razon_social`, `regimen` (NRUS/RER/MYPE/General), `direccion_fiscal`, `actividad_economica`. Persisten en `profiles` (columnas nuevas). Botón "Opciones avanzadas" abre un panel con: exportar datos tributarios (JSON descargable), copiar RUC, y placeholder "Consultar SUNAT (próximamente)".
6. **Catálogo ≠ Inventario**: se crea `CatalogView` independiente. Inventario mantiene stock/costos. Catálogo muestra los mismos productos en modo "vitrina" (grid con imagen, nombre, precio público, categoría, badge disponible/agotado), con acciones "compartir catálogo" (copia enlace placeholder) y "editar precios en lote" (modal simple que actualiza `price` en batch). Sin duplicar la UI de stock.
7. **Compras**: nuevo `PurchasesView` + tabla `purchases` (id, user_id, supplier_name, total, note, created_at) y `purchase_items` (purchase_id, product_id, name, qty, unit_cost). Flujo mínimo: registrar compra con proveedor + items; al guardar, suma stock a los productos y guarda costo. Lista las últimas compras.
8. **Calendario**: nuevo `CalendarView` + tabla `calendar_events` (id, user_id, title, notes, event_date, kind: recordatorio/pago/servicio, done). Vista mensual simple con `Calendar` shadcn + lista de eventos del día seleccionado + crear/completar/eliminar evento.
9. **Escanear**: la acción `escanear` del quick menu abre una pantalla dedicada `ScanScreen` con estado "Preparando escáner" y un input manual "Ingresar código" que busca en `products` por `sku`/`name`. No queda muerta.
10. **Auditoría de navegación**: recorro `BusinessHub`, `TraxNavigation`, `MeScreen`, `SettingsScreen`, `QuickActions` y me aseguro de que cada entrada abra una vista real. Las que aún no tienen lógica quedan en `ComingSoonView` con copy específico (ya existe el componente) — no se dejan links muertos ni redirects a la vista equivocada.

## Cambios en la base de datos

Una sola migración con:
- `profiles`: `ruc text`, `razon_social text`, `regimen text`, `direccion_fiscal text`, `actividad_economica text`.
- `sales`: `customer_id uuid references customers(id) on delete set null` (si no existe ya).
- `purchases` + `purchase_items` con RLS por `user_id` y GRANTs (`authenticated`, `service_role`).
- `calendar_events` con RLS por `user_id` y GRANTs.

Sin cambios en tablas existentes fuera de las columnas listadas.

## Fuera de alcance en este cambio

- Rediseño de socIA / reparación del chat (Grupo 2).
- Reconstrucción de la sección Actividad del Home (Grupo 4).
- Integración real con SUNAT, escáner de cámara nativo, compartir catálogo público real, notificaciones de calendario.

## Verificación

Al terminar cada tanda: build limpio, y prueba manual con Playwright de: crear venta contado, crear venta fiada con cliente nuevo, abrir cada tarjeta del hub de negocio, abrir cada quick action, entrar a RUC y ver bloque tributario, registrar una compra y ver stock actualizado, crear un evento de calendario.
