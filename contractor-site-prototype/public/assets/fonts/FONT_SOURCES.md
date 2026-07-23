# Contractor font assets

These self-hosted WOFF2 files are build assets for the contractor site. They
are derived without subsetting from variable TrueType fonts in the official
[`google/fonts`](https://github.com/google/fonts) repository.

| Local file | Official source | Axes | Source SHA-256 | Local SHA-256 |
|---|---|---|---|---|
| `dm-sans-variable.woff2` | [`ofl/dmsans/DMSans[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf) | Optical size 9–40; weight 100–1000 | `8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d` | `925f962fd78d8e93737b0060cc920ffbe32116c3b33a99e52893391ea2da24b0` |
| `newsreader-variable.woff2` | [`ofl/newsreader/Newsreader[opsz,wght].ttf`](https://github.com/google/fonts/blob/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf) | Optical size 6–72; weight 200–800 | `8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1` | `3cba66930f958ccd4640b522bb529e5d0b93f4b26caf158da20f88f0f91de79e` |

The WOFF2 files were converted with FontTools 4.63.0 and Brotli 1.2.0. No
runtime package or build dependency is required to serve them.

DM Sans is licensed under the SIL Open Font License 1.1 in
`OFL-DM-Sans.txt`. Newsreader is licensed under the SIL Open Font License 1.1
in `OFL-Newsreader.txt`.
