#!/bin/sh
# Renderiza todo el material provisional (≈45 min en 2 núcleos)
set -e
cd "$(dirname "$0")"
PUB=../../public
python3 render.py frames --out $PUB/recorrido/escritorio --w 1600 --h 900 --n 240 --fov 55
python3 render.py frames --out $PUB/recorrido/movil --w 540 --h 960 --n 120 --fov 80 --q 70
python3 render.py stills --out $PUB/proyectos --w 1600 --h 1000 --fov 50
rm -f $PUB/recorrido/_exp_*.npy
