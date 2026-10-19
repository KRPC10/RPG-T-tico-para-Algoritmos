"""Animações de corte (estilo Undertale): folhas de 8 quadros 48x48. O jogo exibe com CSS steps()."""
import math
from pixlib import Cv

FRAMES, SZ = 8, 48

def _slash_frame(i, core, mid, edge, glow):
    c = Cv(SZ, SZ)
    x0, y0, x1, y1 = 5, 5, 43, 43                       # diagonal de cima-esquerda para baixo-direita
    L = math.hypot(x1-x0, y1-y0); ux, uy = (x1-x0)/L, (y1-y0)/L
    head = min(1.0, (i+1)/5.0)                         # quadros 0-4: o corte avança
    tail = 0.0 if i < 5 else (i-4)/4.0                 # quadros 5-7: some pela cauda
    wmax = 9.0 if i < 5 else 9.0 * (1 - (i-4)/4.5)
    for y in range(SZ):
        for x in range(SZ):
            px, py = x+.5-x0, y+.5-y0
            t = (px*ux + py*uy) / L
            d = abs(-px*uy + py*ux)
            if t < tail or t > head or t < 0 or t > 1: continue
            w = max(0.6, wmax * (math.sin(math.pi*t) ** 0.7)) / 2     # afina nas pontas
            if d <= w*0.35: c.px(x, y, core)
            elif d <= w*0.7: c.px(x, y, mid)
            elif d <= w: c.px(x, y, edge)
            elif d <= w*1.5 and i < 7: c.px(x, y, glow)
    # faíscas no fim do corte
    if 2 <= i <= 6:
        for k, (dx, dy) in enumerate([(3,-5),(6,2),(-2,5),(7,-2),(1,7)]):
            hx, hy = x0 + (x1-x0)*min(1, head), y0 + (y1-y0)*min(1, head)
            sx, sy = int(hx + dx*(i-1)*0.7), int(hy + dy*(i-1)*0.7)
            if k % 2 == 0 or i < 5: c.px(sx, sy, core)
    return c

def slash_sheet(core, mid, edge, glow):
    sh = Cv(SZ*FRAMES, SZ)
    for i in range(FRAMES): sh.paste(_slash_frame(i, core, mid, edge, glow), i*SZ, 0)
    return sh

def slash_hero():  return slash_sheet('#ffffff', '#c9fbff', '#3ee8ff', '#3ee8ff55')   # branco/ciano: corte do jogador
def slash_boss():  return slash_sheet('#fff1e6', '#ffb36b', '#ff4d5e', '#ff4d5e55')   # laranja/vermelho: corte do chefe
