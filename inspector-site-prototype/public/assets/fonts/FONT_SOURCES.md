# Inspector font assets

These self-hosted WOFF2 files are build assets for the inspector site. They are
derived without subsetting from variable TrueType fonts in the official
[`google/fonts`](https://github.com/google/fonts) repository.

| Local file | Official source | Axes | Source SHA-256 | Local SHA-256 |
|---|---|---|---|---|
| `dm-sans-variable.woff2` | [`ofl/dmsans/DMSans[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf) | Optical size 9–40; weight 100–1000 | `8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d` | `925f962fd78d8e93737b0060cc920ffbe32116c3b33a99e52893391ea2da24b0` |
| `libre-baskerville-variable.woff2` | [`ofl/librebaskerville/LibreBaskerville[wght].ttf`](https://github.com/google/fonts/blob/main/ofl/librebaskerville/LibreBaskerville%5Bwght%5D.ttf) | Weight 400–700 | `05a95421961341c5b2556285e8415df9db27dab4f4abe22b446b3c6a8b916c5d` | `b52fd23d6bbcc8b516f34c3eae6ffd2e120131d7dec95fefb6796e2c19324709` |
| `libre-baskerville-italic-variable.woff2` | [`ofl/librebaskerville/LibreBaskerville-Italic[wght].ttf`](https://github.com/google/fonts/blob/main/ofl/librebaskerville/LibreBaskerville-Italic%5Bwght%5D.ttf) | Italic; weight 400–700 | `223959683dc73ec4437bd61fabaa4b3f22209e22855ffd3aee36ba61a5116e97` | `8e8dc0ce16a916ff2e23aced3e88a4749e6c7cc172726596b94ab35983a52e57` |

The WOFF2 files were converted with FontTools 4.63.0 and Brotli 1.2.0. No
runtime package or build dependency is required to serve them.

DM Sans is licensed under the SIL Open Font License 1.1 in
`OFL-DM-Sans.txt`. Libre Baskerville is licensed under the SIL Open Font
License 1.1 in `OFL-Libre-Baskerville.txt`.
