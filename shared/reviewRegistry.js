import { claimIsApproved, claims } from "./siteData.js";

export const REVIEW_SURFACES = Object.freeze(["inspector-home"]);

const REVIEW_SLOT_COUNT = 50;
const EMPTY_SURFACES = Object.freeze([]);
const APPROVED_REVIEW_KEYS = new Set([
  "id",
  "status",
  "sourceUrl",
  "exactApprovedText",
  "publicationPermissionAt",
  "allowedSurfaces",
  "displayAttribution",
]);
const REVIEW_ID_PATTERN = /^review-slot-(0[1-9]|[1-4]\d|50)$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const UNSAFE_ATTRIBUTION_PATTERN = /(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\b\d{7,}\b|[<>]|\r|\n)/i;

export const reviewSlots = Object.freeze(
  Array.from({ length: REVIEW_SLOT_COUNT }, (_, index) => Object.freeze({
    id: `review-slot-${String(index + 1).padStart(2, "0")}`,
    status: "pending",
    sourceUrl: null,
    exactApprovedText: null,
    publicationPermissionAt: null,
    allowedSurfaces: EMPTY_SURFACES,
    displayAttribution: null,
  })),
);

const isValidReviewSource = (value) => {
  if (typeof value !== "string" || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && Boolean(url.hostname)
      && !url.username
      && !url.password;
  } catch {
    return false;
  }
};

const isValidPermissionTimestamp = (value, onDate) => {
  if (typeof value !== "string" || !ISO_TIMESTAMP_PATTERN.test(value)) return false;
  const permissionDate = new Date(value);
  return Number.isFinite(permissionDate.getTime())
    && permissionDate.getTime() <= onDate.getTime();
};

export const isSafeDisplayAttribution = (value) =>
  typeof value === "string"
  && value === value.trim()
  && value.length >= 2
  && value.length <= 96
  && !UNSAFE_ATTRIBUTION_PATTERN.test(value);

const hasOnlyApprovedFields = (review) => {
  const keys = Object.keys(review);
  return keys.length === APPROVED_REVIEW_KEYS.size
    && keys.every((key) => APPROVED_REVIEW_KEYS.has(key));
};

const hasValidSurfaces = (surfaces, requestedSurface) =>
  Array.isArray(surfaces)
  && surfaces.length > 0
  && new Set(surfaces).size === surfaces.length
  && surfaces.every((surface) => REVIEW_SURFACES.includes(surface))
  && surfaces.includes(requestedSurface);

export function reviewEntryIsApproved(review, surface, onDate = new Date()) {
  if (!review || typeof review !== "object" || Array.isArray(review)) return false;
  const prototype = Object.getPrototypeOf(review);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (!REVIEW_SURFACES.includes(surface)) return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (!hasOnlyApprovedFields(review) || !REVIEW_ID_PATTERN.test(review.id)) return false;
  if (review.status !== "approved") return false;
  if (!isValidReviewSource(review.sourceUrl)) return false;
  if (
    typeof review.exactApprovedText !== "string"
    || review.exactApprovedText !== review.exactApprovedText.trim()
    || review.exactApprovedText.length < 1
    || review.exactApprovedText.length > 1_200
    || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(review.exactApprovedText)
  ) return false;
  if (!isValidPermissionTimestamp(review.publicationPermissionAt, onDate)) return false;
  if (!hasValidSurfaces(review.allowedSurfaces, surface)) return false;
  return isSafeDisplayAttribution(review.displayAttribution);
}

export function getApprovedReviews(surface, onDate = new Date()) {
  if (!REVIEW_SURFACES.includes(surface)) return Object.freeze([]);
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return Object.freeze([]);
  if (!claimIsApproved(claims.customerTestimonials, onDate)) return Object.freeze([]);
  return Object.freeze(reviewSlots.filter((review) => reviewEntryIsApproved(review, surface, onDate)));
}
