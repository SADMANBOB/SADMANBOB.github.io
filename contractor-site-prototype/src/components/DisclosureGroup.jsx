import { useId, useState } from "react";

export function DisclosureGroup({ title, summary, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();
  return <section className={`disclosure ${open ? "is-open" : ""}`}><button type="button" aria-expanded={open} aria-controls={regionId} onClick={() => setOpen((value) => !value)}><span><strong>{title}</strong>{summary ? <small>{summary}</small> : null}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button><div id={regionId} hidden={!open} className="disclosure-content">{children}</div></section>;
}
