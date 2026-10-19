from pixlib import Cv

OUT='#0a0612'
def boss_vampire():
    """CYBER-VAMPIRE, 64x64, de frente, simétrico (sym=True espelha)."""
    c = Cv(64, 64)
    CAPE='#3a1f78'; CAPEL='#6a3fc4'; CAPED='#24114d'; LIN='#8a1580'; LIN2='#b81f99'; LINL='#ff4fd8'
    SUIT='#1a1030'; SUITL='#2e1c52'; PALE='#d9e3ff'; PALES='#9aa8e0'; HAIR='#12121f'
    # asas / capa
    c.poly([(32,27),(24,23),(11,19),(2,29),(4,42),(7,52),(12,48),(15,58),(21,52),(25,61),(32,55)], CAPE, sym=True)
    c.poly([(32,30),(24,27),(13,24),(7,32),(9,42),(11,49),(14,47),(16,54),(21,49),(25,56),(32,51)], LIN, sym=True)
    c.poly([(32,38),(25,34),(16,31),(12,37),(13,44),(16,47),(20,44),(24,49),(28,46),(32,50)], LIN2, sym=True)
    for (x0,y0,x1,y1) in [(24,28,8,34),(24,30,11,50),(26,34,21,50)]:
        c.line(x0,y0,x1,y1,CAPED,sym=True)
    c.line(11,19,2,29,CAPEL,sym=True); c.line(24,23,11,19,CAPEL,sym=True)
    c.line(2,29,4,42,CAPEL,sym=True)
    # pernas
    c.rect(25,48,30,59,SUIT,sym=True); c.rect(26,48,27,59,SUITL,sym=True)
    c.rect(24,58,31,61,LIN,sym=True); c.rect(23,61,31,61,LINL,sym=True)
    # torso
    c.poly([(32,26),(23,26),(22,36),(24,50),(32,50)], SUIT, sym=True)
    c.poly([(32,28),(25,28),(24,36),(26,48),(32,48)], SUITL, sym=True)
    c.line(26,30,26,46,LIN2,sym=True); c.line(29,34,29,46,CAPEL,sym=True)
    c.rect(22,45,41,46,'#0a0612'); c.rect(30,44,33,47,'#ffe66d'); c.rect(31,45,32,46,'#0a0612')
    # núcleo no peito
    c.poly([(32,31),(28,36),(32,41),(36,36)], '#ff4d5e'); c.poly([(32,33),(30,36),(32,39),(34,36)], '#ffb0b8'); c.px(31,35,'#ffffff')
    # gola alta (atrás da cabeça, escura, só a borda rosa)
    c.poly([(31,18),(25,8),(17,6),(19,19),(23,30),(31,30)], CAPED, sym=True)
    c.poly([(31,24),(24,14),(19,12),(21,21),(24,29),(31,29)], '#321a68', sym=True)
    c.line(17,6,19,19,LINL,sym=True); c.line(19,19,23,30,LINL,sym=True); c.line(17,6,19,12,LIN2,sym=True)
    # pescoço
    c.rect(28,24,35,28,PALES); c.poly([(27,27),(36,27),(32,33)], '#12121f')
    # braços (mangas) saindo da capa + mãos com garras
    c.poly([(23,27),(26,31),(15,41),(11,37)], SUIT, sym=True)
    c.line(24,29,13,38,LIN2,sym=True)
    c.ell(12,40,2.8,2.8,PALE,sym=True)
    for dx in (-3,0,3):
        c.line(12+dx,42,12+dx*1.3 if False else 12+dx,46,LINL,sym=True)
    c.ell(12,48,1.4,1.4,'#4dff88',sym=True)
    # cabeça
    c.ell(32,16.5,7.8,9.2,PALE); c.rect(25,21,26,24,PALES,sym=True)
    c.ell(32,10.8,8.4,5.2,HAIR)
    c.poly([(28,14),(32,17),(36,14)], HAIR)                     # bico de viúva
    c.poly([(25,8),(22,1),(28,6)], HAIR, sym=True); c.poly([(29,6),(30,0),(32,5)], HAIR, sym=True)
    c.px(28,6,'#3a3a66',sym=True); c.px(27,8,'#3a3a66',sym=True)
    # sobrancelhas, olhos e presas
    c.line(25,17,29,18,HAIR,sym=True)
    c.rect(26,19,30,20,'#ff4d5e',sym=True); c.rect(27,19,29,19,'#ffd0d6',sym=True)
    c.rect(28,24,35,24,'#7a1a3a'); c.rect(29,25,29,26,'#ffffff'); c.rect(34,25,34,26,'#ffffff')
    c.px(31,22,PALES); c.px(32,22,PALES)
    # monóculo cibernético sobre o olho direito do boss
    c.ell(35.5,19.5,3.6,3.6,'#3ee8ff'); c.ell(35.5,19.5,2.5,2.5,'#07303a'); c.px(35,19,'#ff4d5e'); c.px(36,19,'#ff4d5e'); c.px(35,20,'#ff9aa5')
    c.line(38,17,41,14,'#3ee8ff'); c.line(41,14,41,10,'#3ee8ff'); c.px(41,9,'#3ee8ff')
    c.outline(OUT)
    # bits de dados flutuando
    for (x,y) in [(6,14),(10,8),(55,10),(58,18),(4,22),(60,26)]:
        c.rect(x,y,x+1,y+1,'#4dff88')
    return c

def boss_warden():
    """SYNTH-WARDEN, 64x64, robô-guardião simétrico."""
    c = Cv(64, 64)
    ST='#5d6b83'; STL='#93a3c0'; STD='#333c50'; STDD='#222838'; GR='#4dff88'; CY='#3ee8ff'; PK='#ff4fd8'; RD='#ff4d5e'
    # pernas
    c.rect(22,45,29,59,ST,sym=True); c.rect(22,45,23,59,STL,sym=True); c.rect(28,45,29,59,STD,sym=True)
    c.rect(24,51,27,53,STDD,sym=True)
    c.rect(19,58,30,62,STD,sym=True); c.rect(19,58,30,59,ST,sym=True)
    # tronco
    c.poly([(32,22),(20,22),(18,32),(21,47),(32,47)], ST, sym=True)
    c.rect(20,23,22,46,STL,sym=True); c.rect(28,24,31,46,'#4a566c',sym=True)
    c.rect(19,43,44,46,STD); c.rect(29,42,34,47,'#ffe66d'); c.rect(30,43,33,46,STDD)
    # painel de equalizador no peito
    c.rect(23,27,40,41,'#0a1a14'); c.rect(23,27,40,27,CY); c.rect(23,41,40,41,CY)
    c.rect(23,27,23,41,CY); c.rect(40,27,40,41,CY)
    hs = [6,9,12,8,11,5,10,7]
    for i,h in enumerate(hs):
        x = 25 + i*2
        col = GR if h < 10 else (CY if h < 12 else PK)
        c.rect(x, 40-h, x, 39, col)
    c.px(25,29,'#ffffff'); c.px(38,29,'#ffffff')
    # ombreiras com espetos
    c.ell(14.5,26,7.5,6.2,STD,sym=True); c.ell(14.5,25,6.4,5,ST,sym=True); c.ell(13,23,3.2,2.2,STL,sym=True)
    c.poly([(10,21),(8,13),(13,20)], STL, sym=True); c.poly([(15,20),(15,12),(19,20)], STL, sym=True)
    c.rect(11,26,17,27,STDD,sym=True)
    # braços
    c.rect(8,31,14,43,ST,sym=True); c.rect(8,31,9,43,STL,sym=True); c.rect(13,31,14,43,STD,sym=True)
    c.rect(7,38,15,40,STD,sym=True); c.px(11,39,GR,sym=True)
    c.rect(6,44,15,52,STD,sym=True); c.rect(7,45,14,50,ST,sym=True); c.rect(7,45,14,45,STL,sym=True)
    c.rect(8,52,9,54,STDD,sym=True); c.rect(12,52,13,54,STDD,sym=True)
    # pescoço + cabeça
    c.rect(28,17,35,22,STDD)
    c.rect(24,5,39,19,ST); c.rect(24,5,39,6,STL); c.rect(24,5,25,19,STL); c.rect(38,5,39,19,STD)
    c.rect(26,3,37,4,STD); c.rect(31,0,32,3,STL); c.px(31,0,RD); c.px(32,0,RD)
    c.rect(26,10,37,15,'#10131c'); c.rect(27,11,36,14,RD); c.rect(29,12,34,13,'#ffd0d6'); c.px(28,11,'#ff9aa5'); c.px(35,11,'#ff9aa5')
    c.rect(26,10,37,10,STDD)
    c.rect(21,8,23,16,STD,sym=True); c.rect(21,10,22,10,GR,sym=True); c.rect(21,12,22,12,GR,sym=True); c.rect(21,14,22,14,GR,sym=True)
    c.rect(27,17,36,18,STD); c.rect(27,17,28,18,'#222838'); c.rect(31,17,32,18,'#222838'); c.rect(35,17,36,18,'#222838')
    c.outline('#05070d')
    return c

def map_vampire(frame):
    c = Cv(16, 16); b = 0 if frame == 0 else -1
    c.poly([(8,7+b),(3,6+b),(1,10+b),(2,14+b),(5,13+b),(8,15+b),(11,13+b),(14,14+b),(15,10+b),(13,6+b)], '#3a1f78')
    c.poly([(8,9+b),(4,8+b),(3,12+b),(5,12+b),(8,14+b),(11,12+b),(13,12+b),(12,8+b)], '#b01a8f')
    c.rect(6,8+b,9,12+b,'#1a1030'); c.px(7,10+b,'#ff4d5e'); c.px(8,10+b,'#ff4d5e')
    c.rect(5,2+b,10,6+b,'#d9e3ff'); c.rect(5,1+b,10,2+b,'#12121f'); c.px(7,3+b,'#12121f'); c.px(8,3+b,'#12121f')
    c.rect(6,4+b,7,4+b,'#ff4d5e' if frame == 0 else '#ffd0d6'); c.rect(9,4+b,9,4+b,'#3ee8ff')
    c.px(6,6+b,'#ffffff'); c.px(9,6+b,'#ffffff')
    c.px(4,3+b,'#3a1f78'); c.px(11,3+b,'#3a1f78'); c.px(4,2+b,'#ff4fd8'); c.px(11,2+b,'#ff4fd8')
    c.outline('#0a0612')
    return c

def map_warden(frame):
    c = Cv(16, 16); b = 0 if frame == 0 else -1
    c.rect(4,3+b,11,8+b,'#5d6b83'); c.rect(4,3+b,11,3+b,'#93a3c0'); c.rect(5,5+b,10,6+b,'#ff4d5e' if frame == 0 else '#ffd0d6')
    c.px(8,1+b,'#ff4d5e'); c.px(8,2+b,'#93a3c0')
    c.rect(3,9+b,12,13+b,'#5d6b83'); c.rect(3,9+b,12,9+b,'#93a3c0'); c.rect(6,10+b,9,12+b,'#0a1a14')
    c.px(6,12+b,'#4dff88'); c.px(7,11+b,'#3ee8ff'); c.px(8,10+b,'#ff4fd8'); c.px(9,11+b,'#4dff88')
    c.rect(1,9+b,2,13+b,'#333c50'); c.rect(13,9+b,14,13+b,'#333c50')
    c.rect(4,14,6,15,'#333c50'); c.rect(9,14,11,15,'#333c50')
    c.outline('#05070d')
    return c


def boss_daemon():
    """ROOT-DAEMON (chefão da fase 3), 64x64, de frente, simétrico."""
    c = Cv(64, 64)
    ROBE='#2a0f1f'; ROBEL='#4a1830'; ROBED='#170710'; TRIM='#d63048'; TRIML='#ff6b7a'
    BONE='#e9e1f2'; BONED='#a79bb8'; GLOW='#ff8a3d'; GLOWL='#fff1c0'; VOID='#06020a'; CYAN='#3ee8ff'
    # mãos flutuantes com garras e orbes de dados
    for x in (7, 56):
        c.ell(x, 36, 4.2, 4.2, ROBE); c.ell(x, 35, 2.4, 2.4, TRIM)
    # manto: grande, rasgado embaixo
    c.poly([(32,24),(22,24),(14,36),(9,54),(15,51),(18,60),(24,55),(28,63),(32,57)], ROBE, sym=True)
    c.poly([(32,26),(24,26),(18,37),(15,52),(20,49),(22,58),(27,53),(32,58)], ROBEL, sym=True)
    c.poly([(32,28),(28,28),(26,40),(25,56),(29,52),(32,57)], ROBED, sym=True)
    c.line(32,28,32,57,TRIM)                                   # costura central
    c.line(21,40,16,52,TRIM,sym=True); c.line(22,26,15,37,TRIML,sym=True)
    # mangas largas e braços
    c.poly([(23,27),(16,29),(8,36),(6,45),(11,44),(16,38),(22,34)], ROBE, sym=True)
    c.poly([(22,28),(16,31),(10,37),(9,42),(13,40),(18,35)], ROBEL, sym=True)
    c.line(6,45,11,44,TRIM,sym=True)
    # ombreiras de osso
    c.poly([(23,24),(15,22),(11,16),(18,19),(24,21)], BONE, sym=True); c.line(11,16,17,19,BONED,sym=True)
    # núcleo no peito
    c.poly([(32,31),(27,37),(32,43),(37,37)], GLOW); c.poly([(32,33),(29,37),(32,41),(35,37)], GLOWL)
    c.rect(22,45,41,46,ROBED); c.rect(30,44,33,47,'#ffe66d'); c.rect(31,45,32,46,ROBED)
    # barras de "código" no peito
    for i, h in enumerate([2,4,3,5]):
        c.rect(23+i*2, 44-h, 23+i*2, 43, CYAN, sym=True)
    # capuz
    c.ell(32, 17, 12, 13, ROBE); c.ell(32, 18, 10.5, 11.5, ROBEL)
    c.poly([(22,10),(32,2),(42,10),(38,5),(32,3),(26,5)], ROBE)
    c.line(21,12,27,5,TRIM,sym=True); c.line(27,5,32,3,TRIML,sym=True)
    # chifres curvos
    c.poly([(23,10),(17,7),(13,2),(11,0),(16,2),(19,5),(25,8)], BONE, sym=True)
    c.poly([(23,10),(19,8),(15,3),(18,5),(22,8)], BONED, sym=True)
    # rosto-vazio
    c.ell(32, 19, 8, 9, VOID)
    # olhos brilhantes
    c.poly([(25,16),(30,17),(30,20),(26,19)], GLOW, sym=True); c.poly([(27,17),(30,18),(30,19),(27,18.5)], GLOWL, sym=True)
    # sorriso de dentes
    c.rect(26,24,37,24,GLOW)
    for x in range(26,38,2): c.rect(x,25,x,26,GLOW)
    c.rect(27,23,36,23,'#7a2a10')
    c.outline('#05020a')
    # janelas/bits flutuando em volta
    for (x,y,col) in [(4,10,CYAN),(8,4,'#50fa7b'),(57,6,CYAN),(60,14,'#50fa7b'),(3,26,'#50fa7b'),(60,24,CYAN),(10,58,CYAN),(53,58,'#50fa7b')]:
        c.rect(x,y,x+1,y+1,col)
    return c

def map_daemon(frame):
    c = Cv(16, 16); b = 0 if frame == 0 else -1
    c.poly([(8,6+b),(3,8+b),(2,14+b),(5,12+b),(8,15+b),(11,12+b),(14,14+b),(13,8+b)], '#2a0f1f')
    c.poly([(8,8+b),(5,10+b),(5,13+b),(8,14+b),(11,13+b),(11,10+b)], '#4a1830')
    c.rect(4,2+b,11,7+b,'#2a0f1f'); c.rect(5,3+b,10,7+b,'#06020a')
    c.px(6,5+b,'#ff8a3d'); c.px(9,5+b,'#ff8a3d' if frame == 0 else '#fff1c0'); c.px(7,5+b,'#ff8a3d'); c.px(8,5+b,'#ff8a3d')
    c.px(7,7+b,'#ff8a3d'); c.px(9,7+b,'#ff8a3d')
    c.px(3,2+b,'#e9e1f2'); c.px(2,1+b,'#e9e1f2'); c.px(12,2+b,'#e9e1f2'); c.px(13,1+b,'#e9e1f2')
    c.px(8,10+b,'#ff8a3d'); c.px(8,11+b,'#fff1c0')
    c.outline('#05020a')
    return c
