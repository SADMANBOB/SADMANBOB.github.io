import { CONTENT_SECURITY_POLICY } from "../../shared/securityPolicy.js";

// The production directive upgrades HTTP subresources to HTTPS. The Playwright
// fixture intentionally serves plain HTTP on loopback, so WebKit would upgrade
// its own fixture assets to a nonexistent TLS server. Static verification
// covers the complete production policy; browser tests exercise the remaining
// policy unchanged.
export const LOOPBACK_CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY.replace(
  /;\s*upgrade-insecure-requests$/,
  "",
);

export const productionPolicyMeta = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
export const loopbackPolicyMeta = `<meta http-equiv="Content-Security-Policy" content="${LOOPBACK_CONTENT_SECURITY_POLICY}" />`;
