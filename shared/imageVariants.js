import { imageProvenance } from "./siteData.js";

export const responsiveImageWidths = Object.freeze([640, 960, 1440]);

const intrinsicDimensions = {
  "inspector-hero": [1731, 909],
  "inspector-report": [1536, 1024],
  "inspector-attic": [1536, 1024],
  "cross-service-planning": [1536, 1024],
  "contractor-hero": [1536, 1024],
  "contractor-finish-work": [1448, 1086],
  "contractor-project-planning": [1536, 1024],
  "illustrative-drywall-repair": [1536, 1024],
  "illustrative-exterior-trim": [1536, 1024],
  "illustrative-finish-carpentry": [1536, 1024],
};

const approvedEditorialRecords = imageProvenance.filter(
  (record) =>
    record.status === "approved"
    && record.type === "generated_editorial"
    && record.depictsActualClientWork === false,
);

const variantRecord = (record) => {
  const fileName = record.file.split("/").at(-1);
  const stem = fileName.replace(/\.jpg$/i, "");
  const [width, height] = intrinsicDimensions[record.id] || [];
  if (!width || !height) throw new Error(`Missing intrinsic dimensions for editorial image ${record.id}`);

  const variants = Object.fromEntries(["avif", "webp"].map((format) => [
    format,
    Object.freeze(responsiveImageWidths.map((variantWidth) => Object.freeze({
      path: `assets/optimized/${stem}-${variantWidth}.${format}`,
      width: variantWidth,
      height: Math.round(height * variantWidth / width),
    }))),
  ]));

  return Object.freeze({
    id: record.id,
    surface: record.file.startsWith("contractor-site-prototype/") ? "contractor" : "inspector",
    classification: record.type,
    depictsActualClientWork: false,
    disclosure: "Representative editorial imagery; not C&G client or completed-project photography.",
    approvedFor: Object.freeze([...record.approvedFor]),
    alt: record.alt,
    fallback: Object.freeze({
      path: `assets/${fileName}`,
      width,
      height,
      type: "image/jpeg",
    }),
    variants: Object.freeze(variants),
  });
};

export const responsiveEditorialImages = Object.freeze(Object.fromEntries(
  approvedEditorialRecords.map((record) => [record.id, variantRecord(record)]),
));

const withBase = (basePath, assetPath) => {
  const normalizedBase = `${basePath || "/"}`.endsWith("/") ? `${basePath || "/"}` : `${basePath}/`;
  return `${normalizedBase}${assetPath.replace(/^\/+/, "")}`;
};

const srcSetFor = (variants, basePath) =>
  variants.map((variant) => `${withBase(basePath, variant.path)} ${variant.width}w`).join(", ");

export function responsivePictureSources(id, { basePath = "/", sizes = "100vw" } = {}) {
  const image = responsiveEditorialImages[id];
  if (!image) throw new Error(`Unknown approved editorial image: ${id}`);
  return [
    { type: "image/avif", srcSet: srcSetFor(image.variants.avif, basePath), sizes },
    { type: "image/webp", srcSet: srcSetFor(image.variants.webp, basePath), sizes },
  ];
}

export function responsiveImageProps(id, { basePath = "/", sizes = "100vw" } = {}) {
  const image = responsiveEditorialImages[id];
  if (!image) throw new Error(`Unknown approved editorial image: ${id}`);
  return {
    src: withBase(basePath, image.fallback.path),
    srcSet: srcSetFor(image.variants.webp, basePath),
    sizes,
    alt: image.alt,
    width: image.fallback.width,
    height: image.fallback.height,
    decoding: "async",
  };
}
