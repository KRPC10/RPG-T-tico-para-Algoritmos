#!/usr/bin/env python3
"""Gera toda a arte do Algoritmia em assets/ (precisa de: pip install pillow).
Uso:  python3 tools/make_sprites.py
Edite art_player.py / art_bosses.py / art_map.py e rode de novo para atualizar os PNGs."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixlib import Cv
from art_player import battle_player
from art_bosses import boss_vampire, boss_warden, boss_daemon, map_vampire, map_warden, map_daemon
from art_fx import slash_hero, slash_boss
from art_map import hero_sheet, tileset

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
def save(cv, rel, scale=1):
    p = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    cv.img(scale).save(p); print('ok', rel, cv.w*scale, 'x', cv.h*scale)

def two_frames(fn):
    c = Cv(32, 16); c.paste(fn(0), 0, 0); c.paste(fn(1), 16, 0); return c

# Batalha (2x para ficar nítido): herói 96x128, chefes 128x128
save(battle_player(), 'sprites/player.png', 2)
save(boss_vampire(), 'sprites/boss1.png', 2)
save(boss_warden(), 'sprites/boss2.png', 2)
save(boss_daemon(), 'sprites/boss3.png', 2)       # chefão da fase 3
# Mapa (16x16 por quadro)
save(hero_sheet(), 'sprites/hero-map.png')          # 4 colunas (quadros) x 4 linhas (baixo, esq., dir., cima)
save(two_frames(map_vampire), 'sprites/boss1-map.png')  # 2 quadros
save(two_frames(map_warden), 'sprites/boss2-map.png')
save(two_frames(map_daemon), 'sprites/boss3-map.png')
save(tileset(), 'tiles/tileset.png')                # chão A, chão B, chão circuito, parede, terminal

# Animações de corte (8 quadros 48x48, em 2x): jogador (ciano) e chefe (vermelho)
save(slash_hero(), 'sprites/slash-hero.png', 2)
save(slash_boss(), 'sprites/slash-boss.png', 2)
