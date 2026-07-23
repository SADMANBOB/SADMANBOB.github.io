import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  CircleOff,
  ClipboardCheck,
  CookingPot,
  Droplets,
  Flame,
  Gauge,
  Hammer,
  House,
  Layers,
  Menu,
  Mountain,
  Phone,
  Printer,
  ScanLine,
  Search,
  ShieldCheck,
  Snowflake,
  ThermometerSun,
  Trees,
  Triangle,
  WashingMachine,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import {
  approvedServiceAreas,
  business,
  claims,
  separationPolicy,
} from "../../shared/siteData.js";
import {
  getApprovedServiceAreaPages,
} from "../../shared/publicationRegistry.js";
import {
  bookingActionFor,
  formTransportFor,
  protectedUploadPolicyFor,
} from "../../shared/integrationAdapters.js";
import {
  responsiveImageProps,
  responsivePictureSources,
} from "../../shared/imageVariants.js";
import {
  OWNER_REVIEW_STAGING_VISIBLE,
  ownerReviewBannerCopy,
  provisionalBusinessDetails,
  serviceAreaQualification,
} from "../../shared/ownerReview.js";
import { Breadcrumbs } from "./components/Breadcrumbs.jsx";
import { ContactRequestForm } from "./components/ContactRequestForm.jsx";
import { DisclosureGroup } from "./components/DisclosureGroup.jsx";
import { ReviewCarousel } from "./components/ReviewCarousel.jsx";
import { Seo } from "./components/Seo.jsx";
import { SiteSearchDialog } from "./components/SiteSearchDialog.jsx";
import { inspectorFaqGroups } from "./content/faqs.js";
import { enabledInspectionScope } from "./content/inspectionScope.js";
import {
  enabledInspectorRoutes,
  findInspectorRoute,
  inspectorFooterRoutes,
  inspectorNavigation,
  inspectorNotFoundRoute,
} from "./content/routes.js";
import { readingMinutes, resourceBySlug, resourceGroups } from "./content/resources.js";

const contractorUrl = "/contracting/";
const propertyServicesUrl = "/property-services/";
const appBase = import.meta.env.BASE_URL;
const siteOrigin = (import.meta.env.VITE_SITE_ORIGIN || business.inspection.origin).replace(/\/+$/, "");
const inspectionFormTransport = formTransportFor("inspector-contact");
const inspectionSecureFormEnabled = Boolean(inspectionFormTransport && inspectionFormTransport.provider !== "mailto");
const inspectionUploadPolicy = protectedUploadPolicyFor("inspector-contact");
const assetUrl = (path) => `${appBase}${path.replace(/^\//, "")}`;

const pageUrl = (path) => {
  const relativePath = path.replace(/^\/+|\/+$/g, "");
  return relativePath ? `${appBase}${relativePath}/` : appBase;
};

function InspectionPrimaryAction({ className = "button button-gold", onNavigate, short = false }) {
  const action = bookingActionFor("inspector", {
    href: "/contact/",
    label: short ? "Request" : "Request an Inspection",
  });
  const content = <>{action.label} <ArrowRight size={short ? 15 : 17} aria-hidden="true" /></>;
  if (action.external) {
    return <><a className={className} href={action.href} rel="noreferrer">{content}</a><a className="booking-privacy-link" href={action.privacyUrl} rel="noreferrer" target="_blank">Scheduling privacy</a></>;
  }
  return <InternalLink className={className} href={action.href} onNavigate={onNavigate}>{content}</InternalLink>;
}

const normalizeRoutePath = (pathname = "/") => {
  const basePath = appBase.replace(/\/+$/, "");
  const relativePath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const pathOnly = relativePath.split(/[?#]/, 1)[0] || "/";
  return pathOnly === "/" ? "/" : `/${pathOnly.replace(/^\/+|\/+$/g, "")}/`;
};

function InternalLink({ href, onNavigate, children, className = "", ...props }) {
  const handleClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    onNavigate(event, href);
  };
  return <a className={className} href={pageUrl(href)} onClick={handleClick} {...props}>{children}</a>;
}

function EditorialPicture({ id, sizes, loading, fetchPriority }) {
  const sources = responsivePictureSources(id, { basePath: appBase, sizes });
  const image = responsiveImageProps(id, { basePath: appBase, sizes });
  return <picture style={{ display: "contents" }}>{sources.map((source) => <source key={source.type} {...source} />)}<img {...image} loading={loading} fetchPriority={fetchPriority} /></picture>;
}

function BrandMark({ onNavigate }) {
  return (
    <InternalLink className="brand" href="/" onNavigate={onNavigate} aria-label={`${business.inspection.publicName} home`}>
      <span className="brand-mark-wrap"><img src={assetUrl("assets/cg-logo-mark.png")} alt="" className="brand-mark" width="54" height="54" /></span>
      <span className="brand-copy"><strong>C&amp;G Certified</strong><span>Home Inspector</span></span>
    </InternalLink>
  );
}

function ServiceSwitcher({ onNavigate }) {
  return (
    <div className="service-switcher" aria-label="C&G property services">
      <div className="container service-switcher-inner">
        <span className="service-switcher-label">Choose a service</span>
        <InternalLink className="service-switcher-link is-current" href="/" onNavigate={onNavigate} aria-current="true"><House size={14} aria-hidden="true" /> Home Inspection</InternalLink>
        <a className="service-switcher-link" href={contractorUrl}><Hammer size={14} aria-hidden="true" /> Contracting <span>Separate service</span></a>
        <InternalLink className="service-switcher-policy" href="/ethics/" onNavigate={onNavigate}>12-month separation policy</InternalLink>
      </div>
    </div>
  );
}

function SiteHeader({ currentRoute, mobileMenuOpen, setMobileMenuOpen, onNavigate, onOpenSearch }) {
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    menuRef.current?.querySelector("a")?.focus();
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandMark onNavigate={onNavigate} />
        <nav id="inspector-navigation" ref={menuRef} className={`desktop-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {inspectorNavigation.map((route) => (
            <InternalLink
              key={route.path}
              href={route.path}
              onNavigate={(event, href) => {
                onNavigate(event, href);
                setMobileMenuOpen(false);
              }}
              className={currentRoute.key === route.key ? "is-active" : ""}
              aria-current={currentRoute.key === route.key ? "page" : undefined}
            >
              {route.label}
            </InternalLink>
          ))}
          <InspectionPrimaryAction className="mobile-menu-cta button button-gold" onNavigate={onNavigate} />
          <a className="mobile-menu-sister" href={contractorUrl}>Separate contracting service · 12-month rule applies <ArrowRight size={14} aria-hidden="true" /></a>
        </nav>
        <div className="header-actions">
          <a className="phone-link" href={business.inspection.phoneHref} aria-label={`Call C&G at ${business.inspection.phoneDisplay}`}><Phone size={16} aria-hidden="true" /><span>{business.inspection.phoneDisplay}</span></a>
          <button className="header-search" type="button" onClick={onOpenSearch} aria-label="Search inspection guidance"><Search size={18} aria-hidden="true" /><span>Search</span></button>
          <InspectionPrimaryAction className="button button-small button-gold" onNavigate={onNavigate} />
          <button
            ref={menuButtonRef}
            className="menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="inspector-navigation"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function PageHero({ route, onNavigate, eyebrow, title, children, actions, compact = false }) {
  return (
    <section className={`page-hero${compact ? " page-hero-compact" : ""}`}>
      <div className="container page-hero-inner">
        <Breadcrumbs items={route.breadcrumbs} linkFor={pageUrl} onNavigate={onNavigate} />
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children}
        {actions ? <div className="page-hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

function BookingCallout({ onNavigate, eyebrow = "Have a property in mind?", title = "Start with the address, property type, and timing." }) {
  return (
    <section className="contact-section">
      <div className="container contact-card">
        <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
        <div className="contact-actions">
          <InspectionPrimaryAction onNavigate={onNavigate} />
          <a className="button button-outline-light" href={business.inspection.phoneHref}><Phone size={17} aria-hidden="true" /> Call C&amp;G</a>
        </div>
      </div>
    </section>
  );
}

const homeScope = [
  "Site, exterior, roof, and drainage",
  "Structure, foundation, crawlspace, and attic",
  "Electrical, plumbing, gas, and water heating",
  "Heating, cooling, insulation, and ventilation",
  "Kitchen, bathrooms, laundry, and interior rooms",
  "Garage, fireplace, chimney, and approved optional systems",
];

function HomePage({ route, onNavigate }) {
  const audiences = [
    ["Buyers", "Understand visible and accessible conditions before completing the purchase, then separate material concerns, specialist follow-up, and maintenance planning."],
    ["Sellers", "Learn what may deserve attention before listing without assuming another inspector or buyer will reach the same conclusion."],
    ["Homeowners", "Build a clearer maintenance and planning conversation around the home you already own."],
    ["Property professionals", "Support clients with plain language, documented observations, and an independent conclusion."],
  ];
  const process = [
    ["01", "Share the property", "Provide the address, property type, approximate size, desired timing, and reason for the inspection."],
    ["02", "Confirm the scope", "C&G confirms availability, access needs, price, agreement, and any approved optional service before the appointment."],
    ["03", "Inspect and document", "Visible and accessible conditions are reviewed and observations are supported with photographs where useful."],
    ["04", "Review the report", "Read the complete report, note recommended follow-up, and contact C&G with questions."],
  ];
  const areas = approvedServiceAreas("Inspector");
  const turnaround = provisionalBusinessDetails.reportTurnaround;
  const biography = provisionalBusinessDetails.biography;
  const hours = provisionalBusinessDetails.businessHours;
  const responseTime = provisionalBusinessDetails.responseTime;
  const showProvisionalTrust = OWNER_REVIEW_STAGING_VISIBLE;

  return (
    <>
      {OWNER_REVIEW_STAGING_VISIBLE ? <p className="owner-review-banner" role="note">{ownerReviewBannerCopy}</p> : null}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">C&amp;G Certified Home Inspector</p>
            <h1>Know what you’re <em>buying.</em></h1>
            <p className="hero-lede">Home inspections across Los Angeles County and Riverside County. A clear inspection helps you understand the visible condition of the property, focus on the findings that matter, and move into the next conversation with better questions.</p>
            <div className="hero-actions">
              <InspectionPrimaryAction onNavigate={onNavigate} />
              <InternalLink className="text-link text-link-light" href="/services/" onNavigate={onNavigate}>Explore What We Inspect <ChevronRight size={16} aria-hidden="true" /></InternalLink>
            </div>
            <div className="hero-trust"><span><ShieldCheck size={16} aria-hidden="true" /> Clear explanations</span><span><Camera size={16} aria-hidden="true" /> Detailed photos</span><span>No scare tactics</span></div>
          </div>
          <figure className="hero-visual">
            <EditorialPicture id="inspector-hero" sizes="(max-width: 900px) 100vw, 55vw" fetchPriority="high" />
            <figcaption className="hero-caption"><span className="caption-rule" /><span>Editorial illustration of the inspection process.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="page-section page-section-cream">
        <div className="container">
          <div className="section-intro section-intro-row"><div><p className="eyebrow eyebrow-dark">Who the inspection helps</p><h2>Useful guidance for the decision in front of you.</h2></div><p>The same property can raise different questions depending on the client’s role and timing.</p></div>
          <div className="audience-cards audience-cards-four">{audiences.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="scope-explainer-section">
        <div className="container scope-explainer-grid">
          <div className="scope-explainer-heading"><p className="eyebrow eyebrow-dark">What the inspection covers</p><h2>A careful look at the home’s major visible systems.</h2><p>The signed agreement and conditions at the property control the final scope.</p></div>
          <div className="scope-card-grid">{homeScope.map((title, index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3></article>)}</div>
          <InternalLink className="section-link" href="/services/" onNavigate={onNavigate}>See the complete inspection scope <ArrowRight size={17} aria-hidden="true" /></InternalLink>
        </div>
      </section>

      <section className="clarity-section">
        <div className="container clarity-grid"><div className="clarity-heading"><p className="eyebrow">How the process works</p><h2>A clear path from scheduling to follow-up.</h2><p>A submitted request is only the beginning; scope, access, price, and timing are confirmed before the appointment.</p></div><ol className="clarity-list">{process.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div>
      </section>

      <section className="page-section page-section-cream home-areas-section">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div><p className="eyebrow eyebrow-dark">Service areas</p><h2>Los Angeles County and Riverside County.</h2></div>
            <p>{serviceAreaQualification}</p>
          </div>
          <div className="home-area-card-grid">
            {areas.map((area) => (
              <article className="home-area-card" key={area.id}>
                <p className="eyebrow eyebrow-dark">{area.type === "county" ? "County" : "Area"}</p>
                <h3>{area.label}</h3>
                <p>{area.description}</p>
                <ul className="community-chip-list" aria-label={`Representative communities in ${area.label}`}>
                  {area.communities.slice(0, 8).map((city) => <li key={city}>{city}</li>)}
                </ul>
                <div className="home-area-card-actions">
                  <InternalLink href={`/areas/${area.id}/`} onNavigate={onNavigate}>Open {area.label} page <ArrowRight size={15} aria-hidden="true" /></InternalLink>
                  <a href={area.mapsUrl} target="_blank" rel="noreferrer">View area on Google Maps</a>
                </div>
              </article>
            ))}
          </div>
          <InternalLink className="section-link" href="/areas/" onNavigate={onNavigate}>Review all service-area guidance <ArrowRight size={17} aria-hidden="true" /></InternalLink>
        </div>
      </section>

      <section className="proof-band">
        <div className="container">
          <div className="section-intro section-intro-row"><div><p className="eyebrow eyebrow-dark">Trust and report clarity</p><h2>A report you can actually use.</h2></div><p>Observations, photographs, location context, and practical recommendations make the property easier to discuss.</p></div>
          <div className="feature-grid">
            <article className="feature-card feature-card-image"><div className="feature-image"><EditorialPicture id="inspector-report" sizes="(max-width: 760px) 100vw, 33vw" loading="lazy" /></div><div className="feature-card-body"><span className="feature-number">01</span><h3>Visible condition documented</h3><p>Photographs are tied to the relevant observation and location where useful.</p></div></article>
            <article className="feature-card feature-card-image"><div className="feature-image"><EditorialPicture id="inspector-attic" sizes="(max-width: 760px) 100vw, 33vw" loading="lazy" /></div><div className="feature-card-body"><span className="feature-number">02</span><h3>Context that stays connected</h3><p>System, location, limitation, and next-step language remain together.</p></div></article>
            <article className="feature-card feature-card-icon"><div className="feature-icon"><ClipboardCheck size={28} aria-hidden="true" /></div><div className="feature-card-body"><span className="feature-number">03</span><h3>{showProvisionalTrust ? "Provisional timing guidance" : "Delivery timing confirmed when scheduled"}</h3>{showProvisionalTrust ? <><p><span className="provisional-label">Owner review</span> {turnaround.full}</p><p>{hours.weekdaysAndSaturday} {hours.sunday} {responseTime.copy}</p></> : <p>C&amp;G confirms the expected report delivery window when the inspection is scheduled. Timing depends on property size, complexity, access, and scope.</p>}</div></article>
          </div>
          {showProvisionalTrust ? (
            <>
              <p className="provisional-note">Credential and insurance wording remain provisional: {claims.internachiCertification.draftCopy} {claims.generalLiabilityInsurance.draftCopy}</p>
              <InternalLink className="section-link" href="/sample-report/" onNavigate={onNavigate}>Preview the sample-report placeholder <ArrowRight size={17} aria-hidden="true" /></InternalLink>
            </>
          ) : null}
        </div>
      </section>

      <ReviewCarousel heading="Client feedback" />

      <section className="home-process-section">
        <div className="container home-process-grid">
          <div><p className="eyebrow eyebrow-dark">Meet Clarence Gloss</p><h2>Careful observations, explained calmly.</h2></div>
          <div className="home-process-copy">
            {showProvisionalTrust ? (
              <p><span className="provisional-label">Provisional biography</span> {biography.full}</p>
            ) : (
              <p>That construction-informed perspective shapes both the on-site conversation and the report so clients can understand what was visible, what was limited, and what questions remain.</p>
            )}
            <InternalLink className="button button-dark" href="/about/" onNavigate={onNavigate}>Meet Clarence <ArrowRight size={17} aria-hidden="true" /></InternalLink>
          </div>
        </div>
      </section>

      <section className="sister-section">
        <div className="container sister-grid">
          <div className="sister-image-wrap"><EditorialPicture id="cross-service-planning" sizes="(max-width: 900px) 100vw, 45vw" loading="lazy" /><span className="sister-image-label">Editorial illustration</span></div>
          <div className="sister-copy"><p className="eyebrow eyebrow-dark">Inspection independence</p><h2>Inspection conclusions should stand on their own.</h2><p>{separationPolicy.notice}</p><InternalLink className="button button-gold" href="/ethics/" onNavigate={onNavigate}>Read the Inspection Ethics Policy <ArrowRight size={17} aria-hidden="true" /></InternalLink></div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function ServicesPage({ route, onNavigate }) {
  const [scopeRequest, setScopeRequest] = useState(null);
  const items = useMemo(() => enabledInspectionScope.map((section, index) => ({
    ...section,
    number: String(index + 1).padStart(2, "0"),
    content: (
      <div className="scope-disclosure-content">
        <p>{section.summary}</p>
        <h4>Commonly reviewed</h4>
        <ul>{section.reviewed.map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}</ul>
        <p className="scope-limit"><strong>Scope boundary:</strong> {section.limitation}</p>
      </div>
    ),
  })), []);
  const handleScopeRequest = (event, id) => {
    if (window.location.hash === `#${id}`) {
      event.preventDefault();
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }
    setScopeRequest({ id });
  };
  const educationalScenarios = [
    ["A ceiling stain near an exterior wall", "The useful question is not only whether a stain exists. Roof exposure, attic access, drainage, interior finish condition, and visible moisture context may all matter.", "The report can document what was visible and identify the appropriate independent evaluation without claiming a concealed source."],
    ["Soil or hardscape directing water toward the home", "Grading, roof runoff, foundation adjacency, crawlspace access, and visible interior effects can help explain why a site observation deserves context.", "Conditions at the inspection control what can be seen; drainage design and concealed damage remain outside a standard visual inspection."],
    ["An electrical panel concern", "Panel access, visible components, representative devices, occupant safety, and specialist scope are kept connected rather than reduced to a single label.", "The inspection is not a code, engineering, or load analysis. When appropriate, the next step is evaluation by the relevant qualified professional."],
  ];

  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Home inspection services" title="A practical inspection for a clearer property decision." actions={<InspectionPrimaryAction onNavigate={onNavigate} />}>
        <p className="page-hero-lede">Whether you are buying, selling, maintaining, or planning work, the inspection documents visible conditions, explains important context, and identifies appropriate next steps.</p>
      </PageHero>
      <ScopeAtlas sections={enabledInspectionScope} onScopeRequest={handleScopeRequest} />
      <section className="inspection-scenarios-section">
        <div className="container">
          <div className="section-intro section-intro-row"><div><p className="eyebrow eyebrow-dark">How observations become useful</p><h2>Connected thinking, shown through educational scenarios.</h2></div><p>These are illustrative learning examples—not customer stories, actual C&amp;G findings, or promises about a specific property.</p></div>
          <div className="inspection-scenario-grid">{educationalScenarios.map(([title, context, boundary], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{context}</p><div><strong>Honest boundary</strong><p>{boundary}</p></div></article>)}</div>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container"><div className="section-intro"><p className="eyebrow eyebrow-dark">Complete inspection scope</p><h2>System-by-system review and limitations.</h2></div><div className="scope-intro-note"><ShieldCheck size={22} aria-hidden="true" /><p>The list below describes areas commonly included in a residential inspection. It is not a promise that every item will be present, accessible, safe to operate, or included in every agreement.</p></div><DisclosureGroup items={items} className="disclosure-list scope-disclosures" firstOpen expandOnHash expandRequest={scopeRequest} /></div>
      </section>
      <section className="page-section page-section-deep"><div className="container page-split-grid"><div><p className="eyebrow">Scope honesty</p><h2>A useful inspection is honest about what could and could not be seen.</h2></div><div className="page-copy-light"><p>Access limitations and systems that were not operated should be documented. When specialist input is useful, the recommendation should identify the kind of evaluation needed without turning the inspection into a repair sale.</p><div className="related-inline-links"><InternalLink href="/resources/visible-and-accessible-conditions/" onNavigate={onNavigate}>Understand visible and accessible conditions</InternalLink><InternalLink href="/resources/preparing-for-a-home-inspection/" onNavigate={onNavigate}>Prepare for the inspection</InternalLink></div></div></div></section>
      <BookingCallout onNavigate={onNavigate} title="Schedule a clear, practical inspection." />
    </>
  );
}

const scopeAtlasGroups = [
  {
    id: "site-envelope",
    number: "01",
    title: "Site & envelope",
    copy: "Follow visible water, weather, access, and enclosure conditions toward the home.",
    sectionIds: ["site-and-drainage", "exterior", "roof", "garage"],
  },
  {
    id: "structure-access",
    number: "02",
    title: "Structure & access",
    copy: "Connect support, moisture, ventilation, and safe-access observations across concealed-adjacent spaces.",
    sectionIds: ["structure", "crawlspace", "attic", "fireplace"],
  },
  {
    id: "core-systems",
    number: "03",
    title: "Core systems",
    copy: "Review installed utility and comfort systems using normal controls when conditions permit.",
    sectionIds: ["electrical", "plumbing", "gas", "water-heater", "heating", "cooling"],
  },
  {
    id: "interior-living",
    number: "04",
    title: "Interior living areas",
    copy: "Document representative finishes, fixtures, openings, safeguards, and visible room conditions.",
    sectionIds: ["kitchen", "bathrooms", "laundry", "interior"],
  },
];

const scopeAtlasIconById = {
  "site-and-drainage": Trees,
  exterior: House,
  roof: Triangle,
  garage: Warehouse,
  structure: Layers,
  crawlspace: ScanLine,
  attic: Mountain,
  fireplace: Flame,
  electrical: Zap,
  plumbing: Droplets,
  gas: Gauge,
  "water-heater": ThermometerSun,
  heating: Flame,
  cooling: Snowflake,
  kitchen: CookingPot,
  bathrooms: Bath,
  laundry: WashingMachine,
  interior: BedDouble,
};

function ScopeAtlas({ sections, onScopeRequest }) {
  const sectionById = new Map(sections.map((section, index) => [section.id, { ...section, displayNumber: String(index + 1).padStart(2, "0") }]));
  const outsideScope = sectionById.get("outside-scope");

  return (
    <section className="scope-atlas-section" aria-labelledby="scope-atlas-title" data-scope-atlas>
      <div className="container">
        <div className="scope-atlas-header">
          <div>
            <p className="eyebrow eyebrow-dark">Visual inspection guide</p>
            <h2 id="scope-atlas-title">A careful look at the home’s major visible systems.</h2>
          </div>
          <p>Start with the overview, then choose any category to open its complete commonly reviewed list and property-specific limitations.</p>
        </div>

        <div className="scope-atlas-media" role="group" aria-label="Representative inspection imagery">
          <figure className="scope-atlas-figure scope-atlas-figure-wide">
            <EditorialPicture id="inspector-attic" sizes="(max-width: 760px) 100vw, 50vw" loading="lazy" />
            <figcaption><span>Structure in context</span><small>Editorial illustration</small></figcaption>
          </figure>
          <figure className="scope-atlas-figure">
            <EditorialPicture id="inspector-report" sizes="(max-width: 760px) 100vw, 50vw" loading="lazy" />
            <figcaption><span>Observations documented</span><small>Editorial illustration</small></figcaption>
          </figure>
        </div>
        <p className="scope-atlas-media-note">Representative editorial imagery; not C&amp;G client or project photography.</p>

        <div className="scope-atlas-groups">
          {scopeAtlasGroups.map((group) => {
            const groupSections = group.sectionIds.map((id) => sectionById.get(id)).filter(Boolean);
            return (
              <section className="scope-atlas-group" aria-labelledby={`scope-atlas-${group.id}`} key={group.id}>
                <header className="scope-atlas-group-header">
                  <span>{group.number}</span>
                  <h3 id={`scope-atlas-${group.id}`}>{group.title}</h3>
                  <p>{group.copy}</p>
                </header>
                <div className="scope-atlas-grid">
                  {groupSections.map((section) => {
                    const Icon = scopeAtlasIconById[section.id] || House;
                    return (
                      <a className="scope-atlas-card" href={`#${section.id}`} aria-label={`Open ${section.title} scope details`} onClick={(event) => onScopeRequest?.(event, section.id)} key={section.id}>
                        <span className="scope-atlas-card-top">
                          <span className="scope-atlas-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span>
                          <span className="scope-atlas-card-number">{section.displayNumber}</span>
                        </span>
                        <h4>{section.title}</h4>
                        <ul>{section.reviewed.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
                        <span className="scope-atlas-card-action">Open scope <ChevronRight size={15} aria-hidden="true" /></span>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {outsideScope ? (
          <a className="scope-atlas-boundary" href={`#${outsideScope.id}`} aria-label={`Open ${outsideScope.title} details`} onClick={(event) => onScopeRequest?.(event, outsideScope.id)}>
            <span className="scope-atlas-boundary-icon"><CircleOff size={26} strokeWidth={1.6} aria-hidden="true" /></span>
            <span><small>Scope boundary</small><strong>{outsideScope.title}</strong><span>{outsideScope.summary}</span></span>
            <span className="scope-atlas-boundary-action">Review boundaries <ChevronRight size={16} aria-hidden="true" /></span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

const aboutValues = [
  ["Observe carefully", "Follow visible evidence across connected systems."],
  ["Explain plainly", "Use direct language instead of alarm or jargon."],
  ["Document honestly", "State limitations instead of pretending concealed conditions were inspected."],
  ["Stay independent", "Do not turn inspection conclusions into prohibited repair work."],
  ["Remain available for questions", "Help the client understand the report without making the decision for them."],
];

const aboutExpectations = [
  ["01", "Confirm the scope", "Property details, access, timing, price, the agreement, and any approved optional service are clarified before the appointment."],
  ["02", "Inspect what is visible and accessible", "The review follows observable conditions across connected systems while unsafe, obstructed, concealed, or out-of-scope areas remain clearly limited."],
  ["03", "Make the report useful", "Findings are written in plain language, supported with photographs where useful, and separated into meaningful concerns, maintenance observations, and qualified follow-up."],
  ["04", "Review the next questions", "The client can ask about report language and visible context without being told what decision to make or being steered into repair work."],
];

function AboutPage({ route, onNavigate }) {
  const biography = provisionalBusinessDetails.biography;
  const showProvisional = OWNER_REVIEW_STAGING_VISIBLE;
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="About Clarence" title="Experience matters most when it can be explained clearly."><p className="page-hero-lede">C&amp;G is built around a straightforward idea: the client should leave the inspection with more clarity, not more confusion.</p></PageHero>
      <section className="process-section page-process-section">
        <div className="container process-grid">
          <div className="process-lede">
            <p className="eyebrow eyebrow-dark">{showProvisional ? "Provisional biography" : "About Clarence"}</p>
            <h2>A construction-informed perspective, explained calmly.</h2>
            {showProvisional ? <p>{biography.full}</p> : null}
            <p>That construction-informed perspective shapes both the on-site conversation and the report so clients can understand what was visible, what was limited, and what questions remain.</p>
            {showProvisional ? <p className="provisional-note">This biography is marked provisional_owner_review until Clarence approves final wording. No years of experience, employers, degrees, or certifications are asserted here.</p> : null}
            <div className="about-scope-actions">
              <InternalLink className="button button-dark" href="/services/" onNavigate={onNavigate}>See What the Inspection Covers <ArrowRight size={17} aria-hidden="true" /></InternalLink>
              <InternalLink className="text-link text-link-dark" href="/ethics/" onNavigate={onNavigate}>Read the independence policy <ArrowRight size={15} aria-hidden="true" /></InternalLink>
            </div>
          </div>
          <div className="about-philosophy">
            <blockquote>“The inspector's job is not to tell a client whether to buy a home. It is to document visible conditions, identify material concerns, explain uncertainty, and help the client ask the next right question.”</blockquote>
            {showProvisional ? (
              <>
                <p>{biography.short}</p>
                <p><span className="provisional-label">Credentials</span> {claims.internachiCertification.draftCopy}</p>
                <p><span className="provisional-label">Coverage</span> {claims.generalLiabilityInsurance.draftCopy}</p>
              </>
            ) : (
              <p>Credential, membership, and insurance claims are published only after owner confirmation. Until then, this page focuses on how C&amp;G explains visible conditions and independence boundaries.</p>
            )}
          </div>
        </div>
      </section>
      <section className="experience-section about-expectations-section" aria-labelledby="about-expectations-title">
        <div className="container about-expectations-grid">
          <div className="about-expectations-copy">
            <p className="eyebrow">What clients can expect</p>
            <h2 id="about-expectations-title">Clarity at each part of the inspection.</h2>
            <p>The useful result is not a longer list. It is a documented path from the visible condition to the next sensible question.</p>
          </div>
          <ol className="about-expectations-list">
            {aboutExpectations.map(([number, title, copy]) => <li key={title}><span className="about-expectations-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}
          </ol>
        </div>
      </section>
      <section className="page-section page-section-cream"><div className="container values-grid"><div><p className="eyebrow eyebrow-dark">What guides the work</p><h2>Careful, plain-spoken, and independent.</h2></div><div className="values-list">{aboutValues.map(([title, copy]) => <div key={title}><ShieldCheck size={19} aria-hidden="true" /><span><strong>{title}</strong><small>{copy}</small></span></div>)}</div></div></section>
      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function AreasPage({ route, onNavigate }) {
  const areas = approvedServiceAreas("Inspector");
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Areas we serve" title="Home inspections across Los Angeles County and Riverside County.">
        <p className="page-hero-lede">{serviceAreaQualification}</p>
      </PageHero>
      <section className="experience-section areas-main-section">
        <div className="container experience-grid">
          <div>
            <p className="eyebrow">Address-first confirmation</p>
            <h2>Share the full property address before relying on an appointment.</h2>
          </div>
          <div className="experience-copy">
            <p>C&amp;G confirms coverage, travel, scope, and availability for each request. The counties below are owner-confirmed for publication; individual properties are still reviewed one address at a time.</p>
          </div>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container home-area-card-grid">
          {areas.map((area) => (
            <article className="home-area-card" key={area.id}>
              <p className="eyebrow eyebrow-dark">Verified county</p>
              <h2>{area.label}</h2>
              <p>{area.description}</p>
              <ul className="community-chip-list" aria-label={`Representative communities in ${area.label}`}>
                {area.communities.map((city) => <li key={city}>{city}</li>)}
              </ul>
              <div className="home-area-card-actions">
                <InternalLink className="button button-dark" href={`/areas/${area.id}/`} onNavigate={onNavigate}>Open county page</InternalLink>
                <a href={area.mapsUrl} target="_blank" rel="noreferrer">View area on Google Maps</a>
                <a href={contractorUrl}>Explore contracting in this county</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container page-split-grid">
          <div><p className="eyebrow eyebrow-dark">What to send</p><h2>One address, a little context, and your timing.</h2></div>
          <div className="values-list">
            <div><MapItem number="01" title="Full property address" copy="Coverage and travel are confirmed from the actual location." /></div>
            <div><MapItem number="02" title="Property and inspection type" copy="Scope can vary with the property and request." /></div>
            <div><MapItem number="03" title="Preferred timing" copy="A request is not confirmed until C&G accepts it." /></div>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow="Ask about your property" title="Start with the complete address." />
    </>
  );
}

function ServiceAreaDetailPage({ route, onNavigate }) {
  const area = route.serviceArea;
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Verified inspection area" title={area.pageTitle}>
        <p className="page-hero-lede">{area.pageContent.introduction}</p>
      </PageHero>
      <section className="experience-section">
        <div className="container experience-grid">
          <div><p className="eyebrow">Property context</p><h2>Plan from the actual address—not a county-wide assumption.</h2></div>
          <div className="experience-copy">
            <p>{area.pageContent.propertyContext}</p>
            <p>{area.pageContent.accessAndTiming}</p>
            <p>{area.qualification || serviceAreaQualification}</p>
          </div>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div><p className="eyebrow eyebrow-dark">Representative communities</p><h2>Cities often included in planning conversations.</h2></div>
            <p>These communities help describe the county. They are not separate offices and do not guarantee automatic acceptance of every property.</p>
          </div>
          <ul className="community-chip-list community-chip-list-large" aria-label={`Communities in ${area.label}`}>
            {(area.communities || []).map((city) => <li key={city}>{city}</li>)}
          </ul>
          <p><a href={area.mapsUrl} target="_blank" rel="noreferrer">View area on Google Maps</a></p>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container page-split-grid">
          <div><p className="eyebrow eyebrow-dark">Before requesting a date</p><h2>Have the details that affect scope and travel ready.</h2></div>
          <ul className="ethics-list">{area.pageContent.planningChecklist.map((item) => <li key={item}><Check size={18} aria-hidden="true" /> {item}</li>)}</ul>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container sister-grid">
          <div className="sister-copy">
            <p className="eyebrow eyebrow-dark">Next step</p>
            <h2>Request an inspection or review contracting separately.</h2>
            <p>{separationPolicy.notice}</p>
            <div className="hero-actions">
              <InspectionPrimaryAction onNavigate={onNavigate} />
              <a className="text-link text-link-dark" href={`${contractorUrl}areas/${area.id}/`}>Contracting in {area.label}</a>
            </div>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow={`Ask about a property in ${area.label}`} title="Start with the full address and inspection purpose." />
    </>
  );
}

function MapItem({ number, title, copy }) {
  return <><span className="map-item-number">{number}</span><span><strong>{title}</strong><small>{copy}</small></span></>;
}

function SampleReportPage({ route, onNavigate }) {
  const report = route.sampleReport;
  const isPlaceholder = Boolean(report?.provisional);
  return (
    <>
      <PageHero
        route={route}
        onNavigate={onNavigate}
        eyebrow={isPlaceholder ? "Owner-review placeholder" : "Owner-approved redacted example"}
        title={report.title}
      >
        <p className="page-hero-lede">
          {isPlaceholder
            ? report.copy
            : "This sample shows one approved report format after personal, property, access, and transaction details were reviewed for redaction. A real report reflects the agreement, property, access, and conditions observed on the inspection date."}
        </p>
      </PageHero>
      <section className="page-section page-section-cream">
        <div className="container page-split-grid">
          <div><p className="eyebrow eyebrow-dark">What to look for</p><h2>Organization, context, photographs, limitations, and next-step language.</h2></div>
          <div>
            {isPlaceholder ? (
              <>
                <p className="page-copy">No fabricated inspection report is published here. When a real redacted PDF is approved, this page will link to the file and record its digest, page count, and publication permissions in the registry.</p>
                <ul className="ethics-list">
                  <li><Check size={18} aria-hidden="true" /> Status: provisional_owner_review</li>
                  <li><Check size={18} aria-hidden="true" /> Production navigation stays off until a PDF is approved</li>
                  <li><Check size={18} aria-hidden="true" /> Client and property identifiers must be removed before publication</li>
                </ul>
              </>
            ) : (
              <>
                <p className="page-copy">The example is educational. It does not promise that every report will have the same length, findings, photographs, systems, or recommendations.</p>
                <ul className="ethics-list">
                  <li><Check size={18} aria-hidden="true" /> {report.pageCount} redacted pages</li>
                  <li><Check size={18} aria-hidden="true" /> Report template reference: {report.reportTemplateVersion}</li>
                  <li><Check size={18} aria-hidden="true" /> Redaction and publication approval recorded in the site registry</li>
                </ul>
                <a className="button button-dark" href={report.publicPath} target="_blank" rel="noreferrer">Open the redacted PDF <ArrowRight size={16} aria-hidden="true" /></a>
              </>
            )}
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function FaqPage({ route, onNavigate }) {
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Home inspection FAQ" title="Straight answers about scope, access, reports, and follow-up."><p className="page-hero-lede">These answers describe the safe baseline. The signed agreement and property-specific conditions control the inspection.</p></PageHero>
      <section className="faq-section faq-page-section"><div className="container faq-content-grid"><aside><p className="eyebrow eyebrow-dark">Need property-specific context?</p><h2>Ask C&amp;G about the address and the decision in front of you.</h2><InternalLink className="button button-dark" href="/contact/" onNavigate={onNavigate}>Contact C&amp;G <ArrowRight size={17} aria-hidden="true" /></InternalLink></aside><div className="faq-groups">{inspectorFaqGroups.map((group) => <section key={group.title}><h2>{group.title}</h2><DisclosureGroup items={group.items} firstOpen={group.title === inspectorFaqGroups[0].title} /></section>)}</div></div></section>
      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function ResourcesPage({ route, onNavigate }) {
  return (
    <div className="resources-page">
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Home inspection resources" title="Better questions before, during, and after the inspection."><p className="page-hero-lede">These educational guides do not replace the property-specific agreement, complete report, or advice from the appropriate licensed or qualified professional.</p></PageHero>
      {resourceGroups.map((group, groupIndex) => (
        <section className={groupIndex % 2 ? "page-section resource-group-section" : "page-section page-section-cream resource-group-section"} key={group.category}>
          <div className="container"><div className="section-intro section-intro-row"><div><p className="eyebrow eyebrow-dark">{String(groupIndex + 1).padStart(2, "0")}</p><h2>{group.category}</h2></div><p>Choose the guide that matches the next question in your inspection process.</p></div><div className="resource-article-grid">{group.resources.map((resource) => <article className="resource-article-card" key={resource.slug}><BookOpen size={22} aria-hidden="true" /><p className="resource-reading-time">{readingMinutes(resource)} min read</p><h3>{resource.title}</h3><p>{resource.summary}</p><InternalLink href={`/resources/${resource.slug}/`} onNavigate={onNavigate}>Read {resource.title} <ArrowRight size={15} aria-hidden="true" /></InternalLink></article>)}</div></div>
        </section>
      ))}
      <BookingCallout onNavigate={onNavigate} eyebrow="Still deciding?" title="Call C&G and talk through the property first." />
    </div>
  );
}

function ResourceArticlePage({ route, onNavigate }) {
  const resource = resourceBySlug.get(route.slug);
  const related = resource.related.map((slug) => resourceBySlug.get(slug)).filter(Boolean);
  return (
    <article className="article-page">
      <PageHero route={route} onNavigate={onNavigate} eyebrow={resource.category} title={resource.title}><p className="page-hero-lede">{resource.intro}</p><p className="article-byline">By {resource.author} · {readingMinutes(resource)} minute read</p></PageHero>
      <div className="container article-layout">
        <aside className="article-aside"><strong>In this guide</strong><ol>{resource.sections.map((section) => <li key={section.heading}><a href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>{section.heading}</a></li>)}</ol>{resource.checklist ? <button className="button button-dark" type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print checklist</button> : null}</aside>
        <div className="article-content printable-resource">
          {resource.sections.map((section) => { const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); return <section id={id} key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>; })}
          {resource.checklist ? <section className="article-checklist"><h2>Printable checklist</h2><ul>{resource.checklist.map((item) => <li key={item}><Check size={17} aria-hidden="true" /> {item}</li>)}</ul></section> : null}
          <section className="article-takeaway"><h2>Takeaway</h2><p>{resource.takeaway}</p></section>
          <p className="article-disclaimer"><strong>Educational-use notice:</strong> {resource.disclaimer}</p>
          <InternalLink className="button button-gold" href={resource.cta.path} onNavigate={onNavigate}>{resource.cta.label} <ArrowRight size={16} aria-hidden="true" /></InternalLink>
        </div>
      </div>
      <section className="related-resources"><div className="container"><p className="eyebrow eyebrow-dark">Related resources</p><div className="related-resource-grid">{related.map((item) => <InternalLink key={item.slug} href={`/resources/${item.slug}/`} onNavigate={onNavigate}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight size={16} aria-hidden="true" /></InternalLink>)}</div></div></section>
    </article>
  );
}

const contactPreparationItems = [
  ["01", "Property address", "Use the full address so travel and property context can be reviewed."],
  ["02", "Property basics", "Share the residential property type and approximate size when known."],
  ["03", "Inspection purpose", "Tell C&G whether this supports a purchase, sale, or homeowner decision."],
  ["04", "Timing", "Include preferred dates and any true transaction or access deadline."],
];

const focusInspectionRequest = () => {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => document.getElementById("inspection-request")?.focus({ preventScroll: true }));
};

function ContactPage({ route, onNavigate }) {
  return (
    <>
      <PageHero
        route={route}
        onNavigate={onNavigate}
        eyebrow="Contact and scheduling"
        title="Start with the property and the decision in front of you."
        compact
        actions={<><a className="button button-gold" href="#inspection-request" onClick={focusInspectionRequest}>Start request <ArrowRight size={17} aria-hidden="true" /></a><a className="button button-outline-light" href={business.inspection.phoneHref}><Phone size={17} aria-hidden="true" /> Call C&amp;G</a></>}
      >
        <p className="page-hero-lede">A few details make it easier to confirm scope, price, travel, and availability. A submitted request is not an appointment until C&amp;G confirms it.</p>
      </PageHero>
      <section className="page-section page-section-cream contact-page-section">
        <div className="container contact-form-layout">
          <aside className="contact-form-intro" aria-labelledby="contact-preflight-title">
            <div>
              <p className="eyebrow eyebrow-dark">Before you start</p>
              <h2 id="contact-preflight-title">Have four details ready.</h2>
              <p>These details help C&amp;G review the request before discussing availability or price.</p>
              <div className="contact-direct"><a href={business.inspection.phoneHref}><Phone size={18} aria-hidden="true" /> {business.inspection.phoneDisplay}</a><a href={`mailto:${business.inspection.email}`}>{business.inspection.email}</a></div>
            </div>
            <ol className="contact-preflight-list">{contactPreparationItems.map(([number, title, description]) => <li key={title}><span>{number}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol>
          </aside>
          <ContactRequestForm />
        </div>
      </section>
    </>
  );
}

function EthicsPage({ route, onNavigate }) {
  const points = [
    "Inspection conclusions are based on observed conditions and the inspection agreement.",
    "C&G does not tell the client whether to buy, sell, or set a property value.",
    "Referral compensation, inducements, and outcome-contingent fees are not part of the inspection service.",
    "Report limitations are stated rather than concealed.",
    "Specialist recommendations identify the expertise needed; they do not guarantee a provider or result.",
    "Client and report information is not used to bypass the 12-month separation.",
  ];
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Inspection ethics and independence" title="The report should serve the client—not a repair sale."><p className="page-hero-lede">C&amp;G's inspection work is intended to provide an independent account of visible and accessible conditions.</p></PageHero>
      <section className="page-section page-section-cream"><div className="container page-split-grid"><div><p className="eyebrow eyebrow-dark">Operating policy</p><h2>Independent conclusions and visible limitations.</h2></div><div><p className="page-copy">The inspection fee and conclusions are not contingent on the findings, the close of escrow, or a later construction project.</p><ul className="ethics-list">{points.map((point) => <li key={point}><ShieldCheck size={18} aria-hidden="true" /> {point}</li>)}</ul></div></div></section>
      <section className="page-section page-section-deep"><div className="container page-split-grid"><div><p className="eyebrow">12-month separation</p><h2>Inspection information is not a contracting lead.</h2></div><div className="page-copy-light"><p>{separationPolicy.notice}</p><p>This page explains C&amp;G's operating policy in plain language. The signed inspection agreement controls the service, and applicable law controls where it differs from this summary.</p></div></div></section>
      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function PrivacyPage({ route, onNavigate }) {
  const sections = [
    ["Information you choose to provide", inspectionSecureFormEnabled ? <>The inspection form sends the details you choose to provide to the owner-approved {inspectionFormTransport.provider} processor. Review the processor’s <a href={inspectionFormTransport.publicConfig.privacyUrl} rel="noreferrer" target="_blank">privacy policy</a>. The request is not an appointment until C&amp;G confirms it.</> : "The site receives information only when you choose a phone, email, or prepared-email contact path. The inspection form prepares a message in your email application; the website does not receive or store the form values."],
    ["Technical information", "GitHub Pages and network providers may receive ordinary request information such as IP address, browser details, requested URL, and timestamps. Adopted website fonts are delivered as same-origin static files."],
    ["Private site search", "The search feature uses a static Pagefind index delivered with this website. Search terms are processed in the visitor's browser and are not sent to an analytics, advertising, or hosted-search provider."],
    ["How request information is used", "Information sent to C&G is used to understand and respond to the inspection request, confirm scope, travel, timing, price, and access, and keep the related business record."],
    ["Inspection reports and client confidentiality", inspectionUploadPolicy ? <>Only authorized supporting files that meet the published type and {Math.floor(inspectionUploadPolicy.maxBytes / 1_000_000)} MB size limit may use the approved protected-upload path. An uploaded file transfers before the request is submitted and remains subject to the provider’s approved retention, deletion, and orphan-file policy. Review the upload provider’s <a href={inspectionUploadPolicy.privacyUrl} rel="noreferrer" target="_blank">privacy policy</a>. Do not upload access codes, financial records, offer documents, government IDs, payment cards, claim files, or unredacted reports.</> : "Do not send full reports, access codes, offer documents, financial information, or other sensitive material through the basic website form. Report sharing follows the inspection agreement and client authorization."],
    ["Inspection and contracting separation", "Inspection-client information and report findings are not used to solicit contracting work. C&G Contracting Services cannot offer or perform repairs on a property C&G inspected during the previous 12 months."],
    ["Service providers actually used", inspectionSecureFormEnabled ? <>The public site and fonts are delivered through GitHub Pages. Inspection requests use the owner-approved {inspectionFormTransport.provider} processor and its published <a href={inspectionFormTransport.publicConfig.privacyUrl} rel="noreferrer" target="_blank">privacy policy</a>.</> : "The public site and locally hosted fonts are delivered through GitHub Pages. The prepared-email path relies on the visitor's chosen email application and provider."],
    ["Retention", inspectionSecureFormEnabled ? `The approved processor and C&G handle submitted details under the reviewed processor, privacy, and retention configuration. Contact C&G for a request-specific records question.` : "The static website does not retain form entries. If you send an email or call C&G, the resulting communication may be retained as reasonably needed for the request, business records, legal obligations, and dispute prevention."],
    ["Your choices", "You may contact C&G to ask about a communication you sent or to request an appropriate correction or deletion, subject to records C&G must or reasonably needs to retain."],
    ["Updates and contact", `This policy is effective July 22, 2026. Material changes should be reflected on this page. Questions may be sent to ${business.inspection.email}.`],
  ];
  return (
    <>
      <PageHero route={route} onNavigate={onNavigate} eyebrow="Privacy" title="A plain-language policy for the site that actually exists."><p className="page-hero-lede">No analytics provider, advertising tracker, user account, or online payment is enabled. Form and upload disclosures change only when their approval registries are enabled.</p></PageHero>
      <section className="page-section page-section-cream"><div className="container policy-layout">{sections.map(([title, copy], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{copy}</p></div></section>)}</div></section>
    </>
  );
}

function NotFoundPage({ route, onNavigate }) {
  return <><PageHero route={route} onNavigate={onNavigate} eyebrow="Page not found" title="Let’s get you back to clear answers." actions={<InternalLink className="button button-gold" href="/" onNavigate={onNavigate}>Return to Home <ArrowRight size={17} aria-hidden="true" /></InternalLink>}><p className="page-hero-lede">That page is not available. The inspection, resources, ethics, and contact paths are still here.</p></PageHero><BookingCallout onNavigate={onNavigate} /></>;
}

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><BrandMark onNavigate={onNavigate} /><p>Clear, construction-informed home inspection guidance. Service coverage is confirmed from the full property address.</p></div>
        <div className="footer-links"><span className="footer-label">Explore</span>{inspectorNavigation.slice(1, 6).map((route) => <InternalLink key={route.path} href={route.path} onNavigate={onNavigate}>{route.label}</InternalLink>)}{inspectorFooterRoutes.map((route) => <InternalLink key={route.path} href={route.path} onNavigate={onNavigate}>{route.label}</InternalLink>)}</div>
        <div className="footer-links"><span className="footer-label">Contact</span><a href={business.inspection.phoneHref}>{business.inspection.phoneDisplay}</a><a href={`mailto:${business.inspection.email}`}>{business.inspection.email}</a><a href={propertyServicesUrl}>Choose a C&amp;G property service</a><a href={contractorUrl}><Hammer size={14} aria-hidden="true" /> Separate contracting service</a></div>
      </div>
      <div className="container footer-disclosures"><p>{separationPolicy.notice}</p><p>People and worksite images are editorial illustrations; they do not depict employees, customers, or completed C&amp;G client projects.</p></div>
      <div className="container footer-bottom"><span>© 2026 C&amp;G Certified Home Inspector</span><span>Independent inspection guidance</span></div>
    </footer>
  );
}

function MobileQuickActions({ onNavigate, currentRoute }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 260);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (!visible) return null;
  const requestAction = currentRoute.key === "contact"
    ? <a className="button button-gold" href="#inspection-request" onClick={focusInspectionRequest}><ArrowRight size={15} aria-hidden="true" /> Start request</a>
    : <InspectionPrimaryAction className="button button-gold" onNavigate={onNavigate} short />;
  return <div className="mobile-quick-actions" aria-label="Quick contact actions">{requestAction}<a className="button button-dark" href={business.inspection.phoneHref}><Phone size={15} aria-hidden="true" /> Call</a></div>;
}

export function App({ initialPath = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => normalizeRoutePath(initialPath || (typeof window !== "undefined" ? window.location.pathname : "/")));
  const route = findInspectorRoute(currentPath) || inspectorNotFoundRoute;

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizeRoutePath(window.location.pathname));
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => document.getElementById("page-content")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [currentPath]);

  const onNavigate = (event, href) => {
    if (!href.startsWith("/")) return;
    event.preventDefault();
    window.history.pushState({}, "", pageUrl(href));
    setCurrentPath(normalizeRoutePath(href));
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const props = { route, onNavigate };
  let page;
  if (route.article) page = <ResourceArticlePage {...props} />;
  else if (route.serviceArea) page = <ServiceAreaDetailPage {...props} />;
  else if (route.sampleReport) page = <SampleReportPage {...props} />;
  else page = {
    home: <HomePage {...props} />,
    services: <ServicesPage {...props} />,
    about: <AboutPage {...props} />,
    areas: <AreasPage {...props} />,
    faq: <FaqPage {...props} />,
    resources: <ResourcesPage {...props} />,
    contact: <ContactPage {...props} />,
    ethics: <EthicsPage {...props} />,
    privacy: <PrivacyPage {...props} />,
    notFound: <NotFoundPage {...props} />,
  }[route.key] || <NotFoundPage route={inspectorNotFoundRoute} onNavigate={onNavigate} />;

  const canonicalUrl = route.path ? `${siteOrigin}${route.path}` : `${siteOrigin}/404.html`;
  return (
    <div className="site-shell">
      <Seo route={route} canonicalUrl={canonicalUrl} siteOrigin={siteOrigin} />
      <a className="skip-link" href="#page-content">Skip to content</a>
      <ServiceSwitcher onNavigate={onNavigate} />
      <SiteHeader currentRoute={route} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} onNavigate={onNavigate} onOpenSearch={() => setSearchOpen(true)} />
      <main id="page-content" tabIndex="-1" data-pagefind-body>{page}</main>
      <SiteFooter onNavigate={onNavigate} />
      <MobileQuickActions onNavigate={onNavigate} currentRoute={route} />
      <SiteSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export { enabledInspectorRoutes };
