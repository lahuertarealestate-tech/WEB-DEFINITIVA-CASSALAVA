"""Renderizador CPU (numba) de la escena provisional.

Genera los fotogramas del recorrido para la portada y algunas imágenes fijas
para las fichas de proyectos. Solo sirve hasta tener el vídeo real.

  python3 render.py frames --out ../../public/recorrido/escritorio --w 1600 --h 900 --n 240
  python3 render.py frames --out ../../public/recorrido/movil --w 540 --h 960 --n 120 --fov 72
  python3 render.py stills --out ../../public/proyectos
"""

import argparse
import math
import os
import sys

import numpy as np
from numba import njit, prange
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
import escena  # noqa: E402

SUN = np.array([0.62, 0.52, -0.59])
SUN = SUN / np.linalg.norm(SUN)
SUN_COL = np.array([3.4, 2.75, 2.05])
EPS = 1e-4


# ----------------------------------------------------------------- utilidades
@njit(cache=True, inline="always")
def hash3(x, y, z):
    h = (x * 374761393 + y * 668265263 + z * 1274126177) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFFFF) / 16777216.0


@njit(cache=True)
def vnoise(x, y, z):
    ix, iy, iz = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - ix, y - iy, z - iz
    ux, uy, uz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    ix, iy, iz = int(ix), int(iy), int(iz)
    a = hash3(ix, iy, iz); b = hash3(ix + 1, iy, iz)
    c = hash3(ix, iy + 1, iz); d = hash3(ix + 1, iy + 1, iz)
    e = hash3(ix, iy, iz + 1); f = hash3(ix + 1, iy, iz + 1)
    g = hash3(ix, iy + 1, iz + 1); h = hash3(ix + 1, iy + 1, iz + 1)
    x1 = a + (b - a) * ux; x2 = c + (d - c) * ux
    x3 = e + (f - e) * ux; x4 = g + (h - g) * ux
    y1 = x1 + (x2 - x1) * uy; y2 = x3 + (x4 - x3) * uy
    return y1 + (y2 - y1) * uz


@njit(cache=True)
def fbm(x, y, z):
    return 0.5 * vnoise(x, y, z) + 0.3 * vnoise(x * 2.1, y * 2.1, z * 2.1) + 0.2 * vnoise(x * 4.3, y * 4.3, z * 4.3)


@njit(cache=True)
def sky(dx, dy, dz, sx, sy, sz):
    t = max(dy, 0.0)
    hz_r, hz_g, hz_b = 1.25, 1.12, 1.0
    zn_r, zn_g, zn_b = 0.32, 0.5, 0.95
    k = 1.0 - math.pow(1.0 - t, 3.0)
    r = hz_r + (zn_r - hz_r) * k
    g = hz_g + (zn_g - hz_g) * k
    b = hz_b + (zn_b - hz_b) * k
    cs = dx * sx + dy * sy + dz * sz
    if cs > 0:
        glow = math.pow(cs, 32.0) * 2.5 + math.pow(cs, 4.0) * 0.25
        r += glow * 1.0; g += glow * 0.8; b += glow * 0.55
    if dy < 0:
        f = min(-dy * 6, 1.0)
        r = r * (1 - f) + 0.35 * f; g = g * (1 - f) + 0.33 * f; b = b * (1 - f) + 0.3 * f
    return r, g, b


# --------------------------------------------------------------- intersección
@njit(cache=True, inline="always")
def ray_box(ox, oy, oz, ix, iy, iz, x0, x1, y0, y1, z0, z1):
    tx1 = (x0 - ox) * ix; tx2 = (x1 - ox) * ix
    ty1 = (y0 - oy) * iy; ty2 = (y1 - oy) * iy
    tz1 = (z0 - oz) * iz; tz2 = (z1 - oz) * iz
    txn = min(tx1, tx2); txf = max(tx1, tx2)
    tyn = min(ty1, ty2); tyf = max(ty1, ty2)
    tzn = min(tz1, tz2); tzf = max(tz1, tz2)
    tn = max(txn, max(tyn, tzn))
    tf = min(txf, min(tyf, tzf))
    axis = 0
    if tyn >= txn and tyn >= tzn:
        axis = 1
    elif tzn >= txn and tzn >= tyn:
        axis = 2
    return tn, tf, axis


@njit(cache=True)
def trace(ox, oy, oz, dx, dy, dz, tmax, anyhit, boxes, sph, cbox, crange):
    ix = 1.0 / dx; iy = 1.0 / dy; iz = 1.0 / dz
    best = tmax
    kind = -1
    idx = -1
    ax = 0
    for c in range(cbox.shape[0]):
        cn, cf, _ = ray_box(ox, oy, oz, ix, iy, iz, cbox[c, 0], cbox[c, 1], cbox[c, 2], cbox[c, 3], cbox[c, 4], cbox[c, 5])
        if cf < max(cn, 0.0) or cn > best:
            continue
        for i in range(crange[c, 0], crange[c, 1]):
            tn, tf, a = ray_box(ox, oy, oz, ix, iy, iz, boxes[i, 0], boxes[i, 1], boxes[i, 2], boxes[i, 3], boxes[i, 4], boxes[i, 5])
            if tf >= tn and tn > EPS and tn < best:
                best = tn; kind = 0; idx = i; ax = a
                if anyhit:
                    return best, kind, idx, ax
        for i in range(crange[c, 2], crange[c, 3]):
            cx = sph[i, 0] - ox; cy = sph[i, 1] - oy; cz = sph[i, 2] - oz
            b = cx * dx + cy * dy + cz * dz
            det = b * b - (cx * cx + cy * cy + cz * cz) + sph[i, 3] * sph[i, 3]
            if det > 0:
                s = math.sqrt(det)
                t = b - s
                if t > EPS and t < best:
                    best = t; kind = 1; idx = i
                    if anyhit:
                        return best, kind, idx, ax
    return best, kind, idx, ax


@njit(cache=True)
def normal_at(kind, idx, ax, px, py, pz, dx, dy, dz, sph):
    if kind == 1:
        nx = px - sph[idx, 0]; ny = py - sph[idx, 1]; nz = pz - sph[idx, 2]
        l = math.sqrt(nx * nx + ny * ny + nz * nz)
        return nx / l, ny / l, nz / l
    nx = 0.0; ny = 0.0; nz = 0.0
    if ax == 0:
        nx = -1.0 if dx > 0 else 1.0
    elif ax == 1:
        ny = -1.0 if dy > 0 else 1.0
    else:
        nz = -1.0 if dz > 0 else 1.0
    return nx, ny, nz


# ---------------------------------------------------------------- materiales
@njit(cache=True)
def albedo(m, px, py, pz, nx, ny, nz, pal):
    """Devuelve r, g, b, emisión, especular(0=mate,1=agua,2=vidrio)."""
    n = fbm(px * 0.9, py * 0.9, pz * 0.9)
    if m == 0:  # césped
        v = 0.75 + 0.5 * fbm(px * 0.35, 0.0, pz * 0.35) + 0.25 * vnoise(px * 9, 0, pz * 9)
        return 0.075 * v, 0.14 * v, 0.045 * v, 0.0, 0
    if m == 1:  # losas
        gx = (px + 100) / 0.9; gz = (pz + 100) / 0.6
        fx = gx - math.floor(gx); fz = gz - math.floor(gz)
        seam = 1.0
        if abs(ny) > 0.5 and (fx < 0.02 or fz < 0.03):
            seam = 0.55
        t = 0.88 + 0.22 * hash3(int(math.floor(gx)), 7, int(math.floor(gz))) + 0.1 * n
        return 0.5 * t * seam, 0.47 * t * seam, 0.43 * t * seam, 0.0, 0
    if m == 2:  # revoco
        v = 0.94 + 0.08 * n
        return pal[0] * v, pal[1] * v, pal[2] * v, 0.0, 0
    if m == 3:  # piedra en lajas horizontales
        band = math.floor((py + 10) / 0.16)
        off = hash3(int(band), 3, 1) * 3.0
        u = px + pz
        blk = math.floor((u + off) / (0.6 + 0.6 * hash3(int(band), 5, 2)))
        t = 0.75 + 0.45 * hash3(int(band), int(blk), 9) + 0.15 * n
        fy = (py + 10) / 0.16 - band
        seam = 0.5 if fy < 0.08 else 1.0
        return pal[3] * t * seam, pal[4] * t * seam, pal[5] * t * seam, 0.0, 0
    if m == 4:  # tarima de roble
        row = math.floor((px + 100) / 0.19)
        plank = math.floor((pz + 100 + hash3(int(row), 1, 1) * 2.4) / 2.4)
        fx = (px + 100) / 0.19 - row
        tone = 0.8 + 0.35 * hash3(int(row), int(plank), 4)
        grain = 0.85 + 0.15 * vnoise(px * 40, 0, pz * 2.0)
        seam = 0.55 if fx < 0.03 else 1.0
        t = tone * grain * seam
        return pal[6] * t, pal[7] * t, pal[8] * t, 0.0, 0
    if m == 5:  # puerta granate (#550000)
        return 0.075, 0.004, 0.004, 0.0, 0
    if m == 6:  # hormigón
        v = 0.8 + 0.35 * fbm(px * 1.7, py * 1.7, pz * 1.7)
        fy = (py * 2.0) - math.floor(py * 2.0)
        if fy < 0.015:
            v *= 0.8
        return 0.36 * v, 0.35 * v, 0.33 * v, 0.0, 0
    if m == 7:
        return 1.0, 1.0, 1.0, 1.0, 0
    if m == 8:
        return 0.025, 0.025, 0.025, 0.0, 0
    if m == 9:  # tela lino
        v = 0.95 + 0.05 * vnoise(px * 30, py * 30, pz * 30)
        return 0.6 * v, 0.55 * v, 0.48 * v, 0.0, 0
    if m == 10:
        v = 0.9 + 0.1 * vnoise(px * 20, 0, pz * 20)
        return 0.32 * v, 0.27 * v, 0.22 * v, 0.0, 0
    if m == 11:  # nogal
        g = 0.8 + 0.2 * vnoise(px * 3 + pz * 3, py * 40, 0)
        return 0.17 * g, 0.095 * g, 0.055 * g, 0.0, 0
    if m == 12:  # agua
        return 0.02, 0.12, 0.16, 0.0, 1
    if m == 13:  # follaje
        v = 0.6 + 0.8 * vnoise(px * 4, py * 4, pz * 4)
        return 0.05 * v, 0.11 * v, 0.03 * v, 0.0, 0
    if m == 14:
        return 0.12, 0.08, 0.05, 0.0, 0
    if m == 15:  # granate
        return 0.08, 0.005, 0.005, 0.0, 0
    if m == 16:  # mármol
        vein = abs(math.sin((px * 1.5 + pz * 0.8 + py * 1.2) * 3.0 + fbm(px * 2, py * 2, pz * 2) * 6.0))
        v = 0.9 - 0.25 * math.pow(1 - vein, 8)
        return 0.78 * v, 0.77 * v, 0.75 * v, 0.0, 0
    if m == 17:
        return 0.4, 0.41, 0.43, 0.0, 0
    if m == 18:
        v = 0.85 + 0.2 * vnoise(px * 2, py * 30, pz * 2)
        return 0.42 * v, 0.3 * v, 0.17 * v, 0.0, 0
    if m == 19:  # vidrio oscuro
        return 0.015, 0.018, 0.02, 0.0, 2
    if m == 20:
        return pal[0] * 1.02, pal[1] * 1.02, pal[2] * 1.02, 0.0, 0
    if m == 21:  # bloque de hormigón
        gy = (py + 10) / 0.2; row = math.floor(gy)
        gu = (px + pz + (row % 2) * 0.2) / 0.4
        seam = 0.6 if (gy - row < 0.06 or gu - math.floor(gu) < 0.04) else 1.0
        v = (0.85 + 0.2 * n) * seam
        return 0.45 * v, 0.44 * v, 0.42 * v, 0.0, 0
    if m == 22:  # grúa
        return 0.55, 0.42, 0.08, 0.0, 0
    if m == 23:  # cerámica clara
        return 0.75, 0.72, 0.66, 0.0, 0
    if m == 24:  # valla de obra antracita
        u = (px + pz) / 1.2
        seam = 0.6 if u - math.floor(u) < 0.02 else 1.0
        return 0.06 * seam, 0.06 * seam, 0.065 * seam, 0.0, 0
    return 0.5, 0.5, 0.5, 0.0, 0


@njit(cache=True)
def surface(kind, idx, bmat, smat):
    if kind == 0:
        return bmat[idx]
    return smat[idx]


# ------------------------------------------------------------------- render
@njit(parallel=True, cache=True)
def render(W, H, cam, fov, boxes, bmat, sph, smat, cbox, crange, lights, nsamp, sun, suncol, pal, emis,
           direct, irr, alb, depth, nrm, irrmask):
    px_, py_, pz_ = cam[0], cam[1], cam[2]
    fx, fy, fz = cam[3], cam[4], cam[5]
    rx, ry, rz = cam[6], cam[7], cam[8]
    ux, uy, uz = cam[9], cam[10], cam[11]
    th = math.tan(fov * 0.5)
    aspect = W / H
    sx, sy, sz = sun[0], sun[1], sun[2]
    sqn = int(math.sqrt(nsamp))
    for j in prange(H):
        for i in range(W):
            u = ((i + 0.5) / W * 2 - 1) * th * aspect
            v = (1 - (j + 0.5) / H * 2) * th
            dx = fx + rx * u + ux * v
            dy = fy + ry * u + uy * v
            dz = fz + rz * u + uz * v
            l = math.sqrt(dx * dx + dy * dy + dz * dz)
            dx /= l; dy /= l; dz /= l
            if abs(dx) < 1e-9: dx = 1e-9
            if abs(dy) < 1e-9: dy = 1e-9
            if abs(dz) < 1e-9: dz = 1e-9
            t, kind, idx, ax = trace(px_, py_, pz_, dx, dy, dz, 1e9, False, boxes, sph, cbox, crange)
            if kind < 0:
                r, g, b = sky(dx, dy, dz, sx, sy, sz)
                direct[j, i, 0] = r; direct[j, i, 1] = g; direct[j, i, 2] = b
                depth[j, i] = 1e9
                continue
            hx = px_ + dx * t; hy = py_ + dy * t; hz = pz_ + dz * t
            nx, ny, nz = normal_at(kind, idx, ax, hx, hy, hz, dx, dy, dz, sph)
            depth[j, i] = t
            nrm[j, i, 0] = nx; nrm[j, i, 1] = ny; nrm[j, i, 2] = nz
            m = surface(kind, idx, bmat, smat)
            ar, ag, ab, em, spec = albedo(m, hx, hy, hz, nx, ny, nz, pal)
            if em > 0:
                direct[j, i, 0] = 6.0 * emis; direct[j, i, 1] = 4.8 * emis; direct[j, i, 2] = 3.4 * emis
                continue
            ox = hx + nx * 2e-3; oy = hy + ny * 2e-3; oz = hz + nz * 2e-3
            dr = 0.0; dg = 0.0; db = 0.0
            # reflexión (agua, vidrio)
            if spec > 0:
                dn = dx * nx + dy * ny + dz * nz
                qx = dx - 2 * dn * nx; qy = dy - 2 * dn * ny; qz = dz - 2 * dn * nz
                if spec == 1:
                    qx += 0.02 * math.sin(hx * 7 + hz * 3); qz += 0.02 * math.sin(hz * 6 - hx * 2)
                cosv = max(0.0, -dn)
                F0 = 0.03 if spec == 1 else 0.06
                F = F0 + (1 - F0) * math.pow(1 - cosv, 5)
                if spec == 2:
                    F = min(1.0, F * 1.0 + 0.12)
                rt, rk, ri, rax = trace(ox, oy, oz, qx, qy, qz, 1e9, False, boxes, sph, cbox, crange)
                if rk < 0:
                    cr, cg, cb = sky(qx, qy, qz, sx, sy, sz)
                else:
                    hx2 = ox + qx * rt; hy2 = oy + qy * rt; hz2 = oz + qz * rt
                    n2x, n2y, n2z = normal_at(rk, ri, rax, hx2, hy2, hz2, qx, qy, qz, sph)
                    m2 = surface(rk, ri, bmat, smat)
                    a2r, a2g, a2b, e2, s2 = albedo(m2, hx2, hy2, hz2, n2x, n2y, n2z, pal)
                    nd = max(0.0, n2x * sx + n2y * sy + n2z * sz)
                    cr = a2r * (suncol[0] * nd * 0.8 + 0.35); cg = a2g * (suncol[1] * nd * 0.8 + 0.35); cb = a2b * (suncol[2] * nd * 0.8 + 0.4)
                dr += cr * F; dg += cg * F; db += cb * F
                kf = 1 - F
                ar *= kf; ag *= kf; ab *= kf
            # sol directo
            ndl = nx * sx + ny * sy + nz * sz
            if ndl > 0:
                st, sk, si, sa = trace(ox, oy, oz, sx, sy, sz, 1e9, True, boxes, sph, cbox, crange)
                if sk < 0:
                    dr += ar * suncol[0] * ndl; dg += ag * suncol[1] * ndl; db += ab * suncol[2] * ndl
            # luces puntuales
            for L in range(lights.shape[0]):
                lx = lights[L, 0] - hx; ly = lights[L, 1] - hy; lz = lights[L, 2] - hz
                d2 = lx * lx + ly * ly + lz * lz
                if d2 > lights[L, 6] * lights[L, 6]:
                    continue
                d = math.sqrt(d2)
                lx /= d; ly /= d; lz /= d
                nl = nx * lx + ny * ly + nz * lz
                if nl <= 0:
                    continue
                st, sk, si, sa = trace(ox, oy, oz, lx, ly, lz, d - 0.2, True, boxes, sph, cbox, crange)
                if sk >= 0:
                    continue
                fall = emis / (d2 + 0.4) * (1 - d / lights[L, 6])
                dr += ar * lights[L, 3] * nl * fall; dg += ag * lights[L, 4] * nl * fall; db += ab * lights[L, 5] * nl * fall
            direct[j, i, 0] = dr; direct[j, i, 1] = dg; direct[j, i, 2] = db
            alb[j, i, 0] = ar; alb[j, i, 1] = ag; alb[j, i, 2] = ab
            # iluminación indirecta (1 rebote, muestreo coseno estratificado)
            # solo en 1 de cada 4 píxeles; el filtro bilateral rellena el resto
            if (i % 2) != 0 or (j % 2) != 0:
                continue
            irrmask[j, i] = 1.0
            # base ortonormal
            if abs(nx) > 0.5:
                tx_, ty_, tz_ = 0.0, 1.0, 0.0
            else:
                tx_, ty_, tz_ = 1.0, 0.0, 0.0
            bx = ny * tz_ - nz * ty_; by = nz * tx_ - nx * tz_; bz = nx * ty_ - ny * tx_
            bl = math.sqrt(bx * bx + by * by + bz * bz)
            bx /= bl; by /= bl; bz /= bl
            cx = ny * bz - nz * by; cy = nz * bx - nx * bz; cz = nx * by - ny * bx
            r1 = hash3(i, j, 11); r2 = hash3(i, j, 29)
            er = 0.0; eg = 0.0; eb = 0.0
            for s in range(nsamp):
                su = ((s % sqn) + r1) / sqn
                sv = ((s // sqn) + r2) / sqn
                su -= math.floor(su); sv -= math.floor(sv)
                rr = math.sqrt(su); phi = 6.2831853 * sv
                lx = rr * math.cos(phi); ly = rr * math.sin(phi); lz = math.sqrt(max(0.0, 1 - su))
                qx = bx * lx + cx * ly + nx * lz
                qy = by * lx + cy * ly + ny * lz
                qz = bz * lx + cz * ly + nz * lz
                if abs(qx) < 1e-9: qx = 1e-9
                if abs(qy) < 1e-9: qy = 1e-9
                if abs(qz) < 1e-9: qz = 1e-9
                qt, qk, qi, qa = trace(ox, oy, oz, qx, qy, qz, 60.0, False, boxes, sph, cbox, crange)
                if qk < 0:
                    cr, cg, cb = sky(qx, qy, qz, sx, sy, sz)
                    er += cr; eg += cg; eb += cb
                else:
                    hx2 = ox + qx * qt; hy2 = oy + qy * qt; hz2 = oz + qz * qt
                    n2x, n2y, n2z = normal_at(qk, qi, qa, hx2, hy2, hz2, qx, qy, qz, sph)
                    m2 = surface(qk, qi, bmat, smat)
                    a2r, a2g, a2b, e2, s2 = albedo(m2, hx2, hy2, hz2, n2x, n2y, n2z, pal)
                    if e2 > 0:
                        er += 6.0 * emis; eg += 4.8 * emis; eb += 3.4 * emis
                        continue
                    lr = 0.06; lg = 0.065; lb = 0.075
                    nd = n2x * sx + n2y * sy + n2z * sz
                    if nd > 0:
                        o2x = hx2 + n2x * 2e-3; o2y = hy2 + n2y * 2e-3; o2z = hz2 + n2z * 2e-3
                        tt, tk, ti, ta = trace(o2x, o2y, o2z, sx, sy, sz, 1e9, True, boxes, sph, cbox, crange)
                        if tk < 0:
                            lr += suncol[0] * nd; lg += suncol[1] * nd; lb += suncol[2] * nd
                    er += a2r * lr * 1.3; eg += a2g * lg * 1.3; eb += a2b * lb * 1.3
            irr[j, i, 0] = er / nsamp; irr[j, i, 1] = eg / nsamp; irr[j, i, 2] = eb / nsamp


@njit(parallel=True, cache=True)
def bilateral(irr, depth, nrm, mask, out, rad):
    H, W = depth.shape
    for j in prange(H):
        for i in range(W):
            d0 = depth[j, i]
            if d0 >= 1e8:
                out[j, i, 0] = 0; out[j, i, 1] = 0; out[j, i, 2] = 0
                continue
            sr = 0.0; sg = 0.0; sb = 0.0; sw = 0.0
            for dj in range(-rad, rad + 1):
                jj = j + dj
                if jj < 0 or jj >= H:
                    continue
                for di in range(-rad, rad + 1):
                    ii = i + di
                    if ii < 0 or ii >= W:
                        continue
                    if mask[jj, ii] == 0:
                        continue
                    d1 = depth[jj, ii]
                    dd = abs(d1 - d0) / (d0 * 0.03 + 0.01)
                    nd = nrm[j, i, 0] * nrm[jj, ii, 0] + nrm[j, i, 1] * nrm[jj, ii, 1] + nrm[j, i, 2] * nrm[jj, ii, 2]
                    if nd < 0.9:
                        continue
                    w = math.exp(-dd * dd - (di * di + dj * dj) / (rad * rad * 0.6))
                    sr += irr[jj, ii, 0] * w; sg += irr[jj, ii, 1] * w; sb += irr[jj, ii, 2] * w
                    sw += w
            if sw < 1e-6:
                for dj in range(-rad, rad + 1):
                    jj = j + dj
                    if jj < 0 or jj >= H:
                        continue
                    for di in range(-rad, rad + 1):
                        ii = i + di
                        if ii < 0 or ii >= W or mask[jj, ii] == 0:
                            continue
                        w = 1.0 / (1.0 + abs(depth[jj, ii] - d0))
                        sr += irr[jj, ii, 0] * w; sg += irr[jj, ii, 1] * w; sb += irr[jj, ii, 2] * w
                        sw += w
            if sw < 1e-6:
                out[j, i, 0] = 0.15; out[j, i, 1] = 0.15; out[j, i, 2] = 0.15
            else:
                out[j, i, 0] = sr / sw; out[j, i, 1] = sg / sw; out[j, i, 2] = sb / sw


# --------------------------------------------------------------- pipeline
def look_at(pos, tgt):
    f = np.asarray(tgt, float) - np.asarray(pos, float)
    f /= np.linalg.norm(f)
    r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r)
    u = np.cross(r, f)
    return np.concatenate([pos, f, r, u])


DEFAULT_PAL = np.array([0.80, 0.77, 0.72,   # revoco
                        0.24, 0.21, 0.19,   # piedra
                        0.46, 0.31, 0.19])  # roble


def render_hdr(scene, W, H, pos, tgt, fov_deg, nsamp=9, pal=DEFAULT_PAL, rad=4, emis=1.0):
    boxes, bmat, sph, smat, cbox, crange = scene
    cam = look_at(pos, tgt)
    direct = np.zeros((H, W, 3)); irr = np.zeros((H, W, 3)); alb = np.zeros((H, W, 3))
    depth = np.zeros((H, W)); nrm = np.zeros((H, W, 3)); mask = np.zeros((H, W))
    render(W, H, cam, math.radians(fov_deg), boxes, bmat, sph, smat, cbox, crange, escena.LIGHTS,
           nsamp, SUN, SUN_COL, pal, emis, direct, irr, alb, depth, nrm, mask)
    filt = np.zeros_like(irr)
    bilateral(irr, depth, nrm, mask, filt, rad)
    return direct + alb * filt


def lum(img):
    return 0.2126 * img[..., 0] + 0.7152 * img[..., 1] + 0.0722 * img[..., 2]


def tonemap(hdr, exposure, out_w, out_h):
    x = hdr * exposure
    # ACES (aprox. Narkowicz)
    a, b, c, d, e = 2.51, 0.03, 2.43, 0.59, 0.14
    y = np.clip((x * (a * x + b)) / (x * (c * x + d) + e), 0, 1)
    # bloom suave
    bright = np.clip(x - 1.2, 0, None)
    srgb = np.where(y <= 0.0031308, 12.92 * y, 1.055 * np.power(y, 1 / 2.4) - 0.055)
    # grading cálido y ligero contraste
    srgb = srgb * np.array([1.02, 1.0, 0.96])
    img = Image.fromarray((np.clip(srgb, 0, 1) * 255).astype(np.uint8))
    if bright.max() > 0:
        bl = Image.fromarray((np.clip(bright / (bright.max() + 1e-6), 0, 1) * 255).astype(np.uint8))
        bl = bl.resize((max(1, img.width // 4), max(1, img.height // 4)), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6))
        bl = bl.resize(img.size, Image.BILINEAR)
        arr = np.asarray(img).astype(np.float32) + np.asarray(bl).astype(np.float32) * 0.18
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    img = img.resize((out_w, out_h), Image.LANCZOS)
    # viñeteado
    yy, xx = np.mgrid[0:out_h, 0:out_w]
    vg = 1 - 0.22 * (((xx / out_w - 0.5) ** 2 + (yy / out_h - 0.5) ** 2) * 2.2)
    arr = np.asarray(img).astype(np.float32) * vg[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def exposure_for(hdr):
    L = lum(hdr)
    L = L[np.isfinite(L)]
    lg = np.exp(np.mean(np.log(L + 1e-3)))
    return 0.22 / lg


def cmd_frames(a):
    scene = escena.build()
    os.makedirs(a.out, exist_ok=True)
    ts = np.linspace(0, 1, a.n)
    # 1) pre-pase de baja resolución para la exposición automática suavizada
    pw, ph = max(64, a.w // 10), max(64, a.h // 10)
    exps = []
    for t in ts:
        p, g = escena.camera_at(t)
        exps.append(exposure_for(render_hdr(scene, pw, ph, p, g, a.fov, nsamp=4, rad=2)))
    le = np.log(np.array(exps))
    k = np.exp(-np.linspace(-2.5, 2.5, 21) ** 2)
    k /= k.sum()
    le = np.convolve(np.pad(le, 10, mode="edge"), k, mode="valid")
    exps = np.clip(np.exp(le), 0.25, 3.0)
    np.save(os.path.join(a.out, "..", f"_exp_{os.path.basename(a.out)}.npy"), exps)
    print("exposición", exps.min(), exps.max(), flush=True)
    # 2) render final con supermuestreo
    rw, rh = int(a.w * a.ss), int(a.h * a.ss)
    for k_, t in enumerate(ts):
        fn = os.path.join(a.out, f"{k_:04d}.webp")
        if os.path.exists(fn) and not a.force:
            continue
        p, g = escena.camera_at(t)
        hdr = render_hdr(scene, rw, rh, p, g, a.fov, nsamp=a.samples, rad=9)
        img = tonemap(hdr, exps[k_], a.w, a.h)
        img.save(fn, "WEBP", quality=a.q, method=6)
        print(f"{k_ + 1}/{a.n}", flush=True)


STILLS = [
    # nombre, pos, objetivo, paleta (revoco, piedra, roble)
    ("casa-del-encinar", (-3.5, 1.6, -7.5), (1.0, 2.7, 12.0), DEFAULT_PAL),
    ("salon-mirador", (3.5, 1.5, 18.2), (-4.5, 0.9, 23.5), DEFAULT_PAL),
    ("cocina-isla", (-1.2, 1.55, 18.4), (5.0, 0.8, 22.2), np.array([0.78, 0.74, 0.68, 0.30, 0.27, 0.24, 0.52, 0.37, 0.24])),
    ("pasillo-galeria", (0.0, 1.55, 10.9), (-0.1, 1.45, 17.0), DEFAULT_PAL),
    ("terraza-piscina", (-6.0, 1.7, 34.6), (2.5, 0.8, 27.0), np.array([0.83, 0.80, 0.76, 0.20, 0.18, 0.17, 0.46, 0.31, 0.19])),
    ("ampliacion-en-obra", (-2.0, 1.7, 31.5), (1.5, 3.4, 44.0), DEFAULT_PAL),
    ("villa-voladizo", (-10.5, 1.2, -1.5), (0.0, 4.2, 12.0), np.array([0.76, 0.73, 0.69, 0.26, 0.23, 0.21, 0.40, 0.27, 0.16])),
]


def cmd_stills(a):
    scene = escena.build()
    os.makedirs(a.out, exist_ok=True)
    for name, p, g, pal in STILLS:
        if a.only and name not in a.only.split(","):
            continue
        hdr = render_hdr(scene, int(a.w * a.ss), int(a.h * a.ss), np.array(p, float), np.array(g, float), a.fov,
                         nsamp=a.samples, pal=pal, rad=9)
        img = tonemap(hdr, exposure_for(hdr), a.w, a.h)
        img.save(os.path.join(a.out, f"{name}.webp"), "WEBP", quality=82, method=6)
        print(name, flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("modo", choices=["frames", "stills", "test"])
    ap.add_argument("--out", required=True)
    ap.add_argument("--w", type=int, default=1600)
    ap.add_argument("--h", type=int, default=900)
    ap.add_argument("--n", type=int, default=240)
    ap.add_argument("--fov", type=float, default=55)
    ap.add_argument("--ss", type=float, default=1.0)
    ap.add_argument("--samples", type=int, default=25)
    ap.add_argument("--q", type=int, default=72)
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--ts", default="0,0.2,0.35,0.5,0.6,0.7,0.8,0.9,1")
    a = ap.parse_args()
    if a.modo == "frames":
        cmd_frames(a)
    elif a.modo == "stills":
        cmd_stills(a)
    else:
        scene = escena.build()
        os.makedirs(a.out, exist_ok=True)
        import time
        for t in [float(x) for x in a.ts.split(",")]:
            t0 = time.time()
            p, g = escena.camera_at(t)
            hdr = render_hdr(scene, a.w, a.h, p, g, a.fov, nsamp=a.samples, rad=9)
            tonemap(hdr, exposure_for(hdr), a.w, a.h).save(os.path.join(a.out, f"t{t:.2f}.png"))
            print(t, f"{time.time() - t0:.1f}s", flush=True)
