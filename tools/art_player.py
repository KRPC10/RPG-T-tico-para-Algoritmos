from pixlib import Cv

# ==============================================================================
# PALETA DO HERÓI — jaqueta amarelo-limão de gola alta, undercut, implante ciano.
# (Inspirado no visual "edgerunner"; personagem original do Algoritmia.)
# Os nomes abaixo são usados também por art_map.py (herói do mapa) e pelos tiles.
# ==============================================================================
OUT  = '#0D0E15'                                       # contorno
SK   = '#E8A574'; SKS = '#C4825A'; SKL = '#F6C394'     # pele: base, sombra, luz
HAIR = '#1C1D2B'; HAIRL = '#3A3F66'; HAIR_HI = '#8B6CFF'; HAIRS = '#2E3150'   # cabelo (HAIRS = lateral raspada)
JK   = '#D9F24A'; JKD = '#A9BE2B'; JKL = '#F1FF8E'; JKDD = '#6F7D1B'          # jaqueta amarelo-limão
PANEL = '#CDD3E6'; PANELD = '#98A0BC'                  # painéis cinza-claro da jaqueta
PANT = '#3A3F4D'; PANTD = '#23262F'; PANTL = '#58607A' # calça cargo escura
SHOE = '#F4F6FF'; SHOED = '#B4BCD6'; SOLE = '#3EE8FF' # tênis cano alto
SHIRT = '#16171F'                                      # regata preta
BELT = '#12131A'; GOLD = '#F1FA8C'
GREEN = '#50FA7B'; CY = '#8BE9FD'                      # (tiles usam estes)
STEEL = '#6272A4'; STEELD = '#44475A'
NEON = '#3EE8FF'; NEON_L = '#C9FBFF'; PINK = '#FF4FD8'; PINK_L = '#FFC2F2'

def _a(hexc, a):  # cor com transparência
    return hexc + '%02x' % a

def battle_player():
    """Herói da batalha, 48x64, 3/4 virado para a direita (o inimigo fica à direita)."""
    c = Cv(48, 64)

    # --- rastro de velocidade do implante (atrás do corpo) ---
    for (x0, y0, x1, y1, a) in [(14,22,4,25,190),(15,28,2,32,150),(14,34,6,37,120),(16,19,9,20,110)]:
        c.line(x0, y0, x1, y1, _a(NEON, a))
    c.px(4,25,NEON_L); c.px(2,32,NEON_L); c.px(6,37,NEON_L)

    # --- perna de trás ---
    c.poly([(17,40),(23,40),(22,56),(16,56)], PANTD)
    c.rect(17,41,18,55,'#1b1d25')
    c.line(17,50,22,50,'#2c303c')                                  # dobra do joelho
    # tênis de trás
    c.poly([(14,56),(22,56),(23,59),(23,62),(13,62)], SHOED)
    c.rect(13,61,23,62,SOLE); c.rect(15,58,18,58,SHOE); c.px(20,57,NEON)

    # --- perna da frente (passo à frente) ---
    c.poly([(24,40),(32,40),(32,52),(31,56),(24,56)], PANT)
    c.rect(30,41,32,52,PANTL)                                      # luz
    c.rect(24,41,25,55,PANTD)
    c.line(25,51,31,51,'#2b2f3b')
    c.rect(26,44,30,46,'#303541'); c.rect(26,44,30,44,PANTL)       # bolso cargo
    # tênis da frente
    c.poly([(23,55),(32,55),(36,59),(37,62),(22,62)], SHOE)
    c.poly([(22,59),(36,59),(37,62),(22,62)], SHOED)
    c.rect(22,61,37,62,SOLE)
    c.rect(28,56,31,57,SHOED); c.px(29,56,NEON); c.px(31,56,NEON)  # cadarços
    c.rect(33,59,35,59,PINK); c.px(36,60,SHOE)

    # --- braço de trás (sombra) ---
    c.poly([(12,24),(18,23),(17,37),(11,36)], JKD)
    c.rect(11,24,12,36,'#8C9C22')
    c.rect(11,29,17,30,NEON)                                       # faixa refletiva
    c.rect(11,35,17,37,PANELD)                                     # punho
    c.ell(14,40.5,3,3.3,SKS)

    # --- torso: jaqueta aberta ---
    c.poly([(16,22),(32,22),(35,28),(34,41),(16,41),(14,28)], JK)
    c.poly([(14,28),(16,22),(20,22),(20,41),(16,41)], JKD)         # costas na sombra
    c.rect(14,28,15,40,'#8C9C22')
    c.poly([(30,22),(32,22),(35,28),(34,41),(31,41)], JKL)         # luz da frente
    # painéis de cor da jaqueta (cinza-claro) + faixa refletiva
    c.rect(16,36,34,41,PANEL); c.rect(16,40,34,41,PANELD)
    c.rect(16,36,34,36,PANELD); c.rect(16,37,34,37,NEON)
    c.rect(20,26,22,27,PANEL); c.rect(20,28,22,28,PANELD)          # patch no peito
    # abertura frontal (regata preta + corrente)
    c.poly([(25,23),(30,23),(30,36),(26,36)], SHIRT)
    c.line(25,23,26,36,JKD); c.line(30,23,30,36,JKL)               # bordas da abertura
    c.line(26,24,28,29,GOLD); c.line(28,29,29,24,GOLD); c.px(28,30,GOLD)  # corrente
    # linhas de dobra
    c.line(21,29,21,35,JKD); c.line(32,30,32,35,JK)
    # implante nas costas (brilho ciano pela borda da jaqueta)
    c.line(15,23,15,38,NEON)
    for y in (25,29,33,37): c.px(15,y,NEON_L)
    # cinto
    c.rect(16,39,34,40,BELT); c.rect(26,39,29,40,NEON); c.rect(27,39,28,40,NEON_L)

    # --- gola alta: parte de trás ---
    c.poly([(16,15),(22,14),(23,23),(16,23)], JKD)
    c.line(16,15,22,14,JK)
    c.rect(22,17,27,23,'#1b1d27')                                  # interior escuro da gola

    # --- pescoço ---
    c.rect(22,18,28,23,SKS); c.rect(25,18,28,21,SK)

    # --- braço da frente, dobrado, mão aberta sob o holograma ---
    c.poly([(28,23),(34,23),(36,32),(30,33)], JK)
    c.rect(33,24,35,31,JKL); c.rect(29,24,30,31,JKD)
    c.rect(29,28,35,29,NEON)                                       # faixa refletiva
    c.poly([(30,31),(37,27),(40,31),(34,37)], JK)                  # antebraço subindo
    c.poly([(36,27),(40,31),(39,33),(35,29)], JKL)
    c.rect(32,33,37,36,PANEL); c.rect(32,35,37,36,PANELD)          # punho / luva
    c.px(34,34,NEON)
    c.ell(39.5,29.5,2.6,2.6,SK); c.px(41,28,SKL); c.rect(41,30,42,31,SK)   # mão

    # --- cabeça (3/4, olhando para a direita) ---
    c.ell(24.5,11.5,7.4,8.4,SK)                                    # crânio/rosto
    c.poly([(21,15),(31,15),(30,19),(27,21.5),(23,20)], SK)        # maxilar + queixo
    c.poly([(17,10),(20,10),(23,19),(20,19),(17,15)], SKS)         # lado de trás do rosto, na sombra
    c.rect(22,19,26,20,SKS)                                        # sombra do queixo
    c.ell(28,9.8,3,2.2,SKL)                                        # luz na testa
    c.px(28,15,SKL); c.px(29,15,SKL)                               # luz na bochecha
    # orelha + brinco
    c.ell(19.2,12.4,1.7,2.4,SKS); c.px(19,12,SK); c.px(19,15,NEON); c.px(19,16,NEON_L)
    # olho (íris ciano de implante) + sobrancelha
    c.rect(27,11,29,12,'#ffffff'); c.rect(28,11,29,12,NEON); c.px(29,12,'#0b3a4a'); c.px(28,11,NEON_L)
    c.line(26,9,30,9,HAIR); c.px(30,10,HAIR); c.px(25,10,HAIR)    # sobrancelha
    c.line(27,10,29,10,SKS)                                        # pálpebra
    # nariz e boca (sorriso de canto)
    c.px(31,12,SKL); c.px(31,13,SKS); c.px(32,14,SKS); c.px(31,14,SKS)
    c.line(27,17,29,17,'#8a4a3e'); c.px(30,16,'#8a4a3e')
    c.px(25,14,'#e08c6a'); c.px(25,15,'#e08c6a')                   # bochecha corada

    # --- gola alta: parte da frente (por cima do queixo) ---
    c.poly([(28,20),(33,19),(35,25),(28,25)], JKL)
    c.poly([(28,20),(30,20),(30,25),(28,25)], JK)
    c.line(28,20,33,19,'#ffffff'); c.rect(34,20,34,25,NEON)

    # --- cabelo: undercut (lateral raspada + topo comprido jogado para a frente) ---
    c.rect(17,8,20,14,HAIRS); c.poly([(16,13),(18,10),(19,15)], HAIRS)     # lateral raspada
    c.ell(23.5,6.5,8,5,HAIR)                                       # volume do topo
    c.poly([(16,9),(22,2),(30,2),(34,6),(32,8),(28,6.5),(23,7),(20,10)], HAIR)  # franja
    c.poly([(20,4),(23,1),(27,1),(29,3),(24,3.5)], HAIR)           # tufos no alto
    c.line(21,4,27,3,HAIRL); c.line(25,5,31,4,HAIRL); c.line(31,5,33,6,HAIRL)  # brilho
    c.line(26,2,29,3,HAIR_HI); c.line(30,4,32,5,HAIR_HI)           # mechas roxas
    c.rect(20,9,23,10,HAIR)                                        # fecha o cabelo atrás da testa

    # --- contorno ---
    c.outline(OUT)

    # --- holograma de código (por cima do contorno, translúcido) ---
    c.rect(38,10,47,27,_a(NEON,52))
    for x in range(38,48): c.px(x,10,NEON); c.px(x,27,NEON)
    for y in range(10,28): c.px(38,y,NEON); c.px(47,y,NEON)
    for (x,y) in [(38,10),(47,10),(38,27),(47,27)]: c.px(x,y,NEON_L)
    c.rect(40,13,44,13,GREEN); c.rect(40,15,43,15,PINK); c.rect(41,17,45,17,GREEN)
    c.rect(40,19,42,19,GOLD); c.rect(40,21,45,21,GREEN); c.rect(40,23,41,23,HAIR_HI); c.rect(43,23,45,23,NEON_L)
    c.line(37,28,40,26,_a(NEON,150))                               # feixe saindo da mão
    c.px(40,29,NEON_L)

    return c

if __name__ == '__main__':
    battle_player().img(1).save('/tmp/player.png')
