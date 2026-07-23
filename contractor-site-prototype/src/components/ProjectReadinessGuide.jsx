import { useMemo, useState } from "react";
import { ArrowRight, Check, Printer, RotateCcw } from "lucide-react";

const readinessItems = [
  {
    id: "authority",
    title: "Property and authority",
    prompt: "I have the full property address and authority to request the work.",
    worksheet: "Property address, owner or authorized requester, occupied or vacant",
  },
  {
    id: "eligibility",
    title: "Inspection eligibility",
    prompt: "I can answer whether C&G inspected this property during the previous 12 months.",
    worksheet: "Yes, no, or unsure — do not include an inspection report",
  },
  {
    id: "condition",
    title: "Current condition",
    prompt: "I can describe what is happening, where it is, and when I first noticed it.",
    worksheet: "Location, visible condition, when noticed, and whether it is changing",
  },
  {
    id: "result",
    title: "Desired result",
    prompt: "I can explain the result I want without assuming the cause or repair method.",
    worksheet: "The practical result you want and any finish-matching priorities",
  },
  {
    id: "source",
    title: "Source status",
    prompt: "I can say whether the source condition is resolved, active, or still unknown.",
    worksheet: "Known source, resolved or active status, and any qualified evaluation",
  },
  {
    id: "access",
    title: "Access and constraints",
    prompt: "I can describe occupancy, access, height, pets, parking, or other site constraints.",
    worksheet: "Access windows, occupied areas, pets, parking, height, or protected finishes",
  },
  {
    id: "timing",
    title: "Timing and project context",
    prompt: "I can explain timing, materials, permits, design, trade, or hazard concerns I already know.",
    worksheet: "Real deadline, owner-supplied items, permits, plans, hazards, or other trades",
  },
];

function readinessMessage(completed) {
  if (completed === readinessItems.length) {
    return {
      label: "Ready for eligibility review",
      copy: "You have the core context for a useful first conversation. C&G still needs to review eligibility, license fit, access, scope, and availability.",
    };
  }
  if (completed >= 4) {
    return {
      label: "Strong start",
      copy: "A few missing details can be marked “unknown.” The request does not need to diagnose the property or prescribe the repair.",
    };
  }
  if (completed > 0) {
    return {
      label: "Building the brief",
      copy: "Keep going at your own pace. Plain-language context is more useful than guessing at a technical cause.",
    };
  }
  return {
    label: "Start with what you know",
    copy: "This guide stays in your browser and sends nothing. Check the details you can already provide, then print the worksheet if that is easier.",
  };
}

export function ProjectReadinessGuide({ estimateHref }) {
  const [checked, setChecked] = useState(() => new Set());
  const completed = checked.size;
  const message = useMemo(() => readinessMessage(completed), [completed]);

  const toggle = (id) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="project-readiness-section" id="project-readiness-guide" aria-labelledby="project-readiness-title">
      <div className="container">
        <div className="project-readiness-heading">
          <div>
            <span>Private planning tool</span>
            <h2 id="project-readiness-title">Build a clearer project request before you contact anyone.</h2>
          </div>
          <p>Use the checklist to organize what you know. Your choices stay on this device, are not saved, and do not decide whether a project is accepted.</p>
        </div>

        <div className="project-readiness-layout">
          <div className="readiness-checker">
            <div className="readiness-progress-copy">
              <div>
                <span aria-hidden="true">{String(completed).padStart(2, "0")} / {String(readinessItems.length).padStart(2, "0")}</span>
                <strong>{message.label}</strong>
              </div>
              <button type="button" onClick={() => setChecked(new Set())} disabled={completed === 0}>
                <RotateCcw size={14} aria-hidden="true" /> Reset
              </button>
            </div>
            <progress value={completed} max={readinessItems.length} aria-label={`Project readiness: ${completed} of ${readinessItems.length} details ready`}>
              {completed} of {readinessItems.length} planning details ready
            </progress>
            <p className="readiness-status" aria-live="polite">{message.copy}</p>

            <fieldset>
              <legend>Details I can provide</legend>
              {readinessItems.map((item, index) => (
                <label className={checked.has(item.id) ? "is-checked" : ""} key={item.id}>
                  <input type="checkbox" checked={checked.has(item.id)} onChange={() => toggle(item.id)} />
                  <span className="readiness-check-icon" aria-hidden="true">{checked.has(item.id) ? <Check size={16} /> : String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.title}</strong><small>{item.prompt}</small></span>
                </label>
              ))}
            </fieldset>

            <div className="readiness-actions">
              <a className="button button-graphite" href={estimateHref}>Continue to eligibility <ArrowRight size={15} aria-hidden="true" /></a>
              <button className="button button-outline-dark" type="button" onClick={() => window.print()}><Printer size={15} aria-hidden="true" /> Print blank worksheet</button>
            </div>
            <p className="readiness-privacy">Nothing is uploaded or sent while you use this guide. The next page checks the 12-month inspection boundary before asking for ordinary project details.</p>
          </div>

          <article className="request-worksheet" id="request-worksheet" aria-labelledby="worksheet-title">
            <header>
              <div><span>C&amp;G Contracting Services</span><h3 id="worksheet-title">Project request worksheet</h3></div>
              <span className="worksheet-mark" aria-hidden="true">C&amp;G</span>
            </header>
            <p>Write only what you know. “Unknown” is a useful answer. This worksheet is a planning aid—not an estimate, contract, diagnosis, or acceptance of work.</p>
            <ol>
              {readinessItems.map((item, index) => (
                <li key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{item.title}</strong><small>{item.worksheet}</small><span className="worksheet-lines" aria-hidden="true" /></div>
                </li>
              ))}
            </ol>
            <footer>
              <strong>Before sending</strong>
              <p>Do not include payment data, government IDs, access codes, claim files, or an unredacted inspection report. Wait for an approved path before sharing photographs.</p>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}
