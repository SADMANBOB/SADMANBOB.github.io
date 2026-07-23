import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

const bundlePath = "/pagefind/contractor/pagefind.js";
const resultSummary = (result) => (result.meta?.description || result.excerpt || "Open this contractor page.")
  .replace(/<[^>]+>/g, "")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'");

export function SiteSearchDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("Enter a topic to search contractor services, process, project types, and FAQs.");
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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  const runSearch = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus("Enter at least two characters.");
      inputRef.current?.focus();
      return;
    }
    setSearching(true);
    setStatus(`Searching contractor guidance for “${term}”…`);
    try {
      const pagefind = await import(/* @vite-ignore */ bundlePath);
      await pagefind.init();
      const response = await pagefind.search(term);
      const records = await Promise.all(response.results.slice(0, 10).map((result) => result.data()));
      setResults(records);
      setStatus(records.length
        ? `${response.results.length} contractor result${response.results.length === 1 ? "" : "s"} found.`
        : `No contractor guidance matched “${term}”. Try drywall, trim, estimate, permits, or eligibility.`);
    } catch {
      setResults([]);
      setStatus("Search is available on the built website. You can still use Services, Process, Project Types, and FAQ from the main navigation.");
    } finally {
      setSearching(false);
    }
  };

  if (!open) return null;
  return (
    <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="search-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contractor-search-title">
        <header className="search-dialog-header"><div><span>Find the right project path</span><h2 id="contractor-search-title">Search contractor guidance</h2></div><button className="search-dialog-close" type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></header>
        <form className="site-search-form" role="search" onSubmit={runSearch}>
          <label htmlFor="contractor-site-search">What work or process question do you have?</label>
          <div><Search size={20} aria-hidden="true" /><input ref={inputRef} id="contractor-site-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try drywall, trim, estimate, or permits" autoComplete="off" /><button className="button button-copper" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button></div>
        </form>
        <p className="search-status" role="status" aria-live="polite">{status}</p>
        {results.length ? <ol className="search-results">{results.map((result) => <li key={result.url}><a href={result.url}><span>{result.meta?.title || "C&G contractor guidance"}</span><p>{resultSummary(result)}</p><small>Open page <ArrowRight size={14} aria-hidden="true" /></small></a></li>)}</ol> : null}
        <footer className="search-dialog-footer"><span>Private, on-site search</span><p>Your search stays in this browser and is not sent to an analytics or advertising provider.</p></footer>
      </section>
    </div>
  );
}
