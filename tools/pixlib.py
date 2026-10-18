"""Mini biblioteca de pixel art (só usa Pillow). Cores em hex; None = transparente."""
from PIL import Image

def rgba(c):
    if c is None: return None
    if isinstance(c, tuple): return c
    c = c.lstrip('#')
    if len(c) == 6: return (int(c[0:2],16), int(c[2:4],16), int(c[4:6],16), 255)
    return (int(c[0:2],16), int(c[2:4],16), int(c[4:6],16), int(c[6:8],16))

class Cv:
    def __init__(s, w, h):
        s.w, s.h = w, h
        s.p = [[None]*w for _ in range(h)]
    def px(s, x, y, c, sym=False):
        c = rgba(c)
        for xx in ([x, s.w-1-x] if sym else [x]):
            if 0 <= xx < s.w and 0 <= y < s.h: s.p[y][xx] = c
    def get(s, x, y):
        return s.p[y][x] if 0 <= x < s.w and 0 <= y < s.h else None
    def rect(s, x0, y0, x1, y1, c, sym=False):
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): s.px(x, y, c, sym)
    def ell(s, cx, cy, rx, ry, c, sym=False):
        for y in range(s.h):
            for x in range(s.w):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: s.px(x, y, c, sym)
    def line(s, x0, y0, x1, y1, c, sym=False):
        dx, dy = abs(x1-x0), -abs(y1-y0); sx = 1 if x0 < x1 else -1; sy = 1 if y0 < y1 else -1
        e = dx+dy
        while True:
            s.px(x0, y0, c, sym)
            if x0 == x1 and y0 == y1: break
            e2 = 2*e
            if e2 >= dy: e += dy; x0 += sx
            if e2 <= dx: e += dx; y0 += sy
    def poly(s, pts, c, sym=False):
        n = len(pts)
        for y in range(s.h):
            for x in range(s.w):
                X, Y = x+.5, y+.5; ins = False; j = n-1
                for i in range(n):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > Y) != (yj > Y) and X < (xj-xi)*(Y-yi)/(yj-yi)+xi: ins = not ins
                    j = i
                if ins: s.px(x, y, c, sym)
    def outline(s, c):
        c = rgba(c); add = []
        for y in range(s.h):
            for x in range(s.w):
                if s.p[y][x] is None:
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                        q = s.get(x+dx, y+dy)
                        if q is not None and q[3] > 200: add.append((x, y)); break
        for x, y in add: s.p[y][x] = c
    def paste(s, o, ox, oy):
        for y in range(o.h):
            for x in range(o.w):
                if o.p[y][x] is not None and 0 <= x+ox < s.w and 0 <= y+oy < s.h: s.p[y+oy][x+ox] = o.p[y][x]
    def flip(s):
        n = Cv(s.w, s.h)
        for y in range(s.h): n.p[y] = list(reversed(s.p[y]))
        return n
    def img(s, scale=1):
        im = Image.new('RGBA', (s.w, s.h), (0,0,0,0))
        for y in range(s.h):
            for x in range(s.w):
                if s.p[y][x] is not None: im.putpixel((x, y), s.p[y][x])
        return im.resize((s.w*scale, s.h*scale), Image.NEAREST) if scale != 1 else im
