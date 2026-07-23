import { useEffect, useId, useState } from "react";
import { ChevronRight } from "lucide-react";

export function DisclosureGroup({ items, className = "disclosure-list", firstOpen = false, expandOnHash = false, expandRequest = null }) {
  const baseId = useId();
  const [openItems, setOpenItems] = useState(() => (firstOpen && items.length ? new Set([0]) : new Set()));

  useEffect(() => {
    if (!expandOnHash) return undefined;

    const expandHashTarget = () => {
      let hash = window.location.hash.slice(1);
      if (!hash) return;
      try { hash = decodeURIComponent(hash); } catch { /* Keep the literal hash for malformed fragments. */ }
      const targetIndex = items.findIndex((item) => !Array.isArray(item) && item.id === hash);
      if (targetIndex < 0) return;
      setOpenItems((current) => {
        if (current.has(targetIndex)) return current;
        const next = new Set(current);
        next.add(targetIndex);
        return next;
      });
    };

    expandHashTarget();
    window.addEventListener("hashchange", expandHashTarget);
    return () => window.removeEventListener("hashchange", expandHashTarget);
  }, [expandOnHash, items]);

  useEffect(() => {
    if (!expandRequest?.id) return;
    const targetIndex = items.findIndex((item) => !Array.isArray(item) && item.id === expandRequest.id);
    if (targetIndex < 0) return;
    setOpenItems((current) => {
      if (current.has(targetIndex)) return current;
      const next = new Set(current);
      next.add(targetIndex);
      return next;
    });
  }, [expandRequest, items]);

  const toggle = (index) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const value = Array.isArray(item)
          ? { title: item[0], content: item[1] }
          : item;
        const isOpen = openItems.has(index);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <section id={value.id} className={`disclosure-item ${isOpen ? "is-open" : ""}`} key={value.id || value.title}>
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                {value.number ? <span className="disclosure-number">{value.number}</span> : null}
                <span>{value.title}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen}>
              {value.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}
