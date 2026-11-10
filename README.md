# CASSALAVA · web

Web de CASSALAVA (arquitectura, diseño y construcción). Next.js (App Router) + Tailwind, desplegada en Vercel.

## Ramas

- `main`: web pública (producción en Vercel).
- `desarrollo`: aquí se hacen los cambios. Cada push genera una vista previa en Vercel para revisarla antes de pasarla a `main`.

## Estructura

```
src/app/                 páginas (inicio, servicios, proyectos, nosotros, contacto, legales)
src/app/api/contacto/    envío del formulario por email (Resend)
src/components/recorrido Recorrido.tsx: canvas + precarga + textos sincronizados con el scroll
src/lib/site.ts          datos de la empresa (contacto, datos fiscales, redes)
src/lib/servicios.ts     textos de servicios
src/lib/proyectos.ts     proyectos y sus fichas
public/recorrido/        fotogramas del recorrido de la portada + manifest.json
public/proyectos/        imágenes de los proyectos
scripts/                 conversión de vídeo a fotogramas y render provisional
```

## El recorrido de la portada

Un `<canvas>` fijo pinta un fotograma distinto según la posición del scroll. Los fotogramas son WebP numerados en
`public/recorrido/escritorio/` (horizontal) y `public/recorrido/movil/` (vertical, más ligero), y
`public/recorrido/manifest.json` indica cuántos hay. Mientras se descargan se muestra la precarga con porcentaje.

Los textos que aparecen en cada tramo se editan en `src/app/page.tsx` (`tramos`, con `desde` y `hasta` entre 0 y 1).

### Cambiar el vídeo

Con el vídeo definitivo (cuanto más estable y lento el movimiento, mejor):

```bash
./scripts/video-a-fotogramas.sh ruta/al/recorrido.mp4          # 300 escritorio + 150 móvil
./scripts/video-a-fotogramas.sh ruta/al/recorrido.mp4 360 180  # o el número que quieras
```

El script borra los fotogramas anteriores, genera los nuevos y actualiza el manifest. El vídeo original no se sube
al repositorio (está en `.gitignore`).

### Fotogramas provisionales

Los actuales son un render 3D generado por código (`scripts/recorrido-provisional/`), solo para maquetar. Se pueden
regenerar con `scripts/recorrido-provisional/run_all.sh` (necesita Python con numpy, numba y Pillow).

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública (SEO, sitemap). Ej.: `https://www.cassalava.es` |
| `RESEND_API_KEY` | Clave de [Resend](https://resend.com) para enviar el formulario |
| `CONTACT_TO_EMAIL` | Email que recibe las consultas (se pueden poner varios separados por comas) |
| `CONTACT_FROM_EMAIL` | Remitente con dominio verificado en Resend. Ej.: `Web CASSALAVA <web@cassalava.es>` |

Sin `RESEND_API_KEY` la web funciona, pero el formulario responde que todavía no está activo.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellenar
npm run dev
```

## Pendiente de contenido real

- Datos de contacto y fiscales en `src/lib/site.ts` (ahora son inventados).
- Proyectos e imágenes reales en `src/lib/proyectos.ts` y `public/proyectos/`.
- Equipo y textos de `src/app/nosotros/page.tsx`.
- Revisión legal de aviso legal, privacidad y cookies.
- Logo definitivo (ahora es el nombre en EB Garamond).
