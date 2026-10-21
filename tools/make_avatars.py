#!/usr/bin/env python3
"""Gera as variações de cor da jaqueta do herói (avatares da tela de acesso).
Troca só os pixels da faixa amarelo-limão (jaqueta); pele, cabelo e calça ficam iguais.
Uso: python3 tools/make_avatars.py  (rode depois de make_sprites.py)"""
import os, colorsys
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'sprites')
# índice: (nome, matiz alvo em graus). 0 = original amarelo-limão (não gera arquivo)
VARIANTES = {1: ('GELO', 188), 2: ('PULSO', 312), 3: ('BRASA', 24)}
def recolor(src, dst, hue):
    im = Image.open(os.path.join(ROOT, src)).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if 55 / 360 <= h <= 82 / 360 and s > .35 and l > .18:   # faixa da jaqueta
                nr, ng, nb = colorsys.hls_to_rgb(hue / 360, l, min(1, s * 1.05))
                px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
    im.save(os.path.join(ROOT, dst)); print('ok', dst)
for i, (nome, hue) in VARIANTES.items():
    recolor('player.png', f'player-{i}.png', hue)
    recolor('hero-map.png', f'hero-map-{i}.png', hue)
