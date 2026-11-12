#!/usr/bin/env python3
"""Cierra una puerta abierta en una secuencia de fotogramas (retoque VFX).

Dibuja una puerta doble de madera, la coloca en el hueco de la puerta en un
fotograma de referencia y la sigue en los demás fotogramas con homografías
encadenadas (la pared del fondo es un plano). También sustituye el reflejo
brillante del hueco en el suelo de mármol por el reflejo oscuro de la puerta.

    python3 scripts/cerrar-puerta.py carpeta_png --ref 95 --quad 856,340,1066,690 --desde 30 --hasta 140
"""

import argparse
import os

import cv2
import numpy as np

rng = np.random.default_rng(3)


def puerta(w, h):
    """Puerta doble de nogal con cuarterones, a resolución w×h (BGR float 0-255)."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    base = np.array([28, 42, 62], np.float32)  # BGR nogal oscuro
    veta = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), sigmaX=0.6, sigmaY=14)
    veta = veta / (np.abs(veta).max() + 1e-6)
    lote = cv2.GaussianBlur(rng.standard_normal((h // 8 + 1, w // 8 + 1)).astype(np.float32), (0, 0), 3)
    lote = cv2.resize(lote, (w, h)) * 0.6
    img = base[None, None, :] * (1 + 0.16 * veta[..., None] + 0.08 * lote[..., None])
    # luz cálida suave de los apliques: algo más clara arriba y a la izquierda
    luz = 1.08 - 0.22 * (yy / h) - 0.06 * (xx / w)
    img *= luz[..., None]

    def rect(x0, y0, x1, y1, f):
        img[int(y0):int(y1), int(x0):int(x1)] *= f

    def biselado(x0, y0, x1, y1, g):
        x0, y0, x1, y1 = map(int, (x0, y0, x1, y1))
        img[y0:y0 + g, x0:x1] *= 1.28  # canto superior iluminado
        img[y0:y1, x0:x0 + g] *= 1.15  # canto izquierdo
        img[y1 - g:y1, x0:x1] *= 0.62  # canto inferior en sombra
        img[y0:y1, x1 - g:x1] *= 0.75
        rect(x0 + g, y0 + g, x1 - g, y1 - g, 0.93)

    hoja = w / 2
    g = max(2, int(w * 0.012))
    for k in range(2):
        x0 = k * hoja
        m = hoja * 0.17
        # cuarterón alto, pequeño cuarterón central y cuarterón bajo
        biselado(x0 + m, h * 0.07, x0 + hoja - m, h * 0.50, g)
        biselado(x0 + m, h * 0.56, x0 + hoja - m, h * 0.64, g)
        biselado(x0 + m, h * 0.70, x0 + hoja - m, h * 0.93, g)
    # junta entre hojas y sombra en el perímetro del hueco
    c = int(w / 2)
    img[:, c - g:c + g] *= 0.45
    img[:, c + g:c + 2 * g] *= 1.15
    sombra = np.ones((h, w), np.float32)
    b = max(3, int(w * 0.03))
    for i in range(b):
        f = 0.55 + 0.45 * i / b
        sombra[i, :] = np.minimum(sombra[i, :], f)
        sombra[:, i] = np.minimum(sombra[:, i], f)
        sombra[:, w - 1 - i] = np.minimum(sombra[:, w - 1 - i], f)
    img *= sombra[..., None]
    # pomos de latón
    for cx in (c - int(w * 0.07), c + int(w * 0.07)):
        cy = int(h * 0.53)
        r = max(3, int(w * 0.022))
        cv2.circle(img, (cx, cy), r, (60, 140, 185), -1, cv2.LINE_AA)
        cv2.circle(img, (cx - r // 3, cy - r // 3), max(1, r // 3), (170, 220, 245), -1, cv2.LINE_AA)
    img = cv2.GaussianBlur(img, (0, 0), w / 420)
    return np.clip(img, 0, 255)


def sift_h(a, b, mask):
    s = cv2.SIFT_create(4000)
    ka, da = s.detectAndCompute(a, mask)
    kb, db = s.detectAndCompute(b, None)
    if da is None or db is None or len(ka) < 12:
        return None, 0
    m = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [x for x, y in (p for p in m if len(p) == 2) if x.distance < 0.72 * y.distance]
    if len(good) < 12:
        return None, 0
    pa = np.float32([ka[x.queryIdx].pt for x in good])
    pb = np.float32([kb[x.trainIdx].pt for x in good])
    H, inl = cv2.findHomography(pa, pb, cv2.RANSAC, 3.0)
    return H, int(inl.sum()) if inl is not None else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta")
    ap.add_argument("--ref", type=int, required=True)
    ap.add_argument("--quad", required=True, help="x0,y0,x1,y1 del hueco en el fotograma de referencia")
    ap.add_argument("--desde", type=int, required=True)
    ap.add_argument("--hasta", type=int, required=True)
    ap.add_argument("--salida", default=None, help="carpeta de salida (por defecto, sobrescribe)")
    a = ap.parse_args()
    out = a.salida or a.carpeta
    os.makedirs(out, exist_ok=True)
    ruta = lambda d, i: os.path.join(d, f"{i:05d}.png")

    x0, y0, x1, y1 = map(float, a.quad.split(","))
    PW, PH = 840, 1400
    plate = puerta(PW, PH)
    A = cv2.getPerspectiveTransform(
        np.float32([[0, 0], [PW, 0], [PW, PH], [0, PH]]),
        np.float32([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]),
    )

    # homografías: emparejamiento directo con la referencia (sin deriva) y, si
    # falla, encadenado desde el fotograma vecino. Solo se usa la pared del
    # fondo alrededor del hueco, que es un plano.
    S = 0.5
    gris = {}

    def g(i):
        if i not in gris:
            im = cv2.imread(ruta(a.carpeta, i))
            gris[i] = cv2.resize(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), None, fx=S, fy=S, interpolation=cv2.INTER_AREA)
        return gris[i]

    def mascara(q, forma):
        cx, cy = q.mean(0)
        ww = q[:, 0].max() - q[:, 0].min()
        hh = q[:, 1].max() - q[:, 1].min()
        m = np.zeros(forma, np.uint8)
        cv2.rectangle(m, (int(cx - 1.3 * ww), int(cy - 0.85 * hh)), (int(cx + 1.3 * ww), int(cy + 0.5 * hh)), 255, -1)
        cv2.fillConvexPoly(m, q.astype(np.int32), 0)
        return m

    esq = np.float32([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])
    Ssc = np.diag([S, S, 1.0])
    Si = np.linalg.inv(Ssc)
    gref = g(a.ref).astype(np.float32)
    mref = mascara(esq * S, gref.shape)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)

    def ecc(i, j, Winit):
        """Homografía del fotograma i al j alineando la pared del fondo (ECC)."""
        q = cv2.perspectiveTransform(esq[None], Hs[i])[0] * S
        m = mascara(q, gref.shape)
        W = (Ssc @ Winit @ Si).astype(np.float32)
        W /= W[2, 2]
        try:
            cc, W = cv2.findTransformECC(g(i).astype(np.float32), g(j).astype(np.float32), W,
                                         cv2.MOTION_HOMOGRAPHY, crit, m, 5)
        except cv2.error:
            return None, 0.0
        return Si @ W.astype(np.float64) @ Ssc, cc

    Hs = {a.ref: np.eye(3)}
    for paso in (-1, 1):
        i = a.ref
        Winc = np.eye(3)
        while a.desde <= i + paso <= a.hasta:
            j = i + paso
            W, cc = ecc(i, j, Winc)  # predicción: mismo movimiento que el paso anterior
            if W is None or cc < 0.6:
                W, cc = ecc(i, j, np.eye(3))
            if W is None or cc < 0.6:
                print("rastreo perdido en", j, round(cc, 2))
                break
            Hj = W @ Hs[i]
            q = cv2.perspectiveTransform(esq[None], Hj)[0]
            if q[:, 0].max() < 0 or q[:, 0].min() > gref.shape[1] / S:
                break  # la puerta ya no está en cuadro
            Hs[j], Winc, i = Hj, W, j

    # tramo lejano (antes de la referencia): la cámara avanza de frente por el
    # pasillo y el hueco solo cambia de escala; se localiza con búsqueda de
    # plantilla multiescala, más fiable que encadenar homografías a lo lejos
    ref_bgr = cv2.imread(ruta(a.carpeta, a.ref))
    mx, my = (x1 - x0) * 0.25, (y1 - y0) * 0.12
    tx0, ty0, tx1, ty1 = int(x0 - mx), int(y0 - my), int(x1 + mx), int(y1 + my * 0.5)
    tpl = cv2.cvtColor(ref_bgr[ty0:ty1, tx0:tx1], cv2.COLOR_BGR2GRAY)
    lejos = {}
    escala = 1.0
    for j in range(a.ref - 1, a.desde - 1, -1):
        gj = cv2.cvtColor(cv2.imread(ruta(a.carpeta, j)), cv2.COLOR_BGR2GRAY)
        mejor = (-1, None, None)
        for f in np.linspace(0.93, 1.02, 10):
            sc = escala * f
            t = cv2.resize(tpl, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
            if t.shape[0] < 20 or t.shape[0] >= gj.shape[0] or t.shape[1] >= gj.shape[1]:
                continue
            r = cv2.matchTemplate(gj, t, cv2.TM_CCOEFF_NORMED)
            _, v, _, loc = cv2.minMaxLoc(r)
            if v > mejor[0]:
                mejor = (v, sc, loc)
        v, sc, loc = mejor
        if sc is None or v < 0.45:
            print("plantilla perdida en", j, round(v, 2))
            break
        escala = sc
        q = (esq - [tx0, ty0]) * sc + loc
        lejos[j] = q
    for j, q in lejos.items():
        Hs[j] = cv2.getPerspectiveTransform(esq, q.astype(np.float32))
    for j in [k for k in Hs if k < a.ref and k not in lejos]:
        del Hs[j]

    # suavizado temporal de las esquinas para evitar temblores
    idx = sorted(Hs)
    Q = np.array([cv2.perspectiveTransform(esq[None], Hs[i])[0] for i in idx])
    k = np.array([1, 2, 3, 2, 1], np.float32)
    k /= k.sum()
    Qs = Q.copy()
    for c in range(4):
        for d in range(2):
            Qs[:, c, d] = np.convolve(np.pad(Q[:, c, d], 2, mode="edge"), k, mode="valid")

    # corrección de deriva: el canto derecho del hueco es un borde vertical muy
    # marcado; se busca cerca de la posición prevista y se desplaza la puerta
    dxs = np.zeros(len(idx), np.float32)
    for n, i in enumerate(idx):
        q = Qs[n]
        ancho = q[1, 0] - q[0, 0]
        if ancho < 150:
            continue
        im = cv2.cvtColor(cv2.imread(ruta(a.carpeta, i)), cv2.COLOR_BGR2GRAY).astype(np.float32)
        h, w = im.shape
        xr = (q[1, 0] + q[2, 0]) / 2
        ya, yb2 = int(q[1, 1] + 0.25 * (q[2, 1] - q[1, 1])), int(q[1, 1] + 0.75 * (q[2, 1] - q[1, 1]))
        r = int(max(20, ancho * 0.18))
        xa, xb = int(xr - r), int(xr + r)
        if xa < 2 or xb > w - 2 or ya < 0 or yb2 > h:
            dxs[n] = dxs[n - 1] if n else 0
            continue
        gx = np.abs(cv2.Sobel(im[ya:yb2], cv2.CV_32F, 1, 0, ksize=3)).mean(0)[xa:xb]
        cand = int(np.argmax(gx))
        if gx[cand] > 3 * np.median(gx) and gx[cand] > 6:
            dxs[n] = xa + cand - xr
        else:
            dxs[n] = dxs[n - 1] if n else 0
    dxs = np.convolve(np.pad(dxs, 3, mode="edge"), np.ones(7) / 7, mode="valid")
    Qs[:, :, 0] += dxs[:, None]

    for n, i in enumerate(idx):
        im = cv2.imread(ruta(a.carpeta, i)).astype(np.float32)
        h, w = im.shape[:2]
        q = Qs[n]
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [PW, 0], [PW, PH], [0, PH]]), q.astype(np.float32))
        lado = np.linalg.norm(q[1] - q[0])
        pl = cv2.warpPerspective(plate, M, (w, h), flags=cv2.INTER_AREA if lado < PW else cv2.INTER_LINEAR)
        al = cv2.warpPerspective(np.ones((PH, PW), np.float32), M, (w, h), flags=cv2.INTER_LINEAR)
        al = cv2.GaussianBlur(al, (0, 0), 0.6)[..., None]
        pl = cv2.GaussianBlur(pl, (0, 0), 0.9)  # igualar la suavidad del vídeo

        # reflejo en el mármol: el hueco iluminado se reflejaba como una franja
        # clara; con la puerta cerrada el reflejo es oscuro. Se atenúa la franja
        # (conservando las vetas) y se añade el reflejo difuso de la puerta.
        yb = int(round(max(q[2, 1], q[3, 1])))
        xl, xr = min(q[0, 0], q[3, 0]), max(q[1, 0], q[2, 0])
        alto = lado * PH / PW
        hh = int(min(h - yb, alto * 1.1))
        if hh > 4 and xr > xl:
            refl = np.flipud(pl[max(0, yb - hh):yb])
            alr = np.flipud(al[max(0, yb - hh):yb])
            hh = refl.shape[0]
            refl = cv2.GaussianBlur(refl, (0, 0), sigmaX=1.5, sigmaY=max(2.0, alto / 40))
            alr = cv2.GaussianBlur(alr, (0, 0), sigmaX=max(2.0, (xr - xl) / 25), sigmaY=max(2.0, alto / 40))
            if alr.ndim == 2:
                alr = alr[..., None]
            t = np.linspace(0, 1, hh, dtype=np.float32)[:, None, None]
            atenua = 0.58 * (1 - t) ** 0.6 + 0.1
            fuerza = 0.45 * (1 - t) ** 1.2
            suelo = im[yb:yb + hh]
            im[yb:yb + hh] = suelo * (1 - atenua * alr) * (1 - fuerza * alr) + refl * fuerza * alr

        # grano para igualar el ruido del vídeo
        grano = rng.normal(0, 2.2, pl.shape).astype(np.float32)
        im = im * (1 - al) + (pl + grano) * al
        cv2.imwrite(ruta(out, i), np.clip(im, 0, 255).astype(np.uint8))
    print("fotogramas retocados:", idx[0], "-", idx[-1])


if __name__ == "__main__":
    main()
