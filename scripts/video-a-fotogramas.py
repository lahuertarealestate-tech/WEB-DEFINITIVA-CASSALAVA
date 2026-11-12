#!/usr/bin/env python3
"""Convierte el vídeo del recorrido en los fotogramas WebP de la portada.

    python3 scripts/video-a-fotogramas.py ruta/al/video.mp4

Qué hace:
  1. Mide cuánto se mueve la cámara entre cada par de fotogramas (flujo óptico).
  2. Compensa el ritmo: guarda en el manifest qué parte del scroll corresponde a
     cada fotograma, para que la cámara avance a velocidad constante aunque en
     el vídeo vaya más lenta en algunos tramos. No se descarta ningún fotograma.
  3. Genera public/recorrido/escritorio (horizontal) y public/recorrido/movil
     (recorte vertical 9:16 centrado) y actualiza manifest.json.

Opciones:
  --ritmo 0..1     cuánto se iguala la velocidad (0 = como el vídeo, 1 = constante). Por defecto 0.6
  --ancho N        ancho máximo de escritorio en px (por defecto 1920; nunca amplía)
  --calidad N      calidad WebP (por defecto 80)
  --desde S --hasta S   recortar el vídeo (segundos)
  --lento A:B:F    dar F veces más scroll a los fotogramas A..B (p. ej. una transformación)

Requiere ffmpeg, numpy, Pillow y opencv-python-headless.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

import cv2
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, "public", "recorrido")


def extraer(video, carpeta, desde, hasta):
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if desde:
        cmd += ["-ss", str(desde)]
    cmd += ["-i", video]
    if hasta:
        cmd += ["-t", str(hasta - (desde or 0))]
    cmd += ["-an", "-vsync", "0", os.path.join(carpeta, "%05d.png")]
    subprocess.run(cmd, check=True)
    return sorted(os.path.join(carpeta, f) for f in os.listdir(carpeta) if f.endswith(".png"))


def movimiento(rutas):
    """Magnitud media del flujo óptico entre fotogramas consecutivos."""
    prev = None
    m = []
    for r in rutas:
        g = cv2.cvtColor(cv2.imread(r), cv2.COLOR_BGR2GRAY)
        g = cv2.resize(g, (320, int(320 * g.shape[0] / g.shape[1])), interpolation=cv2.INTER_AREA)
        if prev is not None:
            flujo = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 21, 3, 5, 1.1, 0)
            m.append(float(np.linalg.norm(flujo, axis=2).mean()))
        prev = g
    m = np.array(m)
    # suavizado ligero para no reaccionar a ruido de un solo fotograma
    k = np.ones(5) / 5
    return np.convolve(np.pad(m, 2, mode="edge"), k, mode="valid")


def curva_ritmo(m, ritmo, lentos=()):
    """Progreso de scroll (0..1) en el que aparece cada fotograma."""
    w = np.power(np.maximum(m, 1e-3), ritmo)
    w = w / w.mean()
    for ini, fin, factor in lentos:
        w[ini:fin] = np.maximum(w[ini:fin], 1.0) * factor
    acum = np.concatenate([[0.0], np.cumsum(w)])
    return acum / acum[-1]


def guardar(rutas, indices, carpeta, ancho_max, calidad, vertical):
    shutil.rmtree(carpeta, ignore_errors=True)
    os.makedirs(carpeta)
    tam = None
    for k, i in enumerate(indices):
        im = Image.open(rutas[i]).convert("RGB")
        w, h = im.size
        if vertical:
            cw = int(round(h * 9 / 16))
            x0 = (w - cw) // 2
            im = im.crop((x0, 0, x0 + cw, h))
            # 540 px de ancho basta en móvil y mantiene los fotogramas ligeros
            destino = (540, 960)
        else:
            if w > ancho_max:
                destino = (ancho_max, int(round(h * ancho_max / w / 2)) * 2)
            else:
                destino = (w, h)
        if im.size != destino:
            im = im.resize(destino, Image.LANCZOS)
        im.save(os.path.join(carpeta, f"{k:04d}.webp"), "WEBP", quality=calidad, method=6)
        tam = im.size
    return tam


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--ritmo", type=float, default=0.6)
    ap.add_argument("--ancho", type=int, default=1920)
    ap.add_argument("--calidad", type=int, default=80)
    ap.add_argument("--desde", type=float, default=None)
    ap.add_argument("--hasta", type=float, default=None)
    ap.add_argument("--lento", action="append", default=[])
    a = ap.parse_args()

    tmp = tempfile.mkdtemp(prefix="recorrido-")
    try:
        rutas = extraer(a.video, tmp, a.desde, a.hasta)
        print(f"{len(rutas)} fotogramas en el vídeo")
        indices = list(range(len(rutas)))
        lentos = [tuple(float(x) if i == 2 else int(x) for i, x in enumerate(t.split(":"))) for t in a.lento]
        curva = curva_ritmo(movimiento(rutas), a.ritmo, lentos)

        we, he = guardar(rutas, indices, os.path.join(DEST, "escritorio"), a.ancho, a.calidad, False)
        wm, hm = guardar(rutas, indices, os.path.join(DEST, "movil"), a.ancho, a.calidad - 5, True)

        manifest = {
            "version": time.strftime("%Y%m%d%H%M"),
            "escritorio": {"carpeta": "/recorrido/escritorio", "total": len(indices), "ancho": we, "alto": he, "ext": "webp", "digitos": 4},
            "movil": {"carpeta": "/recorrido/movil", "total": len(indices), "ancho": wm, "alto": hm, "ext": "webp", "digitos": 4},
            # progreso de scroll de cada fotograma (ritmo compensado)
            "ritmo": [round(float(x), 4) for x in curva],
        }
        with open(os.path.join(DEST, "manifest.json"), "w") as f:
            json.dump(manifest, f, indent=2)
            f.write("\n")
        # para colocar los textos: progreso de scroll cada 10 % del vídeo
        print("progreso por fotograma (cada 20):", [f"{i}:{curva[i]:.3f}" for i in range(0, len(curva), 20)])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
