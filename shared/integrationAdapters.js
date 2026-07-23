import {
  integrationCanRender,
  integrations,
} from "./siteData.js";

const FORM_TRANSPORTS = Object.freeze({
  "inspector-contact": Object.freeze([
    "secureInspectionFormTransport",
    "inspectionFormTransport",
  ]),
  "contractor-estimate": Object.freeze([
    "secureContractorFormTransport",
    "contractorFormTransport",
  ]),
});

export const FILE_SHARE_AUTHORIZATION_VERSION = "2026-07-22";

const isHttpsUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};

export function formTransportFor(surface) {
  const ids = FORM_TRANSPORTS[surface] || [];
  for (const id of ids) {
    const integration = integrations[id];
    if (integrationCanRender(integration) && integration.allowedSurfaces.includes(surface)) {
      return Object.freeze({ id, ...integration });
    }
  }
  return null;
}

export function bookingActionFor(surface, fallback) {
  const integration = integrations.booking;
  if (
    integrationCanRender(integration)
    && integration.allowedSurfaces.includes(surface)
  ) {
    return Object.freeze({
      external: true,
      href: integration.publicConfig.bookingUrl,
      label: integration.publicConfig.actionLabel || "Book online",
      provider: integration.provider,
      privacyUrl: integration.publicConfig.privacyUrl,
    });
  }
  return Object.freeze({
    external: false,
    href: fallback.href,
    label: fallback.label,
    provider: null,
    privacyUrl: null,
  });
}

export function protectedUploadPolicyFor(surface) {
  const transport = formTransportFor(surface);
  const integration = integrations.protectedUpload;
  if (
    !transport
    || transport.provider === "mailto"
    || !integrationCanRender(integration)
    || !integration.allowedSurfaces.includes(surface)
  ) return null;
  return Object.freeze({
    provider: integration.provider,
    ...integration.publicConfig,
  });
}

export function prepareMailto({ recipient, subject, body }) {
  if (typeof recipient !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("The approved recipient address is invalid.");
  }
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function submitApprovedForm(surface, payload, { fetchImpl = globalThis.fetch, signal } = {}) {
  const transport = formTransportFor(surface);
  if (!transport) throw new Error("No approved form transport is available.");
  if (transport.provider === "mailto") {
    return Object.freeze({ mode: "mailto", transport });
  }
  if (typeof fetchImpl !== "function") throw new Error("Secure form submission is unavailable in this browser.");

  const response = await fetchImpl(transport.publicConfig.endpoint, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    redirect: "error",
    referrerPolicy: "strict-origin-when-cross-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      formId: transport.publicConfig.formId,
      surface,
      payload,
    }),
    signal,
  });
  if (!response.ok) throw new Error("The approved form processor did not accept the request.");

  let result = {};
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) result = await response.json();
  const receipt = typeof result.receipt === "string" && /^[a-z0-9_-]{6,128}$/i.test(result.receipt)
    ? result.receipt
    : null;
  return Object.freeze({ mode: "submitted", receipt, transport });
}

const validUploadFile = (file, policy) =>
  file
  && typeof file.name === "string"
  && file.name.length >= 1
  && file.name.length <= 180
  && !/[\\/\u0000-\u001F]/.test(file.name)
  && Number.isInteger(file.size)
  && file.size > 0
  && file.size <= policy.maxBytes
  && policy.allowedMimeTypes.includes(file.type);

export function createFileShareAuthorization(onDate = new Date()) {
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) {
    throw new Error("A valid file-sharing authorization time is required.");
  }
  return Object.freeze({
    confirmed: true,
    statementVersion: FILE_SHARE_AUTHORIZATION_VERSION,
    confirmedAt: onDate.toISOString(),
  });
}

const validFileShareAuthorization = (authorization) =>
  authorization
  && authorization.confirmed === true
  && authorization.statementVersion === FILE_SHARE_AUTHORIZATION_VERSION
  && typeof authorization.confirmedAt === "string"
  && Number.isFinite(new Date(authorization.confirmedAt).getTime())
  && new Date(authorization.confirmedAt) <= new Date();

export async function uploadProtectedFile(
  surface,
  file,
  {
    authorization,
    fetchImpl = globalThis.fetch,
    signal,
  } = {},
) {
  const policy = protectedUploadPolicyFor(surface);
  if (!policy) throw new Error("Protected upload is not approved for this form.");
  if (!validUploadFile(file, policy)) throw new Error("This file does not meet the approved type or size policy.");
  if (!validFileShareAuthorization(authorization)) {
    throw new Error("Confirm authorization and the approved privacy notice before sharing a file.");
  }
  if (typeof fetchImpl !== "function") throw new Error("Protected upload is unavailable in this browser.");

  const sessionResponse = await fetchImpl(policy.sessionEndpoint, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    redirect: "error",
    referrerPolicy: "strict-origin-when-cross-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      surface,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      authorization,
    }),
    signal,
  });
  if (!sessionResponse.ok) throw new Error("A protected upload session could not be created.");
  const session = await sessionResponse.json();
  if (
    !isHttpsUrl(session.uploadUrl)
    || !policy.allowedUploadHosts.includes(new URL(session.uploadUrl).hostname)
    || typeof session.uploadId !== "string"
    || !/^[a-z0-9_-]{8,160}$/i.test(session.uploadId)
  ) throw new Error("The upload broker returned an invalid session.");

  const uploadResponse = await fetchImpl(session.uploadUrl, {
    method: "PUT",
    mode: "cors",
    credentials: "omit",
    redirect: "error",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
    signal,
  });
  if (!uploadResponse.ok) throw new Error("The protected file upload did not complete.");
  return Object.freeze({
    uploadId: session.uploadId,
    name: file.name,
    authorization,
  });
}
