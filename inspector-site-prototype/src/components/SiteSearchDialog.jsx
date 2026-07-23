import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { business, separationPolicy } from "../../../shared/siteData.js";
import { dedupeSearchRecords, expandedSearchTerms, searchSuggestions } from "../../../shared/searchVocabulary.js";

const bundlePath = "/pagefind/inspector/pagefind.js";
const initialStatus = "Enter a topic to search the inspection guides and service pages.";
const resultSummary = (result) => (result.meta?.description || result.excerpt || "Open this inspection page.")
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
    setStatus(`Searching inspection guidance for “${term}”…`);
    try {
      const pagefind = await import(/* @vite-ignore */ bundlePath);
      await pagefind.init();
      const responses = await Promise.all(expandedSearchTerms("inspector", term).map((searchTerm) => pagefind.search(searchTerm)));
      const candidates = responses.flatMap((response) => response.results.slice(0, 10));
      const records = dedupeSearchRecords(await Promise.all(candidates.map((result) => result.data())));
      if (searchRequestRef.current !== requestId) return;
      setResults(records);
      setPhase(records.length ? "results" : "empty");
      setStatus(records.length
        ? `Showing ${records.length} inspection result${records.length === 1 ? "" : "s"}.`
        : `No inspection guidance matched “${term}”.`);
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
      <section className="search-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="inspection-search-title" aria-describedby="inspection-search-description">
        <header className="search-dialog-header">
          <div><p className="eyebrow">Find a clear answer</p><h2 id="inspection-search-title">Search inspection guidance</h2><p id="inspection-search-description">Search visible systems, report guidance, preparation, and inspection limitations.</p></div>
          <button className="search-dialog-close" type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button>
        </header>
        <form className="site-search-form" role="search" onSubmit={runSearch} aria-describedby="inspection-search-status">
          <label htmlFor="inspection-site-search">What would you like to understand?</label>
          <div><Search size={20} aria-hidden="true" /><input ref={inputRef} id="inspection-site-search" type="search" value={query} onChange={handleQueryChange} placeholder="Try roof, electrical, report, or access" autoComplete="off" enterKeyHint="search" /><button className="button button-gold" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button></div>
        </form>
        <div className="search-suggestions" aria-labelledby="inspection-search-suggestions">
          <span id="inspection-search-suggestions">Suggested searches</span>
          <div>{searchSuggestions.inspector.map((suggestion) => <button type="button" onClick={() => { setQuery(suggestion); void performSearch(suggestion); }} disabled={searching} key={suggestion}>{suggestion}</button>)}</div>
        </div>
        <div className="search-response" aria-busy={searching}>
          <p className="search-status" id="inspection-search-status" role={phase === "error" || phase === "validation" ? "alert" : "status"} aria-live={phase === "error" || phase === "validation" ? "assertive" : "polite"} aria-atomic="true">{status}</p>
          {phase === "searching" ? <div className="search-loading" aria-hidden="true"><span /><p>Checking inspection pages and guides…</p></div> : null}
          {phase === "empty" ? <div className="search-guidance"><strong>Try a shorter system or question.</strong><p>Use one or two terms such as roof, electrical, report, access, or water heater. The links below can also help you switch paths.</p></div> : null}
          {phase === "error" ? <div className="search-guidance"><strong>The on-site index is temporarily unavailable.</strong><p>Open Services, FAQ, or Resources from the main navigation, or use the separate-service link below when your question is about project work.</p></div> : null}
          {phase === "validation" ? <div className="search-guidance"><strong>Add a little more detail.</strong><p>Enter at least two letters, or choose one of the suggested searches.</p></div> : null}
          {results.length ? <ol className="search-results" aria-label="Inspection search results">{results.map((result) => <li key={result.url}><a href={result.url}><span>{result.meta?.title || "C&G inspection guidance"}</span><p>{resultSummary(result)}</p><small>Open page <ArrowRight size={14} aria-hidden="true" /></small></a></li>)}</ol> : null}
        </div>
        <aside className="search-recovery" aria-labelledby="inspection-search-recovery-title">
          <div><strong id="inspection-search-recovery-title">Looking for repair or improvement guidance?</strong><p>Use the separate contractor site to review project categories and the required eligibility step.</p></div>
          <a href="/contracting/">Explore the separate contracting service <ArrowRight size={14} aria-hidden="true" /></a>
          <small>{separationPolicy.notice} Licensed contractor of record: {business.contracting.contractorOfRecord}, CSLB #{business.contracting.license.number}.</small>
        </aside>
        <footer className="search-dialog-footer"><span>Private, on-site search</span><p>Your search stays in this browser and is not sent to an analytics or advertising provider.</p></footer>
      </section>
    </div>
  );
}
