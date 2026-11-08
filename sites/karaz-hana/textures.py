"""Generates the paper and watercolour textures of the Karaz Hana site:  python textures.py
Outputs to assets/tex/. Everything is procedural (noise), so it can be regenerated with other colours or seeds."""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'tex')
os.makedirs(OUT, exist_ok=True)


def fft_noise(h, w, scale, rng):
    """Smooth noise that tiles seamlessly (made in frequency space). scale ~ feature size in pixels."""
    white = rng.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx * fx + fy * fy)
    spectrum = np.fft.fft2(white) * np.exp(-(f * scale) ** 2)
    n = np.real(np.fft.ifft2(spectrum))
    return (n - n.min()) / (n.max() - n.min() + 1e-9)


def blur(a, r):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


# ---------- paper grain: a seamless tile, used over the cream background ----------
def paper(size=384, seed=3):
    rng = np.random.default_rng(seed)
    grain = 0.55 * fft_noise(size, size, 2.2, rng) + 0.3 * fft_noise(size, size, 14, rng) + 0.15 * fft_noise(size, size, 60, rng)
    # fibres: short faint strokes
    fib = np.zeros((size, size), np.float32)
    for _ in range(140):
        x, y = rng.integers(0, size, 2)
        ang = rng.uniform(0, np.pi)
        ln = rng.integers(6, 26)
        for t in range(ln):
            xx = int(x + np.cos(ang) * t) % size
            yy = int(y + np.sin(ang) * t) % size
            fib[yy, xx] = 1
    fib = blur(fib, 0.6)
    shade = (grain - 0.5) * 0.9 - fib * 0.22
    # dark specks and light specks as alpha over transparent, so the page colour shows through
    rgba = np.zeros((size, size, 4), np.float32)
    dark = np.clip(-shade, 0, 1)
    light = np.clip(shade, 0, 1)
    rgba[..., :3] = np.where((dark > light)[..., None], np.array([92, 52, 40]) / 255, np.array([255, 255, 250]) / 255)
    rgba[..., 3] = np.clip(np.maximum(dark * 0.22, light * 0.35), 0, 1)
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'paper.webp'), 'WEBP', quality=72, method=4)


# ---------- watercolour wash: irregular blot, pigment pooling at the edges, granulation ----------
def wash(name, rgb, w=760, h=760, seed=1, stretch=1.0, density=1.0):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w / 2, h / 2
    r = np.sqrt(((xx - cx) / (w * 0.42 * stretch)) ** 2 + ((yy - cy) / (h * 0.42)) ** 2)
    edge_noise = 0.62 * fft_noise(h, w, 80, rng) + 0.3 * fft_noise(h, w, 26, rng) + 0.08 * fft_noise(h, w, 9, rng)
    field = 1 - r + (edge_noise - 0.5) * 0.7
    mask = np.clip((field - 0.12) * 6, 0, 1)
    mask = blur(mask, 2.2)
    # pigment collects at the drying edge: a darker rim inside the blot
    inner = blur(mask, 10)
    rim = np.clip(mask - inner, 0, 1) * 2.4
    # uneven flow inside, plus granulation specks
    flow = 0.6 + 0.4 * fft_noise(h, w, 50, rng)
    gran = fft_noise(h, w, 1.6, rng)
    alpha = mask * (0.34 * flow + 0.12 * (gran - 0.5)) + rim * 0.28
    # a few blooms ("cauliflowers"): lighter rings where water pushed pigment out
    for _ in range(3):
        bx, by = rng.uniform(0.3, 0.7) * w, rng.uniform(0.3, 0.7) * h
        br = rng.uniform(0.07, 0.15) * min(w, h)
        d = np.sqrt((xx - bx) ** 2 + (yy - by) ** 2) / br + (fft_noise(h, w, 18, rng) - 0.5) * 0.5
        alpha *= np.where(d < 1, 0.55 + 0.45 * d, 1)
        alpha += np.clip(1 - np.abs(d - 1) * 6, 0, 1) * mask * 0.12
    alpha = np.clip(alpha * density, 0, 0.85)
    col = np.array(rgb, np.float32) / 255
    # deeper colour where the pigment is thick
    tone = col[None, None, :] * (1 - 0.25 * np.clip(alpha / 0.85, 0, 1))[..., None]
    rgba = np.concatenate([tone, alpha[..., None]], axis=2)
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=80, method=4)


# ---------- brush stroke: a long loaded stroke, for highlights under words ----------
def stroke(name, rgb, w=900, h=220, seed=5):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xx / w
    centre = h * (0.5 + 0.08 * np.sin(u * 3.1 + 0.6))
    half = h * (0.26 + 0.1 * np.sin(u * np.pi)) * np.clip(np.minimum(u, 1 - u) * 9, 0, 1) ** 0.5
    d = np.abs(yy - centre) / (half + 1e-3)
    n = fft_noise(h, w, 9, rng)
    mask = np.clip((1 - d + (n - 0.5) * 0.6) * 5, 0, 1)
    # dry-brush streaks along the stroke
    streak = fft_noise(h, w, 2.5, rng)
    streak = blur(np.repeat(streak.mean(axis=1, keepdims=True), w, axis=1), 0.8)
    alpha = mask * (0.55 + 0.25 * (n - 0.5) + 0.35 * (streak - 0.5))
    alpha *= np.clip(1.1 - u * 0.35, 0, 1)  # paint runs out towards the end
    alpha = np.clip(alpha, 0, 0.8)
    col = np.array(rgb, np.float32) / 255
    rgba = np.concatenate([np.broadcast_to(col, (h, w, 3)), alpha[..., None]], axis=2)
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=80, method=4)


if __name__ == '__main__':
    paper()
    wash('wash-pink', (236, 140, 160), seed=11)
    wash('wash-blush', (244, 172, 184), seed=12, stretch=1.25)
    wash('wash-sage', (126, 160, 120), seed=13, stretch=1.15)
    wash('wash-butter', (240, 190, 80), seed=14, density=0.9)
    wash('wash-coral', (226, 118, 94), seed=15, stretch=0.9)
    wash('wash-wine', (150, 60, 78), seed=16, density=0.8)
    stroke('stroke-pink', (238, 150, 170), seed=21)
    stroke('stroke-butter', (242, 196, 90), seed=22)
    stroke('stroke-sage', (140, 175, 132), seed=23)
    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
