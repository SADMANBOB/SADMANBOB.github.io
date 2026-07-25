# Inspector font assets

These self-hosted WOFF2 files are build assets for the inspector site. They are
derived from variable TrueType fonts in the official
[`google/fonts`](https://github.com/google/fonts) repository, then subset to the
Latin and Latin Extended ranges and limited to the weight range the stylesheet
actually declares.

| Local file | Official source | Shipped axes | Source SHA-256 | Local SHA-256 |
|---|---|---|---|---|
| `dm-sans-variable.woff2` | [`ofl/dmsans/DMSans[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf) | Optical size 9–40; weight 100–700 | `8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d` | `48b689bed33c75e1c91de0786bcd896077aa145d85e3d28fa0ebb5865d9e04cf` |
| `libre-baskerville-variable.woff2` | [`ofl/librebaskerville/LibreBaskerville[wght].ttf`](https://github.com/google/fonts/blob/main/ofl/librebaskerville/LibreBaskerville%5Bwght%5D.ttf) | Weight 400–700 | `05a95421961341c5b2556285e8415df9db27dab4f4abe22b446b3c6a8b916c5d` | `57abad96d6608ea7937817d39b57051c15e26cab784cb0197c5fa8a42dc856d1` |
| `libre-baskerville-italic-variable.woff2` | [`ofl/librebaskerville/LibreBaskerville-Italic[wght].ttf`](https://github.com/google/fonts/blob/main/ofl/librebaskerville/LibreBaskerville-Italic%5Bwght%5D.ttf) | Italic; weight 400–700 | `223959683dc73ec4437bd61fabaa4b3f22209e22855ffd3aee36ba61a5116e97` | `5dee3a4c64eb10c5b013230b797370e9a076fec64b54128eddbd152f367e37b6` |

Transfer size before and after subsetting:

| Local file | Before | After |
|---|---|---|
| `dm-sans-variable.woff2` | 89,140 | 80,852 |
| `libre-baskerville-variable.woff2` | 64,012 | 58,764 |
| `libre-baskerville-italic-variable.woff2` | 61,592 | 55,504 |

The WOFF2 files were produced with FontTools 4.63.0 and Brotli. No runtime
package or build dependency is required to serve them.

## Subsetting policy

- Character coverage is the Google Fonts `latin` plus `latin-ext` ranges, minus
  the C0 control characters. This is deliberately wider than the text currently
  published, because form inputs render whatever a visitor types and an accented
  name must not fall back to a system font mid-word.
- The weight axis is limited to the range the stylesheet declares. The inspector
  stylesheet uses weights 100, 400, 500, 600 and 700, so DM Sans ships 100–700
  rather than the source range of 100–1000.
- The optical-size axis is **retained**. Pinning it would save a further ~32 KB
  on DM Sans, but `font-optical-sizing: auto` is the CSS default and pinning
  changes how the typeface renders across sizes. That is a visible typographic
  change, so it is recorded as an owner decision rather than applied here.

Italic Libre Baskerville is retained because `h1 em` renders the italic serif on
the inspector home hero.

`dm-sans-variable.woff2` is preloaded from the inspector HTML shell because it
renders the navigation, hero lede and body copy on every route.
`libre-baskerville-variable.woff2` is also preloaded because it renders
first-viewport headings; prioritizing the normal serif face prevents the long
mobile contact heading from shifting after first paint. The italic serif face
is not preloaded because it is used only by emphasized display text.

DM Sans is licensed under the SIL Open Font License 1.1 in `OFL-DM-Sans.txt`.
Libre Baskerville is licensed under the SIL Open Font License 1.1 in
`OFL-Libre-Baskerville.txt`. Subsetting and axis limiting are expressly
permitted modifications under the OFL; the reserved font names are unchanged and
both licences ship alongside the files.

## Regenerating

Subsetting uses FontTools with the Google Fonts `latin` + `latin-ext` unicode
ranges. Load the source font with `lazy=False` and materialise `gvar` with empty
deltas for glyphs that carry no variation data, otherwise subsetting raises
`KeyError` on separator glyphs such as `CR` and `uni2028`.
