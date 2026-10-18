from pixlib import Cv

OUT='#0a0d1a'
SK='#ffd7b0'; SKS='#e3a67f'
HAIR='#252a4d'; HAIRL='#3f4a80'
JK='#2fc6e6'; JKL='#8ff4ff'; JKD='#1b8aa8'; JKDD='#12607a'
PANT='#2b3562'; PANTD='#1c2442'; PANTL='#44519a'
SHOE='#ff4fd8'; SHOED='#b82f9a'; SOLE='#f3f6ff'
BELT='#10202a'; GOLD='#ffe66d'; GREEN='#4dff88'; CY='#3ee8ff'; STEEL='#59657a'; STEELD='#3a4354'

def battle_player():
    """Herói da batalha, 48x64, virado para a direita (o inimigo fica à direita)."""
    c = Cv(48, 64)
    # mochila + antena (atrás)
    c.rect(9,27,15,40,STEELD); c.rect(10,28,14,39,STEEL); c.rect(10,28,14,29,'#7b889f')
    c.rect(11,33,13,34,GREEN)
    c.line(11,27,9,19,STEEL); c.px(9,18,CY); c.px(9,17,'#c8fbff')
    # perna de trás
    c.rect(17,43,22,57,PANTD); c.rect(17,43,18,57,'#161c36')
    c.rect(15,57,23,60,SHOED); c.rect(15,61,23,61,SOLE)
    # perna da frente
    c.rect(24,43,30,57,PANT); c.rect(24,43,25,57,PANTL); c.rect(29,43,30,57,PANTD)
    c.rect(24,56,31,57,PANTD)
    c.rect(23,57,33,60,SHOE); c.rect(31,58,34,60,SHOE); c.rect(23,61,34,61,SOLE)
    c.px(33,57,'#ffc2f2'); c.px(32,57,'#ffc2f2')
    # braço de trás
    c.rect(12,29,16,40,JKD); c.rect(12,29,13,40,JKDD)
    c.ell(14.5,42.5,2.6,2.6,SKS)
    # torso
    c.poly([(16,25),(32,25),(34,30),(33,45),(16,45),(14,30)], JK)
    c.rect(16,26,18,44,JKD); c.rect(16,26,17,44,JKDD)       # sombra costas
    c.rect(29,27,32,43,JKL)                                  # luz frente
    c.rect(28,26,28,44,JK)
    c.line(27,26,27,44,JKDD)                                 # zíper
    c.rect(20,33,24,34,GREEN); c.rect(20,37,22,37,GREEN)     # linhas de circuito
    c.px(25,33,GREEN); c.px(25,32,GREEN)
    c.rect(16,41,33,43,BELT); c.rect(26,41,29,43,GOLD); c.rect(27,42,28,42,BELT)
    # gola
    c.poly([(18,23),(31,23),(33,27),(17,27)], JKD); c.rect(19,23,30,24,JKDD)
    # braço da frente levantado (segura o holograma)
    c.poly([(29,27),(34,27),(35,36),(30,36)], JK); c.rect(33,28,34,35,JKL)
    c.poly([(30,33),(36,30),(39,34),(34,39)], JK)
    c.rect(31,34,36,36,BELT); c.px(33,35,GREEN); c.px(34,35,GREEN)
    c.ell(38.5,31.5,2.5,2.5,SK)
    # cabeça
    c.ell(24,14.5,8,9,SK)
    c.rect(16,19,20,22,SKS)                                  # sombra do queixo
    c.ell(23.5,9.6,9.2,5.4,HAIR)                             # cabelo (topo)
    c.rect(15,9,19,22,HAIR)                                  # cabelo de trás
    c.rect(15,9,17,22,'#1b2040')
    c.poly([(18,12),(27,9.5),(32.5,11),(32,13.2),(27,12),(22,15.5),(20,15.5)], HAIR)   # franja
    c.px(31,13,HAIR)
    c.rect(19,5,25,6,HAIRL); c.px(27,5,HAIRL)
    c.poly([(18,5),(21,1.5),(23.5,5)], HAIR); c.poly([(22,5),(26,0.5),(28.5,5)], HAIR)  # tufos
    c.px(26,2,HAIRL); c.px(22,3,HAIRL)
    # óculos na testa
    c.rect(17,8,32,9,BELT)
    c.rect(25,6,30,9,GOLD); c.rect(26,7,29,8,'#fff5b0'); c.rect(25,6,30,6,'#b8962f')
    # rosto
    c.rect(27,16,29,18,'#ffffff'); c.rect(28,16,29,18,BELT); c.px(27,16,'#ffffff')
    c.px(28,17,'#7fe9ff')                                    # brilho do olho
    c.line(26,14,30,14,HAIR)                                 # sobrancelha
    c.px(32,16,SKS); c.px(32,17,SKS); c.px(33,17,SKS)        # nariz
    c.rect(29,21,30,21,'#b4604f')                            # boca
    c.rect(25,19,26,20,'#ffb199')                            # bochecha
    c.px(20,15,SKS); c.px(20,16,SKS)                         # orelha
    # contorno
    c.outline(OUT)
    # holograma (por cima do contorno, translúcido)
    H='#3ee8ff'
    c.rect(38,14,46,29,'#3ee8ff3a')
    c.rect(38,14,46,14,H); c.rect(38,29,46,29,H); c.rect(38,14,38,29,H); c.rect(46,14,46,29,H)
    c.rect(40,17,44,17,GREEN); c.rect(40,19,43,19,'#ff4fd8'); c.rect(41,21,44,21,GREEN)
    c.rect(40,23,42,23,'#ffe66d'); c.rect(40,25,44,25,GREEN); c.rect(40,27,41,27,'#b66cff')
    c.line(37,30,40,28,'#3ee8ff88')
    return c

if __name__ == '__main__':
    battle_player().img(1).save('/tmp/player.png')
