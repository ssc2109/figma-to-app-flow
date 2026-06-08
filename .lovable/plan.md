## Cambio

Eliminar el eyebrow "Trax · análisis en vivo" del header del carrusel de insights en `src/components/business/BusinessInsights.tsx`, ya que se está superponiendo con el título de cada slide (ej. "Margen del mes · salud financiera").

## Detalles técnicos

- Quitar el `<span>` con el texto "Trax · análisis en vivo" y el punto verde pulsante que lo acompaña.
- Mantener el contador "04 / 06" a la derecha.
- Verificar que el espaciado superior del slide no quede desbalanceado tras la eliminación (ajustar `padding-top` o el layout del header si hace falta).