import {
  approvedServiceAreas,
  contractorRequestCategoryIds,
  imageProvenance,
} from "./siteData.js";

export const PUBLICATION_SURFACES = Object.freeze({
  sampleReport: "inspector-sample-report",
  contractorCaseStudy: "contractor-case-study",
  contractorHomePhoto: "contractor-home-photo",
  contractorAboutPhoto: "contractor-about-photo",
  contractorProjectsPhoto: "contractor-projects-photo",
  inspectorAreaPage: "inspector-area-page",
  contractorAreaPage: "contractor-area-page",
});

const EMPTY_LIST = Object.freeze([]);
const CLIENT_PROJECT_PHOTO_SURFACES = Object.freeze([
  PUBLICATION_SURFACES.contractorCaseStudy,
  PUBLICATION_SURFACES.contractorHomePhoto,
  PUBLICATION_SURFACES.contractorAboutPhoto,
  PUBLICATION_SURFACES.contractorProjectsPhoto,
]);
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EVIDENCE_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]{4,119}$/i;
const SAFE_TEXT_PATTERN = /^[^<>\u0000-\u0008\u000B\u000C\u000E-\u001F]+$/;

const isRecord = (value) =>
  Boolean(value)
  && typeof value === "object"
  && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));

const isSafeText = (value, { min = 1, max = 2_000 } = {}) =>
  typeof value === "string"
  && value === value.trim()
  && value.length >= min
  && value.length <= max
  && SAFE_TEXT_PATTERN.test(value);

const isHttpsUrl = (value) => {
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

const isApprovalTimestamp = (value, onDate) => {
  if (typeof value !== "string" || !ISO_TIMESTAMP_PATTERN.test(value)) return false;
  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) && timestamp <= onDate;
};

const hasSurface = (record, surface) =>
  Array.isArray(record.allowedSurfaces)
  && record.allowedSurfaces.length > 0
  && new Set(record.allowedSurfaces).size === record.allowedSurfaces.length
  && record.allowedSurfaces.includes(surface);

const isInternalAssetPath = (value, directory, extensionPattern) =>
  typeof value === "string"
  && value.startsWith(directory)
  && !value.includes("..")
  && !/[?#]/.test(value)
  && extensionPattern.test(value);

export const sampleReportRegistry = Object.freeze([
  Object.freeze({
    id: "sample-report-primary",
    status: "pending",
    title: null,
    publicPath: null,
    sha256: null,
    fileBytes: null,
    pageCount: null,
    reportTemplateVersion: null,
    redactionApprovedAt: null,
    publicationPermissionAt: null,
    privacyReviewConfirmed: false,
    allowedSurfaces: EMPTY_LIST,
  }),
]);

export function sampleReportIsApproved(record, surface = PUBLICATION_SURFACES.sampleReport, onDate = new Date()) {
  if (!isRecord(record) || record.status !== "approved") return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (surface !== PUBLICATION_SURFACES.sampleReport || !hasSurface(record, surface)) return false;
  return record.id === "sample-report-primary"
    && isSafeText(record.title, { min: 8, max: 120 })
    && isInternalAssetPath(record.publicPath, "/assets/sample-reports/", /\.pdf$/i)
    && SHA256_PATTERN.test(record.sha256)
    && Number.isInteger(record.fileBytes)
    && record.fileBytes > 0
    && record.fileBytes <= 8 * 1024 * 1024
    && Number.isInteger(record.pageCount)
    && record.pageCount > 0
    && record.pageCount <= 250
    && isSafeText(record.reportTemplateVersion, { min: 1, max: 80 })
    && isApprovalTimestamp(record.redactionApprovedAt, onDate)
    && isApprovalTimestamp(record.publicationPermissionAt, onDate)
    && record.privacyReviewConfirmed === true;
}

export function getApprovedSampleReports(surface = PUBLICATION_SURFACES.sampleReport, onDate = new Date()) {
  return Object.freeze(sampleReportRegistry.filter((record) => sampleReportIsApproved(record, surface, onDate)));
}

export const clientProjectPhotoSlots = Object.freeze(
  Array.from({ length: 24 }, (_, index) => Object.freeze({
    id: `project-photo-${String(index + 1).padStart(2, "0")}`,
    status: "pending",
    publicPath: null,
    sha256: null,
    width: null,
    height: null,
    alt: null,
    caption: null,
    depictsActualClientWork: false,
    replacesEditorialImageId: null,
    sourceEvidenceId: null,
    rightsEvidenceId: null,
    rightsConfirmedAt: null,
    privacyApprovedAt: null,
    allowedSurfaces: EMPTY_LIST,
  })),
);

export function clientProjectPhotoIsApproved(
  record,
  surface = PUBLICATION_SURFACES.contractorCaseStudy,
  onDate = new Date(),
) {
  if (!isRecord(record) || record.status !== "approved") return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (!CLIENT_PROJECT_PHOTO_SURFACES.includes(surface) || !hasSurface(record, surface)) return false;
  return /^project-photo-(0[1-9]|1\d|2[0-4])$/.test(record.id)
    && isInternalAssetPath(record.publicPath, "/contracting/assets/projects/", /\.(?:avif|webp|jpe?g)$/i)
    && SHA256_PATTERN.test(record.sha256)
    && Number.isInteger(record.width)
    && record.width >= 640
    && record.width <= 12_000
    && Number.isInteger(record.height)
    && record.height >= 360
    && record.height <= 12_000
    && isSafeText(record.alt, { min: 8, max: 180 })
    && isSafeText(record.caption, { min: 8, max: 240 })
    && record.depictsActualClientWork === true
    && typeof record.sourceEvidenceId === "string"
    && EVIDENCE_ID_PATTERN.test(record.sourceEvidenceId)
    && typeof record.rightsEvidenceId === "string"
    && EVIDENCE_ID_PATTERN.test(record.rightsEvidenceId)
    && (
      record.replacesEditorialImageId === null
      || (
        typeof record.replacesEditorialImageId === "string"
        && imageProvenance.some((image) => image.id === record.replacesEditorialImageId)
      )
    )
    && isApprovalTimestamp(record.rightsConfirmedAt, onDate)
    && isApprovalTimestamp(record.privacyApprovedAt, onDate);
}

export const projectCaseStudySlots = Object.freeze(
  Array.from({ length: 12 }, (_, index) => Object.freeze({
    id: `project-case-${String(index + 1).padStart(2, "0")}`,
    status: "pending",
    slug: null,
    title: null,
    summary: null,
    startingCondition: null,
    scopeItems: EMPTY_LIST,
    constraints: EMPTY_LIST,
    approach: EMPTY_LIST,
    documentedResult: null,
    categoryId: null,
    imageIds: EMPTY_LIST,
    sourceEvidenceId: null,
    sourceConfirmedAt: null,
    publicationPermissionAt: null,
    privacyApprovedAt: null,
    allowedSurfaces: EMPTY_LIST,
  })),
);

const isSafeTextList = (items, { minItems = 1, maxItems = 12, maxLength = 300 } = {}) =>
  Array.isArray(items)
  && items.length >= minItems
  && items.length <= maxItems
  && new Set(items).size === items.length
  && items.every((item) => isSafeText(item, { min: 3, max: maxLength }));

export function projectCaseStudyIsApproved(
  record,
  surface = PUBLICATION_SURFACES.contractorCaseStudy,
  onDate = new Date(),
  photoRecords = clientProjectPhotoSlots,
) {
  if (!isRecord(record) || record.status !== "approved") return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (surface !== PUBLICATION_SURFACES.contractorCaseStudy || !hasSurface(record, surface)) return false;
  const approvedPhotoIds = new Set(
    photoRecords
      .filter((photo) => clientProjectPhotoIsApproved(photo, surface, onDate))
      .map((photo) => photo.id),
  );
  return /^project-case-(0[1-9]|1[0-2])$/.test(record.id)
    && typeof record.slug === "string"
    && SLUG_PATTERN.test(record.slug)
    && isSafeText(record.title, { min: 8, max: 120 })
    && isSafeText(record.summary, { min: 40, max: 220 })
    && isSafeText(record.startingCondition, { min: 30, max: 500 })
    && isSafeTextList(record.scopeItems)
    && isSafeTextList(record.constraints)
    && isSafeTextList(record.approach)
    && isSafeText(record.documentedResult, { min: 30, max: 500 })
    && contractorRequestCategoryIds.includes(record.categoryId)
    && Array.isArray(record.imageIds)
    && record.imageIds.length > 0
    && record.imageIds.length <= 12
    && new Set(record.imageIds).size === record.imageIds.length
    && record.imageIds.every((id) => approvedPhotoIds.has(id))
    && typeof record.sourceEvidenceId === "string"
    && EVIDENCE_ID_PATTERN.test(record.sourceEvidenceId)
    && isApprovalTimestamp(record.sourceConfirmedAt, onDate)
    && isApprovalTimestamp(record.publicationPermissionAt, onDate)
    && isApprovalTimestamp(record.privacyApprovedAt, onDate);
}

export function getApprovedProjectCaseStudies(
  surface = PUBLICATION_SURFACES.contractorCaseStudy,
  onDate = new Date(),
) {
  const approved = projectCaseStudySlots.filter((record) => projectCaseStudyIsApproved(record, surface, onDate));
  if (new Set(approved.map((record) => record.slug)).size !== approved.length) return Object.freeze([]);
  return Object.freeze(approved);
}

export function getApprovedProjectPhotos(
  surface = PUBLICATION_SURFACES.contractorCaseStudy,
  onDate = new Date(),
) {
  return Object.freeze(clientProjectPhotoSlots.filter((record) => clientProjectPhotoIsApproved(record, surface, onDate)));
}

export function getAllApprovedClientProjectPhotos(onDate = new Date()) {
  return Object.freeze(
    clientProjectPhotoSlots.filter((record) =>
      CLIENT_PROJECT_PHOTO_SURFACES.some((surface) =>
        clientProjectPhotoIsApproved(record, surface, onDate))),
  );
}

export function approvedClientPhotoReplacement(editorialImageId, surface, onDate = new Date()) {
  return getApprovedProjectPhotos(surface, onDate)
    .find((record) => record.replacesEditorialImageId === editorialImageId)
    || null;
}

const serviceAreaSurfaceConfig = Object.freeze({
  Inspector: {
    pageSurface: PUBLICATION_SURFACES.inspectorAreaPage,
    approvalKey: "approvedForInspector",
    contentKey: "inspectorPage",
  },
  Contractor: {
    pageSurface: PUBLICATION_SURFACES.contractorAreaPage,
    approvalKey: "approvedForContractor",
    contentKey: "contractorPage",
  },
});

export function serviceAreaPageIsApproved(area, surface, onDate = new Date()) {
  const config = serviceAreaSurfaceConfig[surface];
  if (!config || !isRecord(area)) return false;
  const page = area[config.contentKey];
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  return area.status === "approved"
    && area[config.approvalKey] === true
    && area.approvedForMetadata === true
    && area.uniquePageEnabled === true
    && isApprovalTimestamp(area.ownerConfirmedAt, onDate)
    && typeof area.id === "string"
    && SLUG_PATTERN.test(area.id)
    && isSafeText(area.label, { min: 2, max: 100 })
    && isRecord(page)
    && isSafeText(page.pageTitle, { min: 20, max: 120 })
    && isSafeText(page.metaDescription, { min: 50, max: 180 })
    && isRecord(page.pageContent)
    && isSafeText(page.pageContent.introduction, { min: 80, max: 1_000 })
    && isSafeText(page.pageContent.propertyContext, { min: 80, max: 1_000 })
    && isSafeText(page.pageContent.accessAndTiming, { min: 80, max: 1_000 })
    && isSafeTextList(page.pageContent.planningChecklist, { minItems: 3, maxItems: 10, maxLength: 220 });
}

export function getApprovedServiceAreaPages(surface, onDate = new Date()) {
  const config = serviceAreaSurfaceConfig[surface];
  if (!config) return Object.freeze([]);
  return Object.freeze(
    approvedServiceAreas(surface)
      .filter((area) => serviceAreaPageIsApproved(area, surface, onDate))
      .map((area) => Object.freeze({
        ...area,
        ...area[config.contentKey],
      })),
  );
}

export function editorialImageFor(id, surface) {
  const record = imageProvenance.find((item) => item.id === id);
  if (
    !record
    || record.status !== "approved"
    || record.depictsActualClientWork !== false
    || !record.approvedFor.includes(surface)
  ) return null;
  return record;
}
