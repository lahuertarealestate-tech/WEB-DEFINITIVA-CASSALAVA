#!/usr/bin/env bash
# Convierte el vídeo del recorrido en los fotogramas WebP de la portada.
#
#   ./scripts/video-a-fotogramas.sh ruta/al/video.mp4 [fotogramas_escritorio] [fotogramas_movil]
#
# - Escritorio: 1920 px de ancho, 300 fotogramas por defecto.
# - Móvil: recorte vertical 9:16 centrado, 720 px de ancho, 150 fotogramas.
# Los fotogramas se reparten de forma uniforme por todo el vídeo, así que
# la duración del vídeo da igual. Requiere ffmpeg con soporte WebP.
set -euo pipefail

VIDEO="${1:?Indica la ruta del vídeo}"
N_ESC="${2:-300}"
N_MOV="${3:-150}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$RAIZ/public/recorrido"

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
echo "Duración: ${dur}s"

extraer () { # carpeta n filtro_escala calidad
  local carpeta="$DEST/$1" n="$2" filtro="$3" q="$4"
  rm -rf "$carpeta" && mkdir -p "$carpeta"
  local fps
  fps=$(awk -v n="$n" -v d="$dur" 'BEGIN { printf "%.6f", n / d }')
  ffmpeg -v error -i "$VIDEO" -vf "fps=${fps},${filtro}" -frames:v "$n" \
    -c:v libwebp -quality "$q" -compression_level 6 -start_number 0 "$carpeta/%04d.webp"
  ls "$carpeta" | wc -l | tr -d ' '
}

total_esc=$(extraer escritorio "$N_ESC" "scale=1920:-2:flags=lanczos" 72)
total_mov=$(extraer movil "$N_MOV" "crop=ih*9/16:ih,scale=720:-2:flags=lanczos" 70)

# dimensiones reales del primer fotograma
dims () { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$DEST/$1/0000.webp"; }
IFS=x read -r w_esc h_esc < <(dims escritorio)
IFS=x read -r w_mov h_mov < <(dims movil)

cat > "$DEST/manifest.json" <<JSON
{
  "version": "$(date +%Y%m%d%H%M)",
  "escritorio": { "carpeta": "/recorrido/escritorio", "total": $total_esc, "ancho": $w_esc, "alto": $h_esc, "ext": "webp", "digitos": 4 },
  "movil": { "carpeta": "/recorrido/movil", "total": $total_mov, "ancho": $w_mov, "alto": $h_mov, "ext": "webp", "digitos": 4 }
}
JSON

du -sh "$DEST/escritorio" "$DEST/movil"
echo "Listo: $total_esc fotogramas de escritorio y $total_mov de móvil."
