from pixlib import Cv
from art_player import (OUT, SK, SKS, SKL, HAIR, HAIRL, HAIR_HI, HAIRS, JK, JKL, JKD, JKDD, PANEL, PANELD,
                        PANT, PANTD, PANTL, SHOE, SHOED, SOLE, SHIRT, BELT, GOLD, GREEN, CY, STEEL, STEELD, NEON, NEON_L, PINK)

def _leg(c, x0, x1, mode, toe=None):
    top, shoe = {0: (12, 14), 'f': (11, 14), 'b': (11, 13)}[mode]
    c.rect(x0, top, x1, shoe-1, PANT); c.rect(x0, top, x0, shoe-1, PANTD)
    c.rect(x0, shoe, x1, shoe, SHOE); c.rect(x0, shoe+1, x1, shoe+1, SOLE)
    if toe is not None: c.px(toe, shoe, SHOE); c.px(toe, shoe+1, SOLE)

def _arms(c, f, dy, back=False):
    la = 4 + (-1 if f == 1 else 1 if f == 3 else 0); ra = 4 + (1 if f == 1 else -1 if f == 3 else 0)
    for x, n in ((3, la), (12, ra)):
        c.rect(x, 8+dy, x, 8+dy+n-1, JKD); c.px(x, 9+dy, NEON); c.px(x, 8+dy+n-1, PANELD); c.px(x, 8+dy+n, SKS if x == 3 else SK)

def hero_front(f):
    c = Cv(16, 16); st = f in (1, 3); dy = -1 if st else 0
    lm, rm = (('f','b') if f == 1 else ('b','f')) if st else (0, 0)
    _leg(c, 5, 7, lm); _leg(c, 8, 10, rm); _arms(c, f, dy)
    c.rect(4, 8+dy, 11, 11+dy, JK); c.rect(4, 8+dy, 4, 11+dy, JKD); c.rect(11, 8+dy, 11, 11+dy, JKL)
    c.rect(7, 8+dy, 8, 11+dy, SHIRT); c.px(7, 9+dy, GOLD)                      # abertura da jaqueta + corrente
    c.rect(4, 10+dy, 11, 10+dy, NEON); c.rect(4, 11+dy, 11, 11+dy, PANEL)      # faixa refletiva + barra cinza
    c.rect(7, 10+dy, 8, 10+dy, NEON_L)
    c.rect(6, 7+dy, 9, 7+dy, SKS)                                              # pescoço
    c.rect(4, 6+dy, 5, 7+dy, JKD); c.rect(10, 6+dy, 11, 7+dy, JKL)             # gola alta
    c.rect(5, 4+dy, 10, 6+dy, SK); c.rect(5, 6+dy, 6, 6+dy, SKS); c.px(8, 6+dy, '#a85f4a')
    c.px(6, 5+dy, BELT); c.px(9, 5+dy, NEON); c.px(6, 4+dy, HAIR); c.px(9, 4+dy, HAIR)
    c.rect(5, 1+dy, 10, 3+dy, HAIR); c.rect(4, 3+dy, 4, 5+dy, HAIRS); c.rect(11, 3+dy, 11, 5+dy, HAIRS)
    c.rect(6, 1+dy, 9, 1+dy, HAIRL); c.px(9, 1+dy, HAIR_HI); c.px(7, 0+dy, HAIR); c.px(8, 0+dy, HAIR); c.px(6, 3+dy, HAIR); c.px(5, 4+dy, HAIR)
    c.outline(OUT); return c

def hero_back(f):
    c = Cv(16, 16); st = f in (1, 3); dy = -1 if st else 0
    lm, rm = (('f','b') if f == 1 else ('b','f')) if st else (0, 0)
    _leg(c, 5, 7, lm); _leg(c, 8, 10, rm); _arms(c, f, dy)
    c.rect(4, 8+dy, 11, 11+dy, JK); c.rect(4, 8+dy, 5, 11+dy, JKD); c.rect(10, 8+dy, 11, 11+dy, JKL)
    c.rect(7, 7+dy, 8, 11+dy, NEON); c.px(7, 9+dy, NEON_L); c.px(8, 8+dy, NEON_L)  # implante na coluna
    c.rect(4, 10+dy, 6, 10+dy, NEON); c.rect(9, 10+dy, 11, 10+dy, NEON); c.rect(4, 11+dy, 11, 11+dy, PANEL)
    c.rect(4, 6+dy, 11, 7+dy, JKD); c.rect(5, 6+dy, 10, 6+dy, JK)              # gola alta (de trás)
    c.rect(5, 1+dy, 10, 5+dy, HAIR); c.rect(4, 3+dy, 4, 5+dy, HAIRS); c.rect(11, 3+dy, 11, 5+dy, HAIRS)
    c.rect(5, 5+dy, 10, 5+dy, HAIRS)                                          # nuca raspada
    c.rect(6, 1+dy, 9, 1+dy, HAIRL); c.px(9, 2+dy, HAIR_HI); c.px(7, 0+dy, HAIR); c.px(8, 0+dy, HAIR)
    c.px(4, 5+dy, SKS); c.px(11, 5+dy, SK)
    c.outline(OUT); return c

def hero_left(f):
    c = Cv(16, 16); st = f in (1, 3); dy = -1 if st else 0
    if f == 0 or f == 2:
        _leg(c, 6, 7, 0, toe=5); _leg(c, 8, 9, 0)
    elif f == 1:
        _leg(c, 4, 5, 'f', toe=3); _leg(c, 9, 10, 'b')
    else:
        _leg(c, 9, 10, 'b'); _leg(c, 5, 6, 'f', toe=4)
    c.rect(5, 8+dy, 10, 11+dy, JK); c.rect(9, 8+dy, 10, 11+dy, JKD); c.rect(5, 8+dy, 5, 11+dy, JKL)
    c.rect(10, 8+dy, 10, 11+dy, NEON)                                          # implante na borda das costas
    c.px(10, 9+dy, NEON_L); c.px(10, 11+dy, NEON_L)
    c.rect(5, 10+dy, 9, 10+dy, NEON); c.rect(5, 11+dy, 10, 11+dy, PANEL)
    c.rect(6, 7+dy, 9, 7+dy, SKS)                                              # pescoço
    c.rect(7, 6+dy, 10, 7+dy, JKD); c.rect(6, 6+dy, 6, 7+dy, JKL)              # gola alta
    ax = {0: 7, 2: 7, 1: 5, 3: 9}[f]
    c.rect(ax, 8+dy, ax+1, 11+dy, JKD); c.rect(ax, 8+dy, ax, 11+dy, JKL); c.px(ax, 9+dy, NEON); c.px(ax, 11+dy, PANELD)
    c.px(ax, 12+dy, SK); c.px(ax+1, 12+dy, SKS)
    c.rect(4, 4+dy, 9, 6+dy, SK); c.px(3, 5+dy, SK); c.rect(4, 6+dy, 9, 6+dy, SKS); c.px(4, 6+dy, '#8a4a3e')
    c.px(5, 5+dy, NEON); c.px(5, 4+dy, HAIR); c.px(8, 6+dy, NEON)               # olho de implante, sobrancelha, brinco
    c.rect(6, 1+dy, 11, 3+dy, HAIR); c.rect(8, 4+dy, 11, 6+dy, HAIRS); c.rect(4, 3+dy, 6, 3+dy, HAIR)
    c.rect(6, 1+dy, 9, 1+dy, HAIRL); c.px(7, 1+dy, HAIR_HI); c.px(9, 0+dy, HAIR); c.px(8, 0+dy, HAIR); c.px(5, 4+dy, HAIR)
    c.outline(OUT); return c

def hero_sheet():
    """Folha 64x64: linhas = baixo, esquerda, direita, cima; colunas = 4 quadros."""
    sh = Cv(64, 64)
    for f in range(4):
        sh.paste(hero_front(f), f*16, 0); sh.paste(hero_left(f), f*16, 16)
        sh.paste(hero_left(f).flip(), f*16, 32); sh.paste(hero_back(f), f*16, 48)
    return sh

# ---------------- Tiles 16x16 ----------------
def _floor(base, line):
    c = Cv(16, 16); c.rect(0, 0, 15, 15, base)
    c.rect(0, 0, 15, 0, line); c.rect(0, 0, 0, 15, line)
    return c

def tile_floor_a(): c = _floor('#121828', '#19213a'); c.px(8, 8, '#1a2342'); return c
def tile_floor_b(): c = _floor('#0f1422', '#161d34'); c.px(4, 11, '#18203a'); c.px(11, 4, '#18203a'); return c
def tile_floor_c():
    c = _floor('#121828', '#19213a')
    c.line(2, 8, 7, 8, '#1f4a6e'); c.line(7, 8, 7, 3, '#1f4a6e'); c.line(7, 3, 12, 3, '#1f4a6e')
    c.line(7, 8, 12, 12, '#1f4a6e'); c.px(2, 8, CY); c.px(12, 3, CY); c.px(12, 12, '#b66cff'); c.px(7, 8, '#3ee8ff99')
    return c
def tile_wall():
    c = Cv(16, 16); c.rect(0, 0, 15, 15, '#1c2442')
    c.rect(0, 0, 15, 2, '#2f3d78'); c.rect(0, 0, 15, 0, '#3ee8ff')           # topo iluminado
    c.rect(0, 13, 15, 15, '#10152c'); c.rect(0, 15, 15, 15, '#0a0e1e')       # sombra
    c.rect(0, 8, 15, 8, '#141b36'); c.rect(7, 3, 7, 7, '#141b36'); c.rect(3, 9, 3, 12, '#141b36'); c.rect(11, 9, 11, 12, '#141b36')
    c.rect(0, 3, 0, 12, '#26305c'); c.rect(15, 3, 15, 12, '#141b36')
    c.px(2, 5, '#3ee8ff'); c.px(13, 5, '#3ee8ff88'); c.px(13, 11, '#b66cff'); c.px(5, 11, '#2f3d78')
    return c
def tile_terminal():
    c = _floor('#121828', '#19213a')
    c.rect(2, 11, 13, 14, '#0b2a36'); c.rect(2, 11, 13, 11, '#1b5b73'); c.rect(2, 14, 13, 14, '#06141b')   # mesa
    c.rect(3, 12, 12, 13, '#14485b')                                                                     # teclado
    for x in (4, 6, 8, 10): c.px(x, 12, '#7fe9ff')
    c.rect(3, 1, 12, 9, '#0f3a4a'); c.rect(3, 1, 12, 1, '#1b5b73')                                       # monitor
    c.rect(4, 2, 11, 8, '#06130d')                                                                       # tela
    c.rect(5, 3, 8, 3, GREEN); c.rect(5, 5, 10, 5, GREEN); c.rect(5, 7, 7, 7, '#2fbf66'); c.px(9, 7, '#ffffff')
    c.rect(7, 9, 8, 10, '#0b2a36')                                                                       # suporte
    c.rect(0, 0, 15, 15, None) if False else None
    return c

TILES = [tile_floor_a, tile_floor_b, tile_floor_c, tile_wall, tile_terminal]
def tileset():
    sh = Cv(16*len(TILES), 16)
    for i, f in enumerate(TILES): sh.paste(f(), i*16, 0)
    return sh
