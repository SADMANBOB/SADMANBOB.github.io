import { claimIsApproved, claims } from "./siteData.js";
import { CONTENT_STATE, OWNER_REVIEW_STAGING_VISIBLE } from "./ownerReview.js";

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
const LEGACY_REVIEW_KEYS = new Set([
  "id",
  "status",
  "sourceUrl",
  "exactApprovedText",
  "publicationPermissionAt",
  "allowedSurfaces",
  "displayAttribution",
  "legacyText",
  "initials",
  "role",
  "location",
  "rating",
  "ownerReviewSurfaces",
  "sourceLabel",
]);
const REVIEW_ID_PATTERN = /^review-slot-(0[1-9]|[1-4]\d|50)$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const UNSAFE_ATTRIBUTION_PATTERN = /(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\b\d{7,}\b|[<>]|\r|\n)/i;

const legacyImport = Object.freeze([
  ["Clarence was extremely thorough and explained everything clearly. The same-day report helped us close confidently.", "M.R.", "Homebuyer", "Compton, California", 5],
  ["As an agent, I value inspectors who communicate well. C&G is my go-to in Riverside County.", "J.T.", "Realtor", "Riverside County", 5],
  ["His construction experience really shows. Caught issues other inspectors missed.", "D.G.", "Buyers", "Los Angeles, California", 5],
  ["Very detailed, honest, and professional. Arrived early and delivered fast.", "L.V.", "Investor", "Long Beach, California", 5],
  ["Great communication and very friendly. Made the whole process easy.", "N.R.", "Buyer", "Hawthorne, California", 5],
  ["Very professional and knowledgeable. Would have liked a bit more detail on one item, but overall excellent.", "R.A.", "Investor", "Inglewood, California", 4],
  ["Quick turnaround and a solid report. Would definitely use again.", "K.D.", "Homeowner", "Bellflower, California", 4],
  ["Clarence is dependable and consistent. My clients always appreciate his work.", "J.P.", "Realtor", "Norwalk, California", 5],
  ["He explained what was urgent, what could wait, and helped us budget our repairs.", "M.C.", "First-Time Buyer", "Paramount, California", 5],
  ["Solid inspection. A bit more photos would’ve helped, but still very good overall.", "T.H.", "Buyer", "Riverside County", 3],
  ["Friendly, honest, and extremely thorough. Highly recommend.", "E.F.", "Buyer", "Lynwood, California", 5],
  ["Great service and fast scheduling. Everything was smooth.", "B.P.", "Homeowner", "Downey, California", 4],
  ["Very detailed report. Worth every penny.", "S.K.", "Agent", "Compton, California", 5],
  ["Good inspection overall. A little shorter than expected, but still clear and helpful.", "W.L.", "Homeowner", "Carson, California", 3],
  ["Fast, professional, and very clear. You can tell he cares about his work.", "J.S.", "Buyer", "Los Angeles, California", 5],
  ["Straightforward, honest, and reliable. Highly recommend.", "D.M.", "Homeowner", "Compton, California", 5],
  ["Report was easy to read and well organized.", "S.T.", "Buyer", "Ontario, California", 4],
  ["Very thorough! Helped us avoid a bad purchase.", "C.F.", "Buyer", "Gardena, California", 5],
  ["Professional, respectful, and extremely detail-oriented.", "R.B.", "Homeowner", "Torrance, California", 5],
  ["Great experience. Would recommend to anyone buying an older home.", "L.H.", "Buyer", "Bell Gardens, California", 4],
]);

const emptyPendingSlot = (index) => Object.freeze({
  id: `review-slot-${String(index + 1).padStart(2, "0")}`,
  status: "pending",
  sourceUrl: null,
  exactApprovedText: null,
  publicationPermissionAt: null,
  allowedSurfaces: EMPTY_SURFACES,
  displayAttribution: null,
});

const legacySlot = (index, [legacyText, initials, role, location, rating]) => Object.freeze({
  id: `review-slot-${String(index + 1).padStart(2, "0")}`,
  status: CONTENT_STATE.legacyPendingOwnerConfirmation,
  sourceUrl: null,
  exactApprovedText: null,
  publicationPermissionAt: null,
  allowedSurfaces: EMPTY_SURFACES,
  displayAttribution: null,
  legacyText,
  initials,
  role,
  location,
  rating,
  ownerReviewSurfaces: Object.freeze(["inspector-home"]),
  sourceLabel: "Legacy feedback pending owner confirmation",
});

export const reviewSlots = Object.freeze([
  ...legacyImport.map((entry, index) => legacySlot(index, entry)),
  ...Array.from({ length: REVIEW_SLOT_COUNT - legacyImport.length }, (_, index) =>
    emptyPendingSlot(index + legacyImport.length)),
]);

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

export function reviewEntryIsLegacyOwnerReview(review, surface) {
  if (!review || typeof review !== "object" || Array.isArray(review)) return false;
  if (review.status !== CONTENT_STATE.legacyPendingOwnerConfirmation) return false;
  if (!REVIEW_SURFACES.includes(surface)) return false;
  if (!Array.isArray(review.ownerReviewSurfaces) || !review.ownerReviewSurfaces.includes(surface)) return false;
  if (typeof review.legacyText !== "string" || !review.legacyText.trim()) return false;
  if (typeof review.initials !== "string" || !review.initials.trim()) return false;
  if (typeof review.role !== "string" || !review.role.trim()) return false;
  if (typeof review.location !== "string" || !review.location.trim()) return false;
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) return false;
  return Object.keys(review).every((key) => LEGACY_REVIEW_KEYS.has(key));
}

export function getApprovedReviews(surface, onDate = new Date()) {
  if (!REVIEW_SURFACES.includes(surface)) return Object.freeze([]);
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return Object.freeze([]);
  if (!claimIsApproved(claims.customerTestimonials, onDate)) return Object.freeze([]);
  return Object.freeze(reviewSlots.filter((review) => reviewEntryIsApproved(review, surface, onDate)));
}

export function getLegacyOwnerReviewReviews(surface) {
  if (!OWNER_REVIEW_STAGING_VISIBLE) return Object.freeze([]);
  if (!REVIEW_SURFACES.includes(surface)) return Object.freeze([]);
  return Object.freeze(
    reviewSlots
      .filter((review) => reviewEntryIsLegacyOwnerReview(review, surface))
      .map((review) => Object.freeze({
        id: review.id,
        text: review.legacyText,
        initials: review.initials,
        role: review.role,
        location: review.location,
        rating: review.rating,
        attribution: `${review.initials} · ${review.role} · ${review.location}`,
        sourceLabel: review.sourceLabel,
        status: review.status,
      })),
  );
}

export function getRenderableReviews(surface, onDate = new Date()) {
  const approved = getApprovedReviews(surface, onDate);
  if (approved.length) {
    return Object.freeze({
      mode: "approved",
      label: "Published with permission",
      intro: "Each published review uses only source-backed text and attribution approved for this page.",
      reviews: approved.map((review) => Object.freeze({
        id: review.id,
        text: review.exactApprovedText,
        attribution: review.displayAttribution,
        sourceUrl: review.sourceUrl,
        rating: null,
        status: "approved",
      })),
    });
  }

  const legacy = getLegacyOwnerReviewReviews(surface);
  if (legacy.length) {
    return Object.freeze({
      mode: CONTENT_STATE.legacyPendingOwnerConfirmation,
      label: "Legacy testimonials pending owner confirmation",
      intro: "Client feedback imported from the previous website for owner review. These entries are not independently re-verified and are not marked as production-approved.",
      reviews: legacy,
    });
  }

  return Object.freeze({ mode: "none", label: "", intro: "", reviews: Object.freeze([]) });
}

export function legacyReviewAggregate(reviews = getLegacyOwnerReviewReviews("inspector-home")) {
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = Math.round((total / reviews.length) * 10) / 10;
  return Object.freeze({
    count: reviews.length,
    average,
    label: "Average of legacy testimonials currently under owner review.",
  });
}
