const htmlTag = /<[^>]+>/g;
const acronymWordBoundary = /([A-Z]{2,})([A-Z][a-z]{2,})/g;
const gluedWordBoundary = /([a-z0-9)\].!?;:,])([A-Z][a-z])/g;
const gluedPhoneBoundary = /([a-z])(?=\(\d{3}\)\s*\d{3}-\d{4})/g;
const gluedPhoneEmailBoundary =
  /(\(\d{3}\)\s*\d{3}-\d{4})(?=[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const whitespace = /\s+/g;

export function searchResultSummary(result, fallback) {
  return String(result?.meta?.description || result?.excerpt || fallback)
    .replace(htmlTag, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(acronymWordBoundary, "$1 $2")
    .replace(gluedWordBoundary, "$1 $2")
    .replace(gluedPhoneBoundary, "$1 ")
    .replace(gluedPhoneEmailBoundary, "$1 ")
    .replace(whitespace, " ")
    .trim();
}
