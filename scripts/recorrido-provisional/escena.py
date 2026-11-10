"""Escena 3D provisional de CASSALAVA: una vivienda contemporánea con jardín,
pasillo de entrada, salón y, al fondo, una ampliación en obra.

Todo son cajas y esferas alineadas con los ejes (metros). x = derecha,
y = arriba, z = hacia dentro de la casa.
"""

import numpy as np

# ---------------------------------------------------------------- materiales
M = {
    "cesped": 0, "piedra_suelo": 1, "revoco": 2, "piedra": 3, "madera_suelo": 4,
    "puerta": 5, "hormigon": 6, "luz": 7, "negro": 8, "tela": 9, "alfombra": 10,
    "nogal": 11, "agua": 12, "follaje": 13, "tronco": 14, "granate": 15,
    "marmol": 16, "andamio": 17, "tablon": 18, "vidrio": 19, "techo": 20,
    "bloque": 21, "grua": 22, "ceramica": 23, "valla": 24,
}

_boxes = []  # (x0,x1,y0,y1,z0,z1,mat,cluster)
_spheres = []  # (x,y,z,r,mat,cluster)
CL = {"suelo": 0, "fachada": 1, "interior": 2, "jardin": 3, "obra": 4, "arboles": 5, "mueble": 6}


def box(x0, x1, y0, y1, z0, z1, mat, cl):
    _boxes.append((min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1), min(z0, z1), max(z0, z1), M[mat], CL[cl]))


def sph(x, y, z, r, mat, cl):
    _spheres.append((x, y, z, r, M[mat], CL[cl]))


def tree(x, z, h=2.6, r=1.7):
    box(x - 0.13, x + 0.13, 0, h + 0.4, z - 0.13, z + 0.13, "tronco", "arboles")
    sph(x, h + r * 0.75, z, r, "follaje", "arboles")
    sph(x + r * 0.55, h + r * 0.45, z - r * 0.2, r * 0.7, "follaje", "arboles")
    sph(x - r * 0.5, h + r * 0.5, z + r * 0.3, r * 0.72, "follaje", "arboles")


def build():
    _boxes.clear()
    _spheres.clear()

    # ------------------------------------------------------------ terreno
    box(-90, 90, -1, 0, -90, 100, "cesped", "suelo")
    # camino de entrada (losas)
    box(-1.0, 1.0, 0, 0.025, -12, 10, "piedra_suelo", "jardin")
    # setos bajos a los lados del camino
    for s in (-1, 1):
        box(s * 1.45, s * 2.05, 0, 0.75, -6, 8.6, "follaje", "jardin")
    # jardín delantero
    tree(-5.8, 3.0, 2.8, 1.9)
    tree(6.5, 0.5, 2.4, 1.6)
    tree(-11, -3, 3.0, 2.2)
    tree(12, 6, 3.2, 2.3)
    tree(-13, 18, 3.4, 2.5)
    tree(14, 24, 3.0, 2.2)
    tree(-11, 34, 3.2, 2.4)
    tree(13, 40, 3.0, 2.0)

    # ------------------------------------------------------- planta baja
    H = 3.2
    # forjado de suelo interior
    box(-8.0, 8.0, 0, 0.02, 10.0, 26.3, "madera_suelo", "interior")
    # fachada delantera z 10..10.3
    box(-8.3, -0.7, 0, H, 10.0, 10.3, "piedra", "fachada")
    box(-0.7, 0.7, 2.8, H, 10.0, 10.3, "piedra", "fachada")
    box(0.7, 2.5, 0, H, 10.0, 10.3, "revoco", "fachada")
    box(7.0, 8.3, 0, H, 10.0, 10.3, "revoco", "fachada")
    box(2.5, 7.0, 0, 0.7, 10.0, 10.3, "revoco", "fachada")
    box(2.5, 7.0, 2.6, H, 10.0, 10.3, "revoco", "fachada")
    # carpintería ventana delantera
    box(2.5, 7.0, 0.7, 0.76, 10.05, 10.25, "negro", "fachada")
    box(2.5, 7.0, 2.54, 2.6, 10.05, 10.25, "negro", "fachada")
    box(4.72, 4.78, 0.7, 2.6, 10.05, 10.25, "negro", "fachada")
    # marco de puerta y puerta pivotante abierta (color corporativo)
    box(-0.76, -0.7, 0, 2.8, 9.95, 10.3, "negro", "fachada")
    box(0.7, 0.76, 0, 2.8, 9.95, 10.3, "negro", "fachada")
    box(-0.76, 0.76, 2.74, 2.8, 9.95, 10.3, "negro", "fachada")
    box(-0.72, -0.64, 0.01, 2.72, 10.35, 11.65, "puerta", "fachada")
    # escalón / felpudo
    box(-1.2, 1.2, 0, 0.06, 9.0, 10.0, "piedra", "fachada")
    # paredes laterales
    box(-8.3, -8.0, 0, H, 10.0, 26.3, "revoco", "fachada")
    box(8.0, 8.3, 0, H, 10.0, 18.0, "revoco", "fachada")
    box(8.0, 8.3, 0, H, 25.0, 26.3, "revoco", "fachada")
    box(8.0, 8.3, 0, 0.35, 18.0, 25.0, "revoco", "fachada")
    box(8.0, 8.3, 2.85, H, 18.0, 25.0, "revoco", "fachada")
    for zz in (20.3, 22.65):
        box(8.02, 8.28, 0.35, 2.85, zz - 0.03, zz + 0.03, "negro", "fachada")
    # pared trasera con gran ventanal
    box(-8.3, -6.0, 0, H, 26.0, 26.3, "revoco", "fachada")
    box(6.0, 8.3, 0, H, 26.0, 26.3, "revoco", "fachada")
    box(-6.0, 6.0, 2.95, H, 26.0, 26.3, "revoco", "fachada")
    for xx in (-2.0, 2.0):
        box(xx - 0.03, xx + 0.03, 0, 2.95, 26.1, 26.2, "negro", "fachada")
    box(-6.0, 6.0, 2.9, 2.95, 26.05, 26.25, "negro", "fachada")
    # cubierta planta baja (vuelo delantero que hace sombra)
    box(-8.8, 8.8, H, 3.5, 9.2, 26.9, "techo", "fachada")

    # volumen superior en voladizo
    Y0, Y1 = 3.5, 6.6
    box(-8.5, 2.5, Y0, Y1, 8.7, 20.0, "revoco", "fachada")
    box(-8.5, 2.5, Y0, 4.4, 8.4, 8.7, "revoco", "fachada")
    box(-8.5, 2.5, 5.8, Y1, 8.4, 8.7, "revoco", "fachada")
    box(-8.5, -7.5, 4.4, 5.8, 8.4, 8.7, "revoco", "fachada")
    box(1.5, 2.5, 4.4, 5.8, 8.4, 8.7, "revoco", "fachada")
    box(-7.5, 1.5, 4.4, 5.8, 8.55, 8.62, "vidrio", "fachada")
    for xx in (-4.5, -1.5):
        box(xx - 0.03, xx + 0.03, 4.4, 5.8, 8.5, 8.6, "negro", "fachada")
    # lamas de madera en el voladizo
    x = -8.45
    while x < -5.2:
        box(x, x + 0.07, Y0 + 0.05, Y1 - 0.05, 8.3, 8.4, "nogal", "fachada")
        x += 0.17
    # remate de cubierta superior
    box(-8.6, 2.6, Y1, Y1 + 0.15, 8.3, 20.1, "techo", "fachada")

    # --------------------------------------------------------- pasillo
    box(-0.95, -0.8, 0, H, 10.3, 17.0, "revoco", "interior")
    box(0.8, 0.95, 0, H, 10.3, 17.0, "revoco", "interior")
    box(-0.8, 0.8, 2.9, H, 10.3, 17.0, "techo", "interior")
    box(-0.04, 0.04, 2.88, 2.9, 10.8, 16.6, "luz", "interior")
    # obra de arte granate y consola
    box(-0.8, -0.78, 1.0, 2.25, 12.4, 14.2, "granate", "mueble")
    box(0.42, 0.8, 0.8, 0.85, 13.0, 14.6, "nogal", "mueble")
    box(0.46, 0.5, 0, 0.8, 13.05, 13.12, "nogal", "mueble")
    box(0.46, 0.5, 0, 0.8, 14.48, 14.55, "nogal", "mueble")
    sph(0.62, 1.0, 13.5, 0.15, "ceramica", "mueble")
    sph(0.6, 0.93, 14.15, 0.09, "granate", "mueble")
    # pared entre pasillo y salón
    box(-8.0, -0.95, 0, H, 17.0, 17.3, "revoco", "interior")
    box(0.95, 8.0, 0, H, 17.0, 17.3, "revoco", "interior")
    box(-0.95, 0.95, 2.9, H, 17.0, 17.3, "revoco", "interior")

    # despacho tras la ventana delantera
    box(3.2, 6.2, 0.74, 0.78, 15.6, 16.4, "nogal", "mueble")
    box(3.25, 3.3, 0, 0.74, 15.65, 16.35, "negro", "mueble")
    box(6.1, 6.15, 0, 0.74, 15.65, 16.35, "negro", "mueble")
    sph(5.6, 1.0, 16.0, 0.12, "ceramica", "mueble")

    # ----------------------------------------------------------- salón
    box(-3.4, 1.4, 0.02, 0.035, 19.4, 23.6, "alfombra", "mueble")
    # sofá mirando al jardín
    box(-5.4, -1.6, 0.06, 0.44, 20.0, 21.05, "tela", "mueble")
    box(-5.4, -1.6, 0.44, 0.86, 20.0, 20.28, "tela", "mueble")
    box(-5.4, -5.2, 0.44, 0.62, 20.28, 21.05, "tela", "mueble")
    box(-1.8, -1.6, 0.44, 0.62, 20.28, 21.05, "tela", "mueble")
    box(-4.9, -4.4, 0.44, 0.78, 20.28, 20.48, "granate", "mueble")
    box(-2.6, -2.1, 0.44, 0.76, 20.28, 20.48, "granate", "mueble")
    # mesa de centro
    box(-4.3, -2.7, 0.32, 0.37, 21.6, 22.5, "nogal", "mueble")
    box(-4.1, -2.9, 0.035, 0.32, 21.75, 22.35, "negro", "mueble")
    sph(-3.2, 0.45, 22.05, 0.09, "ceramica", "mueble")
    # sillón
    box(-1.0, 0.0, 0.06, 0.42, 22.6, 23.5, "tela", "mueble")
    box(-1.0, -0.82, 0.42, 0.85, 22.6, 23.5, "tela", "mueble")
    # lámparas colgantes
    for (lx, lz) in ((-4.0, 22.0), (-2.9, 22.1)):
        box(lx - 0.006, lx + 0.006, 2.45, H, lz - 0.006, lz + 0.006, "negro", "mueble")
        sph(lx, 2.3, lz, 0.17, "luz", "mueble")
    # isla de cocina en mármol
    box(3.0, 6.0, 0.02, 0.9, 20.6, 21.9, "marmol", "mueble")
    box(2.88, 6.12, 0.9, 0.95, 20.48, 22.02, "marmol", "mueble")
    for sx in (3.5, 4.5, 5.5):
        box(sx - 0.2, sx + 0.2, 0.62, 0.66, 19.85, 20.25, "nogal", "mueble")
        box(sx - 0.03, sx + 0.03, 0.02, 0.62, 20.02, 20.08, "negro", "mueble")
    sph(4.6, 1.08, 21.3, 0.13, "ceramica", "mueble")
    # librería en la pared izquierda
    box(-8.0, -7.55, 0.02, 0.5, 18.2, 25.2, "nogal", "mueble")
    for zz in (18.2, 20.0, 21.8, 23.6, 25.15):
        box(-8.0, -7.6, 0.5, 2.7, zz, zz + 0.05, "nogal", "mueble")
    for yy in (1.2, 1.9, 2.65):
        box(-8.0, -7.6, yy, yy + 0.04, 18.2, 25.2, "nogal", "mueble")
    sph(-7.8, 1.38, 19.0, 0.14, "ceramica", "mueble")
    sph(-7.78, 2.07, 22.4, 0.13, "granate", "mueble")
    box(-7.95, -7.65, 1.24, 1.55, 24.0, 24.4, "granate", "mueble")
    box(-7.95, -7.7, 0.54, 0.85, 21.0, 21.3, "ceramica", "mueble")
    # planta junto al ventanal
    box(5.1, 5.6, 0.02, 0.5, 25.2, 25.7, "hormigon", "mueble")
    sph(5.35, 1.15, 25.45, 0.6, "follaje", "mueble")

    # ---------------------------------------------- terraza y piscina
    box(-8.0, 8.0, 0, 0.03, 26.3, 29.0, "piedra_suelo", "jardin")
    box(-8.0, 2.0, 0, 0.03, 29.0, 34.0, "piedra_suelo", "jardin")
    box(7.5, 8.0, 0, 0.03, 29.0, 34.0, "piedra_suelo", "jardin")
    box(2.0, 7.5, 0, 0.03, 33.5, 34.0, "piedra_suelo", "jardin")
    box(2.0, 7.5, 0, 0.026, 29.0, 33.5, "agua", "jardin")
    # tumbonas
    for tx in (-5.5, -3.8):
        box(tx - 0.35, tx + 0.35, 0.03, 0.38, 29.5, 31.4, "tela", "jardin")
        box(tx - 0.35, tx + 0.35, 0.38, 0.75, 29.5, 29.75, "tela", "jardin")

    # ---------------------------------------- ampliación en construcción
    Z0, Z1 = 37.0, 47.0
    box(-7.0, 7.0, 0, 0.25, Z0, Z1, "hormigon", "obra")
    cols_x = (-6.6, -2.2, 2.2, 6.6)
    cols_z = (Z0 + 0.4, 42.0, Z1 - 0.4)
    for cx in cols_x:
        for cz in cols_z:
            box(cx - 0.18, cx + 0.18, 0.25, 3.45, cz - 0.18, cz + 0.18, "hormigon", "obra")
    box(-7.0, 7.0, 3.45, 3.7, Z0, Z1, "hormigon", "obra")
    # vigas descolgadas
    for cz in cols_z:
        box(-7.0, 7.0, 3.1, 3.45, cz - 0.18, cz + 0.18, "hormigon", "obra")
    # segunda planta a medio levantar
    for cx in (-6.6, -2.2):
        for cz in cols_z:
            box(cx - 0.18, cx + 0.18, 3.7, 6.7, cz - 0.18, cz + 0.18, "hormigon", "obra")
    for cx in (2.2, 6.6):
        for cz in cols_z:
            box(cx - 0.18, cx + 0.18, 3.7, 4.6, cz - 0.18, cz + 0.18, "hormigon", "obra")
    box(-7.0, -0.6, 6.7, 6.95, Z0, Z1, "hormigon", "obra")
    # puntales bajo el forjado superior
    for px in (-5.4, -4.4, -3.4, -1.2):
        for pz in (38.6, 40.0, 43.6, 45.2):
            box(px - 0.035, px + 0.035, 3.7, 6.7, pz - 0.035, pz + 0.035, "andamio", "obra")
    # muros de bloque a medio hacer
    box(-7.0, -1.0, 0.25, 1.65, Z1 - 0.3, Z1 - 0.1, "bloque", "obra")
    box(1.0, 7.0, 0.25, 2.45, Z1 - 0.3, Z1 - 0.1, "bloque", "obra")
    box(-7.0, -6.8, 0.25, 2.1, 38.0, 41.6, "bloque", "obra")
    # palés y material
    box(3.4, 4.6, 0.25, 0.4, 39.0, 40.0, "tablon", "obra")
    box(3.45, 4.55, 0.4, 1.05, 39.05, 39.95, "bloque", "obra")
    box(4.9, 6.1, 0.25, 0.4, 38.9, 39.9, "tablon", "obra")
    box(4.95, 6.05, 0.4, 0.85, 38.95, 39.85, "bloque", "obra")
    # andamio en el lateral izquierdo
    for az in np.arange(Z0, Z1 + 0.01, 2.0):
        for ax in (-7.95, -7.25):
            box(ax - 0.03, ax + 0.03, 0, 7.6, az - 0.03, az + 0.03, "andamio", "obra")
    for ay in (2.0, 4.0, 6.0, 7.5):
        for ax in (-7.95, -7.25):
            box(ax - 0.025, ax + 0.025, ay - 0.025, ay + 0.025, Z0, Z1, "andamio", "obra")
    for ay in (2.0, 4.0, 6.0):
        box(-7.95, -7.25, ay + 0.03, ay + 0.08, Z0, Z1, "tablon", "obra")
    # grúa torre
    gx, gz = 10.5, 50.0
    box(gx - 0.45, gx + 0.45, 0, 24.0, gz - 0.45, gz + 0.45, "grua", "obra")
    box(gx - 26.0, gx + 7.0, 24.0, 24.9, gz - 0.4, gz + 0.4, "grua", "obra")
    box(gx - 0.7, gx + 0.7, 24.9, 28.0, gz - 0.5, gz + 0.5, "grua", "obra")
    box(gx + 4.0, gx + 7.0, 22.8, 24.0, gz - 0.7, gz + 0.7, "hormigon", "obra")
    box(gx - 1.2, gx + 0.8, 22.4, 24.0, gz - 1.0, gz - 0.45, "grua", "obra")
    box(gx - 14.0, gx - 13.98, 12.0, 24.0, gz - 0.01, gz + 0.01, "negro", "obra")
    box(gx - 14.5, gx - 13.5, 11.4, 12.0, gz - 0.5, gz + 0.5, "tablon", "obra")
    # vallado de obra
    box(-11.0, -2.5, 0, 2.0, 35.3, 35.36, "valla", "obra")
    box(2.5, 11.0, 0, 2.0, 35.3, 35.36, "valla", "obra")

    return pack()


def pack():
    b = sorted(_boxes, key=lambda r: r[7])
    s = sorted(_spheres, key=lambda r: r[5])
    nC = max(CL.values()) + 1
    boxes = np.array([r[:6] for r in b], dtype=np.float64)
    bmat = np.array([r[6] for r in b], dtype=np.int64)
    bcl = np.array([r[7] for r in b], dtype=np.int64)
    sph_ = np.array([r[:4] for r in s], dtype=np.float64)
    smat = np.array([r[4] for r in s], dtype=np.int64)
    scl = np.array([r[5] for r in s], dtype=np.int64)
    cbox = np.zeros((nC, 6))
    crange = np.zeros((nC, 4), dtype=np.int64)
    for c in range(nC):
        bi = np.where(bcl == c)[0]
        si = np.where(scl == c)[0]
        lo = np.array([np.inf] * 3)
        hi = np.array([-np.inf] * 3)
        if len(bi):
            lo = np.minimum(lo, boxes[bi][:, [0, 2, 4]].min(0))
            hi = np.maximum(hi, boxes[bi][:, [1, 3, 5]].max(0))
            crange[c, 0], crange[c, 1] = bi[0], bi[-1] + 1
        if len(si):
            lo = np.minimum(lo, (sph_[si][:, :3] - sph_[si][:, 3:4]).min(0))
            hi = np.maximum(hi, (sph_[si][:, :3] + sph_[si][:, 3:4]).max(0))
            crange[c, 2], crange[c, 3] = si[0], si[-1] + 1
        cbox[c] = (lo[0] - 1e-3, hi[0] + 1e-3, lo[1] - 1e-3, hi[1] + 1e-3, lo[2] - 1e-3, hi[2] + 1e-3)
    return boxes, bmat, sph_, smat, cbox, crange


LIGHTS = np.array([
    # x, y, z, r, g, b (intensidad), alcance
    [0.0, 2.75, 11.6, 2.2, 1.6, 1.0, 5.0],
    [0.0, 2.75, 14.0, 2.2, 1.6, 1.0, 5.0],
    [0.0, 2.75, 16.4, 2.2, 1.6, 1.0, 5.0],
    [-4.0, 2.3, 22.0, 2.0, 1.5, 0.9, 6.0],
    [-2.9, 2.3, 22.1, 2.0, 1.5, 0.9, 6.0],
    [4.5, 3.0, 21.3, 1.4, 1.1, 0.75, 5.0],
])

# ------------------------------------------------------------- cámara
# (t, posición, objetivo). t = progreso del scroll 0..1
CAM_KEYS = [
    (0.00, (3.2, 1.75, -8.5), (-0.6, 2.7, 10.0)),
    (0.13, (1.7, 1.70, -1.5), (0.0, 2.0, 10.0)),
    (0.26, (0.3, 1.65, 6.2), (0.0, 1.6, 12.0)),
    (0.35, (0.05, 1.65, 10.15), (0.0, 1.6, 16.0)),
    (0.46, (0.0, 1.65, 14.2), (0.15, 1.5, 20.0)),
    (0.57, (0.35, 1.65, 18.0), (-2.6, 1.15, 23.0)),
    (0.67, (0.9, 1.65, 21.4), (2.6, 1.25, 27.0)),
    (0.77, (0.6, 1.65, 26.1), (0.0, 1.8, 34.0)),
    (0.88, (0.2, 1.70, 30.6), (-0.6, 2.9, 41.0)),
    (1.00, (0.4, 1.75, 35.6), (-1.2, 4.2, 46.0)),
]


def _catmull(p0, p1, p2, p3, u):
    u2, u3 = u * u, u * u * u
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3)


def camera_at(t):
    ts = [k[0] for k in CAM_KEYS]
    P = [np.array(k[1], float) for k in CAM_KEYS]
    T = [np.array(k[2], float) for k in CAM_KEYS]
    t = min(max(t, 0.0), 1.0)
    i = 0
    while i < len(ts) - 2 and t > ts[i + 1]:
        i += 1
    u = (t - ts[i]) / (ts[i + 1] - ts[i])
    i0, i1, i2, i3 = max(i - 1, 0), i, i + 1, min(i + 2, len(ts) - 1)
    pos = _catmull(P[i0], P[i1], P[i2], P[i3], u)
    tgt = _catmull(T[i0], T[i1], T[i2], T[i3], u)
    return pos, tgt
