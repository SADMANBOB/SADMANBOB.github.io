import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink, House, Menu, Phone, Search, ShieldCheck, Wrench, X } from "lucide-react";
import { approvedServiceAreas, business, separationPolicy } from "../../shared/siteData.js";
import { Breadcrumbs } from "./components/Breadcrumbs.jsx";
import { DisclosureGroup } from "./components/DisclosureGroup.jsx";
import { EstimateRequestForm } from "./components/EstimateRequestForm.jsx";
import { ProjectReadinessGuide } from "./components/ProjectReadinessGuide.jsx";
import { Seo } from "./components/Seo.jsx";
import { SiteSearchDialog } from "./components/SiteSearchDialog.jsx";
import { contractorFaqs } from "./content/faqs.js";
import { contractorFooterRoutes, contractorNavigation, contractorNotFoundRoute, enabledContractorRoutes, findContractorRoute } from "./content/routes.js";
import { contractorServices, requestCategoryFromSearch } from "./content/services.js";

const appBase = import.meta.env.BASE_URL;
const origin = (import.meta.env.VITE_SITE_ORIGIN || "https://www.cginspection.net").replace(/\/+$/, "");
const contractorOrigin = `${origin}/contracting`;
const assetUrl = (path) => `${appBase}${path.replace(/^\//, "")}`;
const pageUrl = (path) => {
  const [pathAndQuery, fragment] = path.split("#", 2);
  const queryIndex = pathAndQuery.indexOf("?");
  const pathname = queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : pathAndQuery.slice(queryIndex);
  const relative = pathname.replace(/^\/+|\/+$/g, "");
  const route = relative ? `${appBase}${relative}/` : appBase;
  return `${route}${query}${fragment ? `#${fragment}` : ""}`;
};
const normalizePath = (pathname = "/") => {
  const base = appBase.replace(/\/+$/, "");
  const relative = base && pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;
  const pathOnly = relative.split(/[?#]/, 1)[0] || "/";
  return pathOnly === "/" ? "/" : `/${pathOnly.replace(/^\/+|\/+$/g, "")}/`;
};

function InternalLink({ href, onNavigate, children, className = "", ...props }) {
  return <a className={className} href={pageUrl(href)} onClick={(event) => onNavigate(event, href)} {...props}>{children}</a>;
}

function Brand({ onNavigate }) {
  return <InternalLink className="brand" href="/" onNavigate={onNavigate} aria-label={`${business.contracting.publicName} home`}><span className="brand-monogram" aria-hidden="true">C&amp;G</span><span className="brand-name">Contracting Services</span></InternalLink>;
}

function Header({ currentRoute, onNavigate, onOpenSearch }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const navRef = useRef(null);
  useEffect(() => {
    if (open) navRef.current?.querySelector("a")?.focus();
    const close = (event) => { if (event.key === "Escape" && open) { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return <>
    <header className="site-header"><div className="container header-inner"><Brand onNavigate={onNavigate} /><nav ref={navRef} id="contractor-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">{contractorNavigation.map((route) => <InternalLink key={route.path} href={route.path} onNavigate={(event, href) => { onNavigate(event, href); setOpen(false); }} className={currentRoute.key === route.key ? "is-active" : ""} aria-current={currentRoute.key === route.key ? "page" : undefined}>{route.label}</InternalLink>)}<a className="mobile-call" href={business.contracting.phoneHref}><Phone size={15} aria-hidden="true" /> Call {business.contracting.phoneDisplay}</a></nav><div className="header-actions"><a className="header-phone" href={business.contracting.phoneHref}><Phone size={15} aria-hidden="true" />{business.contracting.phoneDisplay}</a><button className="header-search" type="button" onClick={onOpenSearch} aria-label="Search contractor guidance"><Search size={18} aria-hidden="true" /><span>Search</span></button><InternalLink className="button button-small button-copper" href="/estimate/" onNavigate={onNavigate}>Request Estimate</InternalLink><button ref={buttonRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="contractor-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div></div></header>
    <div className="license-line"><div className="container license-line-inner"><nav className="contractor-service-switcher" aria-label="C&G property services"><span>Choose a service</span><a href="/"><House size={13} aria-hidden="true" /> Home Inspection</a><InternalLink className="is-current" href="/" onNavigate={onNavigate} aria-current="true"><Wrench size={13} aria-hidden="true" /> Residential Contracting</InternalLink><InternalLink className="service-rule-link" href="/estimate/#inspection-eligibility" onNavigate={onNavigate}>Separate service · 12-month rule</InternalLink></nav><div className="license-record"><span>Contractor of record: {business.contracting.contractorOfRecord} · CSLB #{business.contracting.license.number} · {business.contracting.license.classification}</span><a href={business.contracting.license.officialLookupUrl} rel="noreferrer" target="_blank">Official verification <ExternalLink size={11} aria-hidden="true" /></a></div></div></div>
  </>;
}

function SeparationNotice({ onNavigate, compact = false }) {
  return <section className={`separation-notice ${compact ? "is-compact" : ""}`} aria-labelledby="separation-title"><div className="container separation-inner"><ShieldCheck aria-hidden="true" /><div><h2 id="separation-title">Inspection and construction stay separate.</h2><p>{separationPolicy.notice}</p></div><InternalLink href="/estimate/" onNavigate={onNavigate}>Review eligibility <ArrowRight size={14} aria-hidden="true" /></InternalLink></div></section>;
}

function PageHero({ title, lead, route, onNavigate, actions, compact = false }) {
  return <><div className="container"><Breadcrumbs currentLabel={route.label} /></div><section className={`page-hero ${compact ? "page-hero-compact" : ""}`}><div className="container"><h1>{title}</h1><p>{lead}</p>{actions ? <div className="page-hero-actions">{actions}</div> : null}</div></section></>;
}

function ServiceList({ onNavigate, detailed = false, limit }) {
  return <div className={`service-rows ${detailed ? "service-rows-detailed" : ""}`}>{contractorServices.slice(0, limit || contractorServices.length).map((service, index) => <article className="service-row" id={service.id} key={service.id} tabIndex={detailed ? -1 : undefined} aria-labelledby={`${service.id}-title`}><span className="service-number">{String(index + 1).padStart(2, "0")}</span><span className="service-icon"><Wrench size={20} aria-hidden="true" /></span><div className="service-copy"><h2 id={`${service.id}-title`}>{service.title}</h2><p>{service.summary}</p>{detailed ? <><div className="service-detail-grid"><div><h3>Potentially eligible examples</h3><ul>{service.examples.map((item) => <li key={item}><Check size={13} aria-hidden="true" />{item}</li>)}</ul></div><div><h3>Boundaries</h3><ul>{service.boundaries.map((item) => <li key={item}>{item}</li>)}</ul></div></div><InternalLink className="button button-graphite service-request-link" href={`/estimate/?category=${service.id}`} onNavigate={onNavigate}>Start with this category <ArrowRight size={14} aria-hidden="true" /></InternalLink></> : <InternalLink className="text-link service-section-link" href={`/services/#${service.id}`} onNavigate={onNavigate}>Review category <ArrowRight size={14} aria-hidden="true" /></InternalLink>}</div></article>)}</div>;
}

function ServiceDirectory({ onNavigate }) {
  const navigateAndFocus = (event, href, targetId) => {
    onNavigate(event, href);
    if (!event.defaultPrevented) return;
    requestAnimationFrame(() => document.getElementById(targetId)?.focus({ preventScroll: true }));
  };
  return <section className="service-directory-section" aria-labelledby="service-directory"><div className="container"><div className="service-directory-heading"><div><span>Project categories</span><h2 id="service-directory" tabIndex="-1">Choose the closest starting point.</h2></div><div><p>A category organizes the first conversation. It does not accept the work or replace property-specific review.</p><InternalLink className="text-link text-link-dark" href="/projects/" onNavigate={onNavigate}>See illustrated project types <ArrowRight size={14} aria-hidden="true" /></InternalLink></div></div><nav className="service-directory-grid" aria-labelledby="service-directory">{contractorServices.map((service, index) => <InternalLink className="service-directory-link" href={`/services/#${service.id}`} onNavigate={(event, href) => navigateAndFocus(event, href, service.id)} key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{service.title}</strong><small>{service.summary}</small></span><ArrowRight size={16} aria-hidden="true" /></InternalLink>)}</nav><div className="service-directory-uncertain"><p><strong>Not sure which category fits?</strong> Choose “Other or not sure” and describe the condition in plain language. Eligibility is still reviewed first.</p><InternalLink href="/estimate/?category=other-or-not-sure" onNavigate={onNavigate}>Start without choosing a category <ArrowRight size={14} aria-hidden="true" /></InternalLink></div></div></section>;
}

const processSteps = [
  ["Submit the request", "Share the address, occupancy, requested work, timing, and inspection-eligibility answer. Photos must wait for an approved sharing path."],
  ["Review eligibility", "C&G confirms the property was not inspected by C&G during the previous 12 months and reviews license and service boundaries."],
  ["Clarify the scope", "Discuss access, source conditions, desired result, materials, permits, trades, schedule, and known constraints."],
  ["Site visit if needed", "A visit may be needed before a written estimate. A visit is not acceptance of the work."],
  ["Written estimate", "Review scope, exclusions, allowances, assumptions, payment terms, permit responsibility, and schedule conditions."],
  ["Authorization and scheduling", "Work is scheduled only after required documents and approvals are complete."],
  ["Changes in discovered conditions", "Concealed or changed conditions are documented and handled through an approved written change process before extra work proceeds."],
  ["Final walkthrough", "Review the accepted scope, completion items, care information, and any documented follow-up."],
];

function ProcessList({ limit }) {
  return <ol className="process-list">{processSteps.slice(0, limit || processSteps.length).map(([title, copy], index) => <li key={title}><span className="process-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{copy}</p></div></li>)}</ol>;
}

const projects = [
  { category: "drywall-surface-repair", title: "Drywall and surface repair", image: "illustrative-drywall-repair.jpg", alt: "Repair professional smoothing a small drywall patch in a protected living space", details: ["Describe the source condition and whether it is resolved", "Show the damaged area and surrounding finish", "Note matching goals, access, moisture, or movement"] },
  { category: "exterior-details", title: "Exterior details", image: "illustrative-exterior-trim.jpg", alt: "Contractor measuring weathered wood trim beneath an exterior window", details: ["Show the detail and its wider weather exposure", "Describe any active leak or concealed-damage concern", "Note material, access, height, and finish condition"] },
  { category: "doors-trim-finish-carpentry", title: "Doors, trim, and finish carpentry", image: "illustrative-finish-carpentry.jpg", alt: "Finish carpenter checking trim alignment beside an interior doorway", details: ["Describe fit, movement, hardware, and desired result", "Show existing profiles and adjacent finishes", "Note settlement, rated assembly, or egress concerns"] },
];

const contractorReasons = [
  ["01", "Eligibility before a sales conversation", "The property-level inspection separation is reviewed before an ordinary project request can move forward."],
  ["02", "A result that can be described", "The request begins with the current condition, desired result, access, known source conditions, and the information still missing."],
  ["03", "Assumptions kept in the open", "License fit, trades, permits, materials, exclusions, allowances, and concealed-condition risk belong in the scope conversation."],
  ["04", "Changes documented before extra work", "If site conditions change the accepted scope, the next decision is documented instead of being hidden inside the project."],
];

const planningExamples = [
  { title: "Drywall after a resolved leak", condition: "The source is reported as repaired, but the wall or ceiling finish still needs evaluation.", helps: "Share the affected area, source status, access, finish-matching goal, and whether moisture or concealed damage is still a concern.", boundary: "The request does not prove the source is resolved or establish the concealed condition." },
  { title: "A door that no longer closes cleanly", condition: "Fit, hardware, trim, movement, egress, rated-assembly, or wider building conditions may affect the scope.", helps: "Describe when it changed, show the full opening and adjacent finishes, and identify the result you want—not only the visible symptom.", boundary: "A finish-work request may require different expertise if structural movement, safety, or another source condition is suspected." },
  { title: "A grouped turnover or punch list", condition: "Several smaller items may involve different materials, access needs, trades, permits, or owner-supplied products.", helps: "Group the list by room or exterior area, rank priorities, identify occupancy and access, and note any real deadline.", boundary: "An illustrative list is not an accepted scope, price, schedule, or promise that every item fits the current service." },
];

function Home({ onNavigate }) {
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow">C&amp;G Contracting Services</span><h1>Practical repairs. <em>Built to last.</em></h1><p>Start with a clear description of the property, the condition, and the result you want. C&amp;G reviews eligibility, access, trades, permits, materials, schedule, and license fit before offering an estimate or accepting work.</p><div className="hero-actions"><InternalLink className="button button-copper" href="/estimate/" onNavigate={onNavigate}>Request an Estimate <ArrowRight size={16} aria-hidden="true" /></InternalLink><InternalLink className="text-link text-link-dark" href="/services/" onNavigate={onNavigate}>Explore Services <ArrowRight size={15} aria-hidden="true" /></InternalLink></div></div><figure className="hero-image"><img src={assetUrl("assets/contractor-hero.jpg")} alt="Contractor carefully measuring interior wood trim" width="960" height="640" /><figcaption>Representative editorial image · not client project photography</figcaption></figure></div></section>
    <section className="project-summary-band"><div className="container project-summary-grid">{[["01", "Eligibility first", "The 12-month inspection boundary is checked before an ordinary request."], ["02", "Defined scope", "Requested work, assumptions, exclusions, trades, and access are reviewed."], ["03", "Written estimate", "No price, acceptance, or work date is promised by this website."], ["04", "License visible", `${business.contracting.contractorOfRecord} · CSLB #${business.contracting.license.number}`]].map(([number, title, copy]) => <div className="project-summary-item" key={title}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></div>)}</div></section>
    <section className="contractor-confidence-section"><div className="container"><div className="section-heading split-heading"><div><span>Why C&amp;G</span><h2>A professional project begins before the tools come out.</h2></div><p>Good work needs more than a polished gallery. It needs a request that can be evaluated, a scope that can be understood, and boundaries that stay visible.</p></div><div className="contractor-reason-grid">{contractorReasons.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="request-ready-panel"><div><span>Make the first conversation useful</span><h3>A request C&amp;G can evaluate.</h3></div><ul>{["Full property address and authority to request work", "Plain-language condition and desired result", "Source status, affected areas, occupancy, and access", "Timing, materials, permit, design, and hazard context", "A direct answer to the 12-month inspection eligibility question"].map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul><InternalLink className="button button-graphite" href="/estimate/" onNavigate={onNavigate}>Prepare the request <ArrowRight size={15} aria-hidden="true" /></InternalLink></div></div></section>
    <section className="services-section"><div className="container"><div className="section-heading split-heading"><div><span>Service categories</span><h2>Start with what needs attention.</h2></div><p>Each request is reviewed for the property, required trades, permits, access, materials, schedule, and license fit.</p></div><ServiceList onNavigate={onNavigate} /><InternalLink className="section-link" href="/services/" onNavigate={onNavigate}>See detailed categories and boundaries <ArrowRight size={15} aria-hidden="true" /></InternalLink></div></section>
    <section className="process-section"><div className="container process-grid"><div className="process-heading"><span>Visible process</span><h2>Clear before work begins.</h2><p>Good project communication starts with eligibility and a written definition of the requested result.</p><InternalLink className="button button-outline section-link" href="/process/" onNavigate={onNavigate}>See all eight steps</InternalLink></div><ProcessList limit={6} /></div></section>
    <section className="about-preview"><div className="container about-preview-grid"><figure className="about-image"><img src={assetUrl("assets/project-planning.jpg")} alt="Construction professionals reviewing a residential project plan" width="960" height="640" /></figure><div className="about-copy"><span>Scope and communication</span><h2>Assumptions belong in the open.</h2><p>Good project communication begins before work starts. C&amp;G defines the requested scope, identifies assumptions and exclusions, and confirms whether the project fits the contractor's current capabilities and schedule.</p><div className="credential-line"><ShieldCheck aria-hidden="true" /><div><strong>{business.contracting.contractorOfRecord}</strong><a href={business.contracting.license.officialLookupUrl} rel="noreferrer" target="_blank">CSLB #{business.contracting.license.number} · verify officially <ExternalLink size={12} aria-hidden="true" /></a></div></div><InternalLink className="text-link text-link-dark" href="/about/" onNavigate={onNavigate}>How identity and scope are disclosed <ArrowRight size={15} aria-hidden="true" /></InternalLink></div></div></section>
    <SeparationNotice onNavigate={onNavigate} />
    <section className="estimate-cta"><div className="container estimate-cta-inner"><div><h2>Describe the project.</h2><p>Start an eligibility and scope review. No estimate or schedule is promised.</p></div><div className="cta-actions"><InternalLink className="button button-copper" href="/estimate/" onNavigate={onNavigate}>Review request form</InternalLink><a className="button button-outline" href={business.contracting.phoneHref}>Call {business.contracting.phoneDisplay}</a></div></div></section>
  </>;
}

function Services({ route, onNavigate }) {
  const navigateToDirectory = (event, href) => {
    onNavigate(event, href);
    if (!event.defaultPrevented) return;
    requestAnimationFrame(() => document.getElementById("service-directory")?.focus({ preventScroll: true }));
  };
  return <><PageHero route={route} compact title="Residential work with a clear, practical scope." lead="Service categories help start the conversation. Final acceptance depends on the property, inspection eligibility, required trades, permits, access, materials, schedule, and the contractor's license and capabilities." actions={<><InternalLink className="button button-copper" href="/services/#service-directory" onNavigate={navigateToDirectory}>Choose a category <ArrowRight size={15} aria-hidden="true" /></InternalLink><InternalLink className="button button-outline" href="/estimate/" onNavigate={onNavigate}>Review eligibility</InternalLink></>} /><ServiceDirectory onNavigate={onNavigate} /><ProjectReadinessGuide estimateHref={pageUrl("/estimate/")} /><section className="services-section services-page-section" aria-label="Detailed service scopes and boundaries"><div className="container"><ServiceList detailed onNavigate={onNavigate} /></div></section><section className="third-party-report"><div className="container"><h2>Eligible work based on a third-party inspection report</h2><p>A report prepared by an independent inspector may help describe a requested project. C&amp;G still performs its own scope review and does not adopt the inspector's conclusions, guarantee that every related condition is visible, or treat the report as construction drawings. Remove confidential client information or confirm that you are authorized to share it.</p></div></section><SeparationNotice onNavigate={onNavigate} /><section className="estimate-cta"><div className="container estimate-cta-inner"><div><h2>Ready to describe the scope?</h2><p>Choose a category and review the eligibility guard before preparing an email.</p></div><InternalLink className="button button-copper" href="/estimate/" onNavigate={onNavigate}>Request review</InternalLink></div></section></>;
}

function Process({ route, onNavigate }) {
  return <><PageHero route={route} title="A straightforward project should have a visible process." lead="Eligibility and scope come before an estimate, scheduling, or work." /><section className="process-section process-page-section"><div className="container process-grid"><div className="process-heading"><span>Eight steps</span><h2>From request to final walkthrough.</h2><p>Contract terms, deposit statements, warranty promises, and cancellation language are intentionally not published until reviewed for the actual business and California requirements.</p></div><ProcessList /></div></section><SeparationNotice onNavigate={onNavigate} /></>;
}

function About({ route, onNavigate }) {
  const license = business.contracting.license;
  return <><PageHero route={route} title="Construction experience, organized around a clear scope." lead="C&G Contracting Services focuses on practical residential repair and finish work that can be clearly described, reviewed for license fit, and documented in a written estimate." /><section className="about-story"><div className="container about-story-grid"><figure className="about-story-image"><img src={assetUrl("assets/contractor-hero.jpg")} alt="Contractor carefully measuring interior wood trim" width="960" height="640" /></figure><div className="about-story-copy"><span>Public identity</span><h2>The contractor of record stays visible.</h2><p>The public C&amp;G name does not replace the contractor of record. The contractor identity and current license information remain visible throughout the site.</p><p className="legal-name-note">C&amp;G Contracting Services is the public-facing service name shown on this site. Coastal Construction Services is identified as the contractor of record. Confirm the appropriate legal business-name disclosure before publication.</p></div></div></section><section className="credentials-section"><div className="container credentials-grid"><div><span>Official license record</span><h2>Current public verification</h2><p>License details were checked against the official California Contractors State License Board record. The exact legal relationship between the public-facing name and contractor of record still awaits owner confirmation.</p></div><div className="license-panel"><div><span>Contractor of record</span><strong>{business.contracting.contractorOfRecord}</strong></div><div><span>California license</span><strong>CSLB #{license.number}</strong></div><div><span>Classification</span><strong>{license.classification}</strong></div><div><span>Last live checked</span><strong>{license.liveVerifiedAt}</strong></div><a className="button button-graphite" href={license.officialLookupUrl} rel="noreferrer" target="_blank">Open official record <ExternalLink size={14} aria-hidden="true" /></a></div></div></section><section className="values-section"><div className="container"><h2>Working values</h2><ul>{["Define the requested result before scheduling", "State exclusions and assumptions", "Identify specialty or design needs early", "Document changes rather than hiding them", "Keep inspection and contracting records separated as required", "Use project photography and testimonials only with approval"].map((value) => <li key={value}><Check aria-hidden="true" />{value}</li>)}</ul></div></section><SeparationNotice onNavigate={onNavigate} /></>;
}

function Projects({ route, onNavigate }) {
  return <><PageHero route={route} title="Project Types" lead="Representative categories can help you describe a request without implying that these images show completed C&G work." /><section className="representative-work"><div className="container"><p className="illustrative-disclosure project-disclosure"><strong>Illustrative material</strong>The images on this page are representative editorial illustrations of project types. They are not photographs of completed C&amp;G client projects.</p><div className="representative-grid">{projects.map((project) => <article className="representative-card" key={project.title}><div className="representative-media"><img src={assetUrl(`assets/${project.image}`)} alt={project.alt} width="960" height="640" /></div><div className="project-card-copy"><h2>{project.title}</h2><ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><InternalLink className="text-link text-link-dark" href={`/estimate/?category=${project.category}`} onNavigate={onNavigate}>Describe this project type <ArrowRight size={14} aria-hidden="true" /></InternalLink></div></article>)}</div></div></section><section className="project-type-index"><div className="container"><div className="section-heading split-heading"><div><span>All current categories</span><h2>Find the closest starting point.</h2></div><p>A category organizes the first conversation. It does not accept the work or replace property-specific review.</p></div><div className="project-type-grid">{contractorServices.map((service, index) => <article key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.summary}</p><ul>{service.examples.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul><InternalLink href={`/services/#${service.id}`} onNavigate={onNavigate}>Review scope and boundaries <ArrowRight size={14} aria-hidden="true" /></InternalLink><InternalLink href={`/estimate/?category=${service.id}`} onNavigate={onNavigate}>Start request with this category <ArrowRight size={14} aria-hidden="true" /></InternalLink></article>)}</div></div></section><section className="planning-examples-section"><div className="container"><div className="section-heading split-heading"><div><span>Illustrative planning examples</span><h2>Turn a symptom into a better project brief.</h2></div><p>These are educational scenarios—not customer stories, completed work, estimates, schedules, or promises about a property.</p></div><div className="planning-example-grid">{planningExamples.map((example, index) => <article key={example.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{example.title}</h3><dl><div><dt>Starting condition</dt><dd>{example.condition}</dd></div><div><dt>What helps</dt><dd>{example.helps}</dd></div><div><dt>Scope boundary</dt><dd>{example.boundary}</dd></div></dl><InternalLink className="text-link text-link-dark" href="/estimate/" onNavigate={onNavigate}>Prepare an eligible request <ArrowRight size={14} aria-hidden="true" /></InternalLink></article>)}</div></div></section><SeparationNotice onNavigate={onNavigate} /></>;
}

function Faq({ route, onNavigate }) {
  return <><PageHero route={route} title="Contractor questions, answered before a request." lead="Review project fit, eligibility, estimates, materials, permits, concealed conditions, specialty work, and scheduling boundaries." /><section className="faq-section"><div className="container faq-layout"><aside><h2>Before you submit</h2><p>An answer describes the current review process; it does not accept work or promise a result.</p><InternalLink className="button button-graphite" href="/estimate/" onNavigate={onNavigate}>Review the form</InternalLink></aside><div>{contractorFaqs.map(([question, answer], index) => <DisclosureGroup key={question} title={question} defaultOpen={index === 0}><p>{answer}</p></DisclosureGroup>)}</div></div></section><SeparationNotice onNavigate={onNavigate} /></>;
}

function Estimate({ route, categoryKey }) {
  return <><PageHero route={route} title="Tell us what needs attention." lead="The details below help C&G decide whether the request is eligible, whether it fits the contractor's license and current services, and whether an estimate visit is the right next step. This form does not create a contract, promise a price, or reserve a work date." /><section className="estimate-page-section"><div className="container estimate-page-grid"><div className="estimate-form-wrap"><h2>Project review details</h2><EstimateRequestForm key={categoryKey || "unclassified"} initialCategoryKey={categoryKey} /></div><aside className="estimate-sidebar"><div><span>Current contact</span><a href={business.contracting.phoneHref}><Phone size={17} aria-hidden="true" />{business.contracting.phoneDisplay}</a><a href={`mailto:${business.contracting.email}`}>{business.contracting.email}</a></div><div className="estimate-policy"><ShieldCheck aria-hidden="true" /><p>{separationPolicy.notice}</p></div><div><span>Transport truth</span><p>This page validates information locally and prepares a mailto draft. It does not upload files or send data to a server.</p></div></aside></div></section></>;
}

function Privacy({ route }) {
  return <><PageHero route={route} title="Contractor privacy notice" lead="This notice describes the current static website and email-preparation flow. It should be reviewed with the business's actual record-retention and legal practices before publication." /><section className="policy-section"><div className="container policy-copy"><h2>Information you choose to provide</h2><p>The estimate form can prepare an email containing contact, property, project, access, timing, material, permit, hazard, eligibility, and consent details. The website does not receive the form or store its contents on a C&amp;G server.</p><h2>Photos and reports</h2><p>This basic form has no upload. Wait for an approved sharing method. If an independent inspection report is later shared, remove confidential information or confirm authorization. Do not send full claim files, financial documents, government IDs, payment cards, alarm or lockbox codes, or unredacted reports.</p><h2>Eligibility screening and separation</h2><p>Eligibility answers distinguish an ordinary project request, a manual review, and a blocked property. C&amp;G inspection-client data is not used for contracting solicitation. The website itself does not retain blocked requests.</p><h2>Communications and specialist sharing</h2><p>Opening a prepared mailto link transfers the draft to the visitor's email application and provider. Estimating communications may later be shared with a subcontractor or specialist only when needed and authorized; this site does not perform that sharing.</p><h2>Hosting, fonts, search, and analytics</h2><p>The site is delivered as static files through GitHub Pages. Google Fonts may receive ordinary technical request data when fonts load. Pagefind searches the static contractor index inside the visitor's browser; search terms are not sent to a hosted-search or analytics provider. No analytics provider or advertising tracker is enabled.</p><h2>Contact</h2><p>Privacy questions may be sent to <a href={`mailto:${business.contracting.email}`}>{business.contracting.email}</a>. Professional review of final privacy and retention wording remains pending.</p></div></section></>;
}

function NotFound({ onNavigate }) {
  return <section className="not-found"><div className="container"><span>404</span><h1>That contractor page was not found.</h1><p>The requested route is not enabled in the current contractor site.</p><InternalLink className="button button-copper" href="/" onNavigate={onNavigate}>Return to contracting home</InternalLink></div></section>;
}

function Footer({ onNavigate }) {
  const areas = approvedServiceAreas("Contractor");
  return <footer className="site-footer"><div className="container"><div className="footer-grid"><div><Brand onNavigate={onNavigate} /><p>Residential project requests reviewed for eligibility, license fit, scope, access, permits, materials, and schedule. Representative editorial images are not client project photographs.</p></div><nav className="footer-links" aria-label="Contractor footer"><span>Contracting</span>{contractorFooterRoutes.map((route) => <InternalLink key={route.path} href={route.path} onNavigate={onNavigate}>{route.label}</InternalLink>)}</nav><div className="footer-links"><span>Separate services</span><a href="/">Home inspection</a><a href="/property-services/">Property-services chooser</a><a href={business.contracting.phoneHref}>{business.contracting.phoneDisplay}</a><a href={`mailto:${business.contracting.email}`}>{business.contracting.email}</a>{areas.length ? <p>{areas.map((area) => area.label).join(", ")}</p> : <p>Service-area publication awaits owner verification.</p>}</div></div><div className="footer-license"><span>Contractor of record: {business.contracting.contractorOfRecord} · CSLB #{business.contracting.license.number} · {business.contracting.license.classification}</span><a href={business.contracting.license.officialLookupUrl} rel="noreferrer" target="_blank">Official CSLB lookup <ExternalLink size={11} aria-hidden="true" /></a></div><p className="footer-policy">{separationPolicy.notice}</p><div className="footer-bottom"><span>© {new Date().getFullYear()} C&amp;G. Public-facing service information.</span><InternalLink href="/privacy/" onNavigate={onNavigate}>Privacy</InternalLink></div></div></footer>;
}

function MobileQuickActions({ currentRoute, onNavigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 260);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (!visible) return null;
  const primaryAction = currentRoute.key === "estimate"
    ? <a className="button button-copper" href={business.contracting.phoneHref}><Phone size={15} aria-hidden="true" /> Call</a>
    : <InternalLink className="button button-copper" href="/estimate/" onNavigate={onNavigate}><ArrowRight size={15} aria-hidden="true" /> Start request</InternalLink>;
  return <nav className="mobile-conversion-rail" aria-label="Quick contractor actions"><InternalLink className="button button-graphite" href="/services/#service-directory" onNavigate={onNavigate}><Wrench size={15} aria-hidden="true" /> Services</InternalLink>{primaryAction}</nav>;
}

export function App({ initialPath }) {
  const initial = normalizePath(initialPath ?? (typeof window === "undefined" ? "/" : window.location.pathname));
  const [path, setPath] = useState(initial);
  const [search, setSearch] = useState(() => typeof window === "undefined" ? "" : window.location.search);
  const [searchOpen, setSearchOpen] = useState(false);
  const route = findContractorRoute(path);
  useEffect(() => {
    const pop = () => {
      setPath(normalizePath(window.location.pathname));
      setSearch(window.location.search);
      const fragment = window.location.hash.slice(1);
      if (fragment) requestAnimationFrame(() => {
        const target = document.getElementById(fragment);
        target?.scrollIntoView();
        target?.focus({ preventScroll: true });
      });
      else window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const fragment = window.location.hash.slice(1);
      const target = fragment ? document.getElementById(fragment) : null;
      if (target) {
        target.scrollIntoView();
        target.focus({ preventScroll: true });
      } else document.getElementById("main-content")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [path]);
  const navigate = (event, nextPath) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = pageUrl(nextPath);
    window.history.pushState({}, "", href);
    setPath(normalizePath(nextPath));
    setSearch(new URL(href, window.location.origin).search);
    const fragment = nextPath.split("#", 2)[1];
    if (fragment) requestAnimationFrame(() => document.getElementById(fragment)?.scrollIntoView());
    else window.scrollTo({ top: 0, behavior: "auto" });
  };
  let page;
  if (route.key === "home") page = <Home onNavigate={navigate} />;
  else if (route.key === "services") page = <Services route={route} onNavigate={navigate} />;
  else if (route.key === "process") page = <Process route={route} onNavigate={navigate} />;
  else if (route.key === "about") page = <About route={route} onNavigate={navigate} />;
  else if (route.key === "projects") page = <Projects route={route} onNavigate={navigate} />;
  else if (route.key === "faq") page = <Faq route={route} onNavigate={navigate} />;
  else if (route.key === "estimate") page = <Estimate route={route} categoryKey={requestCategoryFromSearch(search)} />;
  else if (route.key === "privacy") page = <Privacy route={route} />;
  else page = <NotFound onNavigate={navigate} />;
  return <div className="site-shell"><Seo route={route.key === "notFound" ? contractorNotFoundRoute : route} origin={contractorOrigin} /><a className="skip-link" href="#main-content">Skip to content</a><Header currentRoute={route} onNavigate={navigate} onOpenSearch={() => setSearchOpen(true)} /><main id="main-content" tabIndex="-1" data-pagefind-body>{page}</main><Footer onNavigate={navigate} /><MobileQuickActions currentRoute={route} onNavigate={navigate} /><SiteSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} /></div>;
}

export { enabledContractorRoutes };
