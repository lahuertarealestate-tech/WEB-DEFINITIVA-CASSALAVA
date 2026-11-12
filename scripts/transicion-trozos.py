#!/usr/bin/env python3
"""Sustituye un fundido del vídeo por una transición en la que la imagen A
se cae a trozos (paredes desconchándose, suelo levantándose) dejando ver B.

    python3 scripts/transicion-trozos.py entrada.mp4 salida.mp4 --a 299 --b 336 [--duracion 48]

  --a N   último fotograma limpio ANTES del fundido (numerado desde 1)
  --b N   primer fotograma limpio DESPUÉS del fundido
Los fotogramas entre A y B (el fundido) se eliminan. Durante la transición,
A se mantiene con un ligero avance de cámara y B sigue reproduciéndose.
"""

import argparse
import math
import os
import shutil
import subprocess
import tempfile

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.spatial import cKDTree

rng = np.random.default_rng(7)


def ruido(h, w, escala, semilla):
    r = np.random.default_rng(semilla)
    g = r.random((h // escala + 3, w // escala + 3))
    return ndimage.zoom(g, escala, order=3)[:h, :w]


def celdas(h, w):
    """Mapa de trozos irregulares: grandes en paredes, más pequeños en el suelo."""
    pts = []
    # semillas en rejilla con jitter; densidad mayor arriba (molduras) y en el suelo
    paso_y = 84
    y = 0.0
    while y < h + paso_y:
        paso_x = 104 if y < h * 0.62 else 62
        for x in np.arange(-paso_x, w + paso_x, paso_x):
            pts.append((x + rng.uniform(-0.45, 0.45) * paso_x, y + rng.uniform(-0.45, 0.45) * paso_y))
        y += paso_y if y < h * 0.62 else 46
    pts = np.array(pts)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # bordes dentados: deformar las coordenadas con ruido antes de asignar celda
    dx = (ruido(h, w, 24, 1) - 0.5) * 34 + (ruido(h, w, 6, 2) - 0.5) * 8
    dy = (ruido(h, w, 24, 3) - 0.5) * 34 + (ruido(h, w, 6, 4) - 0.5) * 8
    q = np.stack([(xx + dx).ravel(), (yy + dy).ravel()], 1)
    _, lab = cKDTree(pts).query(q, workers=-1)
    lab = lab.reshape(h, w)
    _, lab = np.unique(lab, return_inverse=True)
    return lab.reshape(h, w)


def zoom(img, s):
    if abs(s - 1) < 1e-4:
        return img
    h, w = img.shape[:2]
    im = Image.fromarray(img)
    nw, nh = int(round(w * s)), int(round(h * s))
    im = im.resize((nw, nh), Image.BICUBIC)
    x0, y0 = (nw - w) // 2, (nh - h) // 2
    return np.asarray(im.crop((x0, y0, x0 + w, y0 + h)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("salida")
    ap.add_argument("--a", type=int, required=True)
    ap.add_argument("--b", type=int, required=True)
    ap.add_argument("--duracion", type=int, default=60)
    a = ap.parse_args()

    tmp = tempfile.mkdtemp(prefix="trozos-")
    try:
        src = os.path.join(tmp, "src")
        out = os.path.join(tmp, "out")
        os.makedirs(src)
        os.makedirs(out)
        subprocess.run(["ffmpeg", "-v", "error", "-i", a.entrada, "-an", "-vsync", "0", os.path.join(src, "%05d.png")], check=True)
        n = len(os.listdir(src))
        leer = lambda i: np.asarray(Image.open(os.path.join(src, f"{i:05d}.png")).convert("RGB"))
        k = 0

        def escribir(img):
            nonlocal k
            k += 1
            Image.fromarray(img).save(os.path.join(out, f"{k:05d}.png"))

        for i in range(1, a.a + 1):
            escribir(leer(i))

        A = leer(a.a)
        h, w = A.shape[:2]
        lab = celdas(h, w)
        nc = lab.max() + 1
        cy = ndimage.mean(np.mgrid[0:h, 0:w][0], lab, np.arange(nc)) / h
        cx = ndimage.mean(np.mgrid[0:h, 0:w][1], lab, np.arange(nc)) / w
        horizonte = 0.62
        suelo = cy > horizonte

        # orden de caída: paredes de arriba abajo y desde los lados hacia el centro;
        # el suelo se levanta desde el fondo hacia la cámara, un poco después
        D = a.duracion
        caida = 9  # fotogramas que tarda un trozo en caer
        t0 = np.where(
            suelo,
            0.35 + 0.45 * (cy - horizonte) / (1 - horizonte),
            0.75 * cy + 0.25 * (1 - np.abs(cx - 0.5) * 2),
        )
        t0 = t0 * 0.75 + rng.random(nc) * 0.25
        t0 = (t0 - t0.min()) / (t0.max() - t0.min())
        t0 = t0 * (D - caida - 2)
        giro = rng.uniform(-1, 1, nc)
        empuje = rng.uniform(-1.5, 1.5, nc)

        cajas = ndimage.find_objects(lab + 1)
        yy, xx = np.mgrid[0:h, 0:w]

        for f in range(D):
            s = 1.0 + 0.045 * f / D  # la cámara sigue avanzando un poco sobre A
            Af = zoom(A, s).astype(np.float32)
            Bf = leer(min(n, a.b + f)).astype(np.float32)
            lienzo = Bf.copy()

            fijo = (t0[lab] > f)  # trozos que aún no han empezado a caer
            # sombra que proyectan los trozos que quedan sobre lo que ya se ve detrás
            sombra = ndimage.gaussian_filter(fijo.astype(np.float32), 6)
            sombra = np.roll(sombra, (5, 3), (0, 1))
            lienzo *= (1 - 0.45 * sombra * (~fijo))[..., None]
            # A en los trozos fijos, con un canto oscuro donde ya falta el vecino
            borde = fijo & ~ndimage.binary_erosion(fijo, iterations=1)
            Afix = Af.copy()
            Afix[borde] *= 0.8
            lienzo[fijo] = Afix[fijo]

            # trozos cayendo
            activos = np.where((t0 <= f) & (t0 > f - caida))[0]
            for c in activos:
                sl = cajas[c]
                if sl is None:
                    continue
                u = (f - t0[c]) / caida  # 0..1
                y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
                m = (lab[sl] == c).astype(np.float32)
                pieza = np.dstack([Af[sl], m * 255]).astype(np.float32)
                ccy, ccx = (y1 - y0) / 2, (x1 - x0) / 2
                if suelo[c]:
                    # el suelo se levanta: el trozo se encoge, oscurece y desaparece
                    esc, ang, ty, tx = 1 - 0.4 * u, 0.0, -6 * u, 0.0
                    alfa = 1 - u ** 1.6
                    oscuro = 1 - 0.55 * u
                else:
                    # la pared cae: aceleración hacia abajo, algo de giro y deriva
                    esc = 1.0
                    ang = giro[c] * 28 * u
                    ty = 420 * u * u
                    tx = empuje[c] * 30 * u
                    alfa = 1.0 if u < 0.8 else 1 - (u - 0.8) / 0.2
                    oscuro = 1 - 0.3 * u
                M = cv2.getRotationMatrix2D((ccx, ccy), ang, esc)
                M[0, 2] += x0 + tx
                M[1, 2] += y0 + ty
                capa = cv2.warpAffine(pieza, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)
                al = (capa[..., 3:4] / 255.0) * alfa
                lienzo = lienzo * (1 - al) + capa[..., :3] * oscuro * al

            # polvo: partículas claras que caen junto a los trozos activos
            if len(activos):
                npol = 30 * len(activos)
                px = rng.integers(0, w, npol)
                py = rng.integers(0, h, npol)
                cerca = np.isin(lab[py, px], activos)
                px, py = px[cerca], py[cerca]
                lienzo[py, px] = lienzo[py, px] * 0.4 + 235 * 0.6

            escribir(np.clip(lienzo, 0, 255).astype(np.uint8))

        for i in range(a.b + D, n + 1):
            escribir(leer(i))

        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(out, "%05d.png"),
             "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", a.salida],
            check=True,
        )
        print(f"{k} fotogramas -> {a.salida}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
