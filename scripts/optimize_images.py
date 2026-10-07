#!/usr/bin/env python3
"""Convert raju-hero.jpg / raju-avatar.png in the repo root into assets/images/*.webp, og-image.png and favicon.
Usage: python3 scripts/optimize_images.py   (needs Pillow)"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
out = root / "assets" / "images"; out.mkdir(parents=True, exist_ok=True)
def webp(src, name, size):
    im = Image.open(root / src).convert("RGBA" if src.endswith(".png") else "RGB")
    im.thumbnail((size, size)); im.save(out / name, "WEBP", quality=82, method=6); print("wrote", name, im.size)
hero, av = root / "raju-hero.jpg", root / "raju-avatar.png"
if hero.exists(): webp("raju-hero.jpg", "raju-hero.webp", 960)
if av.exists():
    webp("raju-avatar.png", "raju-avatar.webp", 840)
    bg = Image.new("RGB", (1200, 630), (10, 11, 30))
    a = Image.open(av).convert("RGBA").resize((540, 540)); bg.paste(a, (330, 45), a)
    bg.save(out / "og-image.png", optimize=True); print("wrote og-image.png")
