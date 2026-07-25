export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "child-src 'self'",
  "frame-src 'none'",
  "media-src 'none'",
  "manifest-src 'none'",
  "form-action 'self' mailto:",
  "upgrade-insecure-requests",
].join("; ");

export const contentSecurityPolicyMetaTag = () =>
  `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
