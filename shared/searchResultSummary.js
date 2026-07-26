const htmlTag = /<[^>]+>/g;
const acronymWordBoundary = /([A-Z]{2,})([A-Z][a-z]{2,})/g;
const gluedWordBoundary = /([a-z0-9)\].!?;:,])([A-Z][a-z])/g;
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
    .replace(whitespace, " ")
    .trim();
}
