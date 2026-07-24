# Contractor font assets

These self-hosted WOFF2 files are build assets for the contractor site. They are
derived from variable TrueType fonts in the official
[`google/fonts`](https://github.com/google/fonts) repository, then subset to the
Latin and Latin Extended ranges and limited to the weight range the stylesheet
actually declares.

| Local file | Official source | Shipped axes | Source SHA-256 | Local SHA-256 |
|---|---|---|---|---|
| `dm-sans-variable.woff2` | [`ofl/dmsans/DMSans[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf) | Optical size 9–40; weight 100–700 | `8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d` | `ae258b83abb2a2203e509fa3663e554f31944c0f38cb542fe01fd7379f761dbe` |
| `newsreader-variable.woff2` | [`ofl/newsreader/Newsreader[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf) | Optical size 6–72; weight 200–700 | `8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1` | `c0b5f8b315cd261c3070dda91db818a3d472e8a9d4d145b9dd2c712d224a5e37` |

Transfer size before and after subsetting:

| Local file | Before | After |
|---|---|---|
| `dm-sans-variable.woff2` | 89,140 | 80,960 |
| `newsreader-variable.woff2` | 214,824 | 191,244 |

The WOFF2 files were produced with FontTools 4.63.0 and Brotli. No runtime
package or build dependency is required to serve them.

## Subsetting policy

- Character coverage is the Google Fonts `latin` plus `latin-ext` ranges, minus
  the C0 control characters. This is deliberately wider than the text currently
  published, because the estimate form renders whatever a visitor types and an
  accented name must not fall back to a system font mid-word.
- The weight axis is limited to the range the stylesheet declares. The contractor
  stylesheets use weights 100, 200, 400, 500 and 700, so DM Sans ships 100–700
  and Newsreader ships 200–700 rather than their source ranges.
- The optical-size axis is **retained** on both faces. Pinning Newsreader's
  `opsz` would cut it from 191,244 to roughly 85,000 bytes, by far the largest
  single saving available on this site. It is not applied because Newsreader is
  the display serif used from 16 px body emphasis up to 60 px headings, and
  pinning one optical size across that range is a visible typographic change.
  It is recorded as an owner decision rather than applied here.

No italic file is shipped. The contractor stylesheets declare no
`font-style: italic` rule, so no italic face is downloaded.

`newsreader-variable.woff2` is preloaded from the contractor HTML shell because
the measured mobile Largest Contentful Paint element on `/contracting/` is the
serif hero heading. DM Sans is not preloaded.

DM Sans is licensed under the SIL Open Font License 1.1 in `OFL-DM-Sans.txt`.
Newsreader is licensed under the SIL Open Font License 1.1 in
`OFL-Newsreader.txt`. Subsetting and axis limiting are expressly permitted
modifications under the OFL; the reserved font names are unchanged and both
licences ship alongside the files.
