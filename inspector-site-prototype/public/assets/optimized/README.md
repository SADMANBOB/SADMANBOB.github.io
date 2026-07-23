# Responsive editorial image variants

These AVIF and WebP files are responsive derivatives of the approved JPEG
fallbacks in the parent `assets` directory. Their authority and allowed
surfaces remain the corresponding records in `shared/siteData.js`.

- Classification: generated editorial imagery
- Actual C&G client or project work: no
- Widths: 640, 960, and 1440 pixels
- AVIF conversion: macOS ImageIO through `sips`, quality 72
- WebP conversion: Pillow 12.3.0, quality 82, method 6
- Original fallback: the adjacent `.jpg` file remains unchanged

Use `shared/imageVariants.js` to keep the AVIF, WebP, JPEG fallback, alt text,
intrinsic dimensions, and editorial disclosure connected.
