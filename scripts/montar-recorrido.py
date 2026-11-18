#!/usr/bin/env python3
"""Monta el recorrido del home a partir de varios clips encadenados.

Cada clip empieza donde acaba el anterior (Flow, primer y último fotograma).
El script:
  - recorta el final quieto de cada clip y toma uno de cada N fotogramas,
  - funde unos fotogramas en cada unión para que no se note el empalme,
  - reparte el scroll: cada clip ocupa la parte que se le asigna y, dentro de
    él, cada fotograma recibe más o menos scroll según cuánto cambia la imagen
    (la reforma avanza a ritmo constante aunque en el vídeo vaya a golpes),
  - genera public/recorrido/escritorio, public/recorrido/movil (recorte 9:16
    centrado) y manifest.json.

    python3 scripts/montar-recorrido.py clipA.mp4:180:0.25 clipB.mp4:178:0.12 ...

  formato de cada clip:  ruta:último_fotograma:parte_del_scroll[:paso]
  (paso opcional por clip; si no se indica, se usa --paso)
"""

import argparse
import json
import os
import shutil
import subprocess
import tempfile
import time

import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, "public", "recorrido")


def extraer(video, carpeta):
    os.makedirs(carpeta)
    subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-an", "-vsync", "0", os.path.join(carpeta, "%05d.png")], check=True)
    return sorted(os.path.join(carpeta, f) for f in os.listdir(carpeta))


def pequeno(ruta):
    return np.asarray(Image.open(ruta).convert("L").resize((160, 90), Image.BILINEAR), np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clips", nargs="+")
    ap.add_argument("--paso", type=int, default=2, help="usar 1 de cada N fotogramas")
    ap.add_argument("--fundido", type=int, default=6, help="fotogramas de fundido en cada unión")
    ap.add_argument("--ancho", type=int, default=1440)
    ap.add_argument("--calidad", type=int, default=70)
    a = ap.parse_args()

    tmp = tempfile.mkdtemp(prefix="montaje-")
    try:
        imagenes = []  # (fuente, peso); fuente = ruta o (rutaA, rutaB, t) para un fundido
        for n, spec in enumerate(a.clips):
            partes = spec.split(":")
            ruta, ultimo, parte = partes[:3]
            paso = int(partes[3]) if len(partes) > 3 else a.paso
            fr = extraer(ruta, os.path.join(tmp, f"c{n}"))[: int(ultimo)]
            g = [pequeno(f) for f in fr]
            dif = np.array([0.0] + [np.abs(g[i] - g[i - 1]).mean() for i in range(1, len(g))])
            idx = list(range(0, len(fr), paso))
            if idx[-1] != len(fr) - 1:
                idx.append(len(fr) - 1)
            pesos = np.array([dif[max(1, idx[k - 1] + 1) : i + 1].sum() if k else 0.0 for k, i in enumerate(idx)])
            pesos = np.maximum(pesos, pesos.mean() * 0.08)  # ningún tramo queda sin scroll
            pesos = pesos / pesos.sum() * float(parte)
            clip = [(fr[i], p) for i, p in zip(idx, pesos)]
            if imagenes and a.fundido:
                # fundir el final del clip anterior con el principio de este
                k = min(a.fundido, len(clip), len(imagenes))
                for j in range(k):
                    t = (j + 1) / (k + 1)
                    prev, pp = imagenes[-k + j]
                    nxt, _ = clip[j]
                    imagenes[-k + j] = ((prev, nxt, t), pp)
                clip = clip[k:]
            elif imagenes:
                # sin fundido: el clip empieza en el último fotograma del anterior, así que se quita el repetido
                clip = clip[1:]
            imagenes += clip
            print(f"clip {n + 1}: {len(idx)} fotogramas, {float(parte):.0%} del scroll")

        pesos = np.array([p for _, p in imagenes])
        curva = np.concatenate([[0.0], np.cumsum(pesos[1:])])
        curva /= curva[-1]

        esc = os.path.join(DEST, "escritorio")
        mov = os.path.join(DEST, "movil")
        for c in (esc, mov):
            shutil.rmtree(c, ignore_errors=True)
            os.makedirs(c)
        for k, (src, _) in enumerate(imagenes):
            if isinstance(src, tuple):
                pa, pb, t = src
                im = Image.blend(Image.open(pa).convert("RGB"), Image.open(pb).convert("RGB"), t)
            else:
                im = Image.open(src).convert("RGB")
            w, h = im.size
            nh = int(round(h * a.ancho / w / 2)) * 2
            im.resize((a.ancho, nh), Image.LANCZOS).save(os.path.join(esc, f"{k:04d}.webp"), "WEBP", quality=a.calidad, method=6)
            cw = int(round(h * 9 / 16))
            x0 = (w - cw) // 2
            im.crop((x0, 0, x0 + cw, h)).resize((540, 960), Image.LANCZOS).save(
                os.path.join(mov, f"{k:04d}.webp"), "WEBP", quality=a.calidad - 4, method=6
            )

        n = len(imagenes)
        manifest = {
            "version": time.strftime("%Y%m%d%H%M"),
            "escritorio": {"carpeta": "/recorrido/escritorio", "total": n, "ancho": a.ancho, "alto": nh, "ext": "webp", "digitos": 4},
            "movil": {"carpeta": "/recorrido/movil", "total": n, "ancho": 540, "alto": 960, "ext": "webp", "digitos": 4},
            "ritmo": [round(float(x), 4) for x in curva],
        }
        with open(os.path.join(DEST, "manifest.json"), "w") as f:
            json.dump(manifest, f, indent=2)
            f.write("\n")
        print(f"{n} fotogramas en total")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
