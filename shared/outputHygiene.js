// macOS writes .DS_Store and AppleDouble (._*) sidecars into any directory the Finder
// browses, including public/ and dist/. They carry local filesystem state, are never
// part of the website, and must not reach the deployed artifact. The assembly script
// filters them out and the verification suite asserts that none survived.

const LOCAL_FILESYSTEM_ARTIFACTS = Object.freeze([
  ".DS_Store",
  ".AppleDouble",
  ".LSOverride",
  ".Spotlight-V100",
  ".Trashes",
  ".fseventsd",
  ".TemporaryItems",
  ".DocumentRevisions-V100",
]);

export function isLocalFilesystemArtifact(pathOrName) {
  const name = String(pathOrName).split("/").at(-1) || "";
  return LOCAL_FILESYSTEM_ARTIFACTS.includes(name) || name.startsWith("._");
}
