import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { business, separationPolicy } from "../../../shared/siteData.js";
import { dedupeSearchRecords, expandedSearchTerms, searchSuggestions } from "../../../shared/searchVocabulary.js";

const bundlePath = "/pagefind/contractor/pagefind.js";
const initialStatus = "Enter a topic to search contractor services, process, project types, and FAQs.";
const resultSummary = (result) => (result.meta?.description || result.excerpt || "Open this contractor page.")
  .replace(/<[^>]+>/g, "")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'");

export function SiteSearchDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const returnFocusRef = useRef(null);
  const searchRequestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [phase, setPhase] = useState("idle");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      searchRequestRef.current += 1;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  const performSearch = async (rawTerm) => {
    const term = rawTerm.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus("Enter at least two characters.");
      setPhase("validation");
      inputRef.current?.focus();
      return;
    }
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    setQuery(term);
    setSearching(true);
    setResults([]);
    setPhase("searching");
    setStatus(`Searching contractor guidance for “${term}”…`);
    try {
      const pagefind = await import(/* @vite-ignore */ bundlePath);
      await pagefind.init();
      const responses = await Promise.all(expandedSearchTerms("contractor", term).map((searchTerm) => pagefind.search(searchTerm)));
      const candidates = responses.flatMap((response) => response.results.slice(0, 10));
      const records = dedupeSearchRecords(await Promise.all(candidates.map((result) => result.data())));
      if (searchRequestRef.current !== requestId) return;
      setResults(records);
      setPhase(records.length ? "results" : "empty");
      setStatus(records.length
        ? `Showing ${records.length} contractor result${records.length === 1 ? "" : "s"}.`
        : `No contractor guidance matched “${term}”.`);
    } catch {
      if (searchRequestRef.current !== requestId) return;
      setResults([]);
      setPhase("error");
      setStatus("Search could not load right now.");
    } finally {
      if (searchRequestRef.current === requestId) setSearching(false);
    }
  };

  const runSearch = (event) => {
    event.preventDefault();
    void performSearch(query);
  };

  const handleQueryChange = (event) => {
    searchRequestRef.current += 1;
    setQuery(event.target.value);
    setResults([]);
    setSearching(false);
    setPhase("idle");
    setStatus(initialStatus);
  };

  if (!open) return null;
  return (
    <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="search-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contractor-search-title" aria-describedby="contractor-search-description">
        <header className="search-dialog-header"><div><span>Find the right project path</span><h2 id="contractor-search-title">Search contractor guidance</h2><p id="contractor-search-description">Search project categories, estimating steps, scope boundaries, and eligibility guidance.</p></div><button className="search-dialog-close" type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></header>
        <form className="site-search-form" role="search" onSubmit={runSearch} aria-describedby="contractor-search-status">
          <label htmlFor="contractor-site-search">What work or process question do you have?</label>
          <div><Search size={20} aria-hidden="true" /><input ref={inputRef} id="contractor-site-search" type="search" value={query} onChange={handleQueryChange} placeholder="Try drywall, trim, estimate, or permits" autoComplete="off" enterKeyHint="search" /><button className="button button-copper" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button></div>
        </form>
        <div className="search-suggestions" aria-labelledby="contractor-search-suggestions">
          <span id="contractor-search-suggestions">Suggested searches</span>
          <div>{searchSuggestions.contractor.map((suggestion) => <button type="button" onClick={() => { setQuery(suggestion); void performSearch(suggestion); }} disabled={searching} key={suggestion}>{suggestion}</button>)}</div>
        </div>
        <div className="search-response" aria-busy={searching}>
          <p className="search-status" id="contractor-search-status" role={phase === "error" || phase === "validation" ? "alert" : "status"} aria-live={phase === "error" || phase === "validation" ? "assertive" : "polite"} aria-atomic="true">{status}</p>
          {phase === "searching" ? <div className="search-loading" aria-hidden="true"><span /><p>Checking contractor pages and project guidance…</p></div> : null}
          {phase === "empty" ? <div className="search-guidance"><strong>Try a shorter project or process term.</strong><p>Use one or two terms such as drywall, trim, estimate, permits, or eligibility. Service categories are starting points and do not promise project acceptance.</p></div> : null}
          {phase === "error" ? <div className="search-guidance"><strong>The on-site index is temporarily unavailable.</strong><p>Open Services, Process, Project Types, or FAQ from the main navigation, or use the inspection link below when your question is about property conditions.</p></div> : null}
          {phase === "validation" ? <div className="search-guidance"><strong>Add a little more detail.</strong><p>Enter at least two letters, or choose one of the suggested searches.</p></div> : null}
          {results.length ? <ol className="search-results" aria-label="Contractor search results">{results.map((result) => <li key={result.url}><a href={result.url}><span>{result.meta?.title || "C&G contractor guidance"}</span><p>{resultSummary(result)}</p><small>Open page <ArrowRight size={14} aria-hidden="true" /></small></a></li>)}</ol> : null}
        </div>
        <aside className="search-recovery" aria-labelledby="contractor-search-recovery-title">
          <div><strong id="contractor-search-recovery-title">Looking for condition-focused inspection guidance?</strong><p>{business.inspection.publicName} explains visible and accessible systems, reports, preparation, and inspection limitations.</p></div>
          <a href="/">Visit the home inspection site <ArrowRight size={14} aria-hidden="true" /></a>
          <small>{separationPolicy.notice}</small>
        </aside>
        <footer className="search-dialog-footer"><span>Private, on-site search</span><p>Your search stays in this browser and is not sent to an analytics or advertising provider.</p></footer>
      </section>
    </div>
  );
}
