# C&G brand and icon assets

All icon assets are derived from the single approved brand master
`cg-logo-mark.png`. No new brand artwork was created, and the logo was not
redrawn, recoloured, or restyled.

## Master

- `cg-logo-mark.png` — 300x400, the authoritative C&G Certified Home Inspector
  lockup. Retained at full size for future high-resolution work and used as the
  canonical `logo` URL in structured data.
- Re-encoded 2026-07-24 with Pillow 12.3.0 (adaptive palette, 128 colours,
  no dithering, `optimize=True`): 139,618 -> 61,062 bytes.
- The re-encode is visually lossless against the original (RMSE 0.494 across
  RGB, maximum single-channel delta 33 on antialiased edges only).
- Re-encoding also strips the XMP and EXIF blocks the original carried. Those
  blocks published a personal creator name, a Canva document id, a Canva user
  id, and an unrelated organisation name on a public production URL. Any future
  replacement master must be re-encoded the same way before it is committed.

## Derived assets

| File | Size | Purpose |
| --- | --- | --- |
| `optimized/cg-logo-mark-162.png` | 162x216, 19,237 bytes | Header and footer brand mark |
| `../apple-touch-icon.png` | 180x180, 18,403 bytes | iOS home-screen icon |
| `../favicon.ico` | 16+32+48, 6,691 bytes | Browser tab icon |

`optimized/cg-logo-mark-162.png` is a straight downscale of the master, so it
keeps the master's 3:4 aspect ratio and the existing `object-fit: cover`
circular crop renders identically. The header box is 54x54 CSS pixels and the
image covers it at 54x72, so 162x216 is exactly 3x — sharp through DPR 3
without shipping a 300x400 asset on every page.

The favicon and touch icon use the top square region of the master, which
contains the inspector figure, the house, and the `C&G` wordmark. The full
lockup includes two lines of small supporting type that are illegible below
about 64 pixels, so cropping preserves the mark's identity instead of reducing
it to an unreadable smudge.

No web manifest is published, so no 192px or 512px PWA icons are generated.

## Regenerating

```python
from PIL import Image
src = Image.open("cg-logo-mark.png").convert("RGB")
src.resize((162, 216), Image.LANCZOS).quantize(colors=128, method=Image.MEDIANCUT,
    dither=Image.NONE).save("optimized/cg-logo-mark-162.png", optimize=True)
square = src.crop((0, 0, 300, 300))
square.resize((180, 180), Image.LANCZOS).quantize(colors=128, method=Image.MEDIANCUT,
    dither=Image.NONE).save("../apple-touch-icon.png", optimize=True)
square.resize((48, 48), Image.LANCZOS).save("../favicon.ico",
    sizes=[(16, 16), (32, 32), (48, 48)])
```

`npm run verify` asserts that the root favicon and touch icon exist, that every
entry point references them, that the header mark stays under 40 KB, and that
the full-size master is never used as a favicon.
