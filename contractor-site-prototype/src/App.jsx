import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  DoorOpen,
  ExternalLink,
  FileText,
  Hammer,
  Mail,
  MapPin,
  Menu,
  Phone,
  Ruler,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";

const phoneNumber = "(310) 505-6581";
const emailAddress = "clarencegloss@gmail.com";
const licenseNumber = "987643";
const licenseUrl = `https://www.cslb.ca.gov/${licenseNumber}`;
const inspectionUrl = "https://sadmanbob.github.io/inspections/";
const appBase = import.meta.env.BASE_URL;
const assetUrl = (path) => `${appBase}${path.replace(/^\//, "")}`;
const pageUrl = (path) => path === "/" ? appBase : `${appBase}${path.replace(/^\//, "")}`;

const navItems = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Process", "/process"],
  ["About", "/about"],
  ["Request Estimate", "/estimate"],
];

const pageByPath = {
  "/": "home",
  "/services": "services",
  "/process": "process",
  "/about": "about",
  "/estimate": "estimate",
};

const pageMeta = {
  home: {
    title: "C&G Contracting Services | Practical repairs. Built to last.",
    description: "Residential repair and improvement work with clear scopes, dependable communication, and respect for your home.",
  },
  services: {
    title: "Residential Repair Services | C&G Contracting Services",
    description: "Explore residential repair, finish work, doors, trim, punch-list coordination, and property maintenance services from C&G.",
  },
  process: {
    title: "Our Process | C&G Contracting Services",
    description: "See how C&G moves from an initial project request to a clear scope, written estimate, scheduling, and final walkthrough.",
  },
  about: {
    title: "About C&G Contracting Services",
    description: "Learn about C&G’s practical, construction-informed approach and verify California contractor license information.",
  },
  estimate: {
    title: "Request an Estimate | C&G Contracting Services",
    description: "Share your residential repair or improvement project with C&G Contracting Services.",
  },
  notFound: {
    title: "Page Not Found | C&G Contracting Services",
    description: "Return to C&G Contracting Services for residential repair and improvement information.",
  },
};

const serviceRows = [
  {
    number: "01",
    title: "Repair & finish work",
    summary: "Construction-informed repair scopes that bring damaged, incomplete, or worn areas back to a clean finish.",
    details: ["Interior repair planning", "Finish carpentry", "Multi-item correction lists"],
    icon: Wrench,
  },
  {
    number: "02",
    title: "Doors, trim & hardware",
    summary: "Careful fit, alignment, adjustment, and replacement work for the details you use every day.",
    details: ["Interior doors and jambs", "Baseboard and casing", "Hardware adjustment and replacement"],
    icon: DoorOpen,
  },
  {
    number: "03",
    title: "Drywall & punch lists",
    summary: "Organized correction work for visible damage, incomplete finishes, and multi-trade residential punch lists.",
    details: ["Drywall repair coordination", "Move-in and move-out corrections", "Final-detail punch lists"],
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "Property maintenance",
    summary: "Practical maintenance projects for homeowners and property teams who need a clear, prioritized scope.",
    details: ["Recurring repair lists", "Turnover preparation", "General building maintenance"],
    icon: Hammer,
  },
];

const processSteps = [
  ["01", "Share your project", "Send the basics, photos, or a repair list. You do not need to diagnose the problem before reaching out."],
  ["02", "Review the scope", "C&G follows up to clarify access, materials, priorities, and whether the project fits the contractor’s license and schedule."],
  ["03", "Approve the estimate", "Review the written scope and project assumptions before scheduling begins."],
  ["04", "Schedule and complete", "Coordinate access, complete the agreed work, and finish with a clear walkthrough."],
];

function routeKey(pathname = window.location.pathname) {
  const basePath = appBase.replace(/\/+$/, "");
  const relativePath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const cleanPath = relativePath.replace(/\/+$/, "") || "/";
  return pageByPath[cleanPath] || "notFound";
}

function Brand({ onNavigate }) {
  return (
    <a className="brand" href={pageUrl("/")} onClick={(event) => onNavigate(event, "/")} aria-label="C&G Contracting Services home">
      <span className="brand-monogram" aria-hidden="true">C&amp;G</span>
      <span className="brand-name">Contracting Services</span>
    </a>
  );
}

function InternalLink({ href, onNavigate, children, className = "" }) {
  return <a className={className} href={pageUrl(href)} onClick={(event) => onNavigate(event, href)}>{children}</a>;
}

function SiteHeader({ currentPage, mobileMenuOpen, setMobileMenuOpen, onNavigate }) {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand onNavigate={onNavigate} />
          <nav className={`site-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            {navItems.map(([label, href]) => (
              <a
                href={pageUrl(href)}
                className={currentPage === routeKey(pageUrl(href)) ? "is-active" : ""}
                aria-current={currentPage === routeKey(pageUrl(href)) ? "page" : undefined}
                key={href}
                onClick={(event) => {
                  onNavigate(event, href);
                  setMobileMenuOpen(false);
                }}
              >
                {label}
              </a>
            ))}
            <a className="mobile-call" href="tel:+13105056581"><Phone size={15} /> Call {phoneNumber}</a>
          </nav>
          <div className="header-actions">
            <a className="header-phone" href="tel:+13105056581"><Phone size={15} /> {phoneNumber}</a>
            <InternalLink className="button button-copper button-small" href="/estimate" onNavigate={onNavigate}>Request Estimate</InternalLink>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      <div className="license-line">
        <div className="container license-line-inner">
          <span>California B — General Building</span>
          <a href={licenseUrl} target="_blank" rel="noreferrer">CSLB #{licenseNumber} <ExternalLink size={12} /></a>
        </div>
      </div>
    </>
  );
}

function PageHero({ title, lede, children }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <h1>{title}</h1>
        <p>{lede}</p>
        {children ? <div className="page-hero-actions">{children}</div> : null}
      </div>
    </section>
  );
}

function ServiceList({ detailed = false }) {
  return (
    <div className={`service-rows ${detailed ? "service-rows-detailed" : ""}`}>
      {serviceRows.map(({ number, title, summary, details, icon: Icon }) => (
        <article className="service-row" key={number}>
          <span className="service-number">{number}</span>
          <div className="service-icon"><Icon size={24} strokeWidth={1.45} /></div>
          <div className="service-copy">
            <h3>{title}</h3>
            <p>{summary}</p>
            {detailed ? (
              <ul>{details.map((detail) => <li key={detail}><Check size={15} /> {detail}</li>)}</ul>
            ) : null}
          </div>
          <ChevronRight size={20} className="service-arrow" />
        </article>
      ))}
    </div>
  );
}

function ProcessList({ compact = false }) {
  return (
    <ol className={`process-list ${compact ? "process-list-compact" : ""}`}>
      {processSteps.map(([number, title, description]) => (
        <li key={number}>
          <span className="process-number">{number}</span>
          <div><h3>{title}</h3><p>{description}</p></div>
        </li>
      ))}
    </ol>
  );
}

function EstimateCta({ onNavigate }) {
  return (
    <section className="estimate-cta">
      <div className="container estimate-cta-inner">
        <div><h2>Tell us what needs attention.</h2><p>Start with the project as you understand it. C&amp;G will help clarify the scope.</p></div>
        <div className="cta-actions">
          <InternalLink className="button button-copper" href="/estimate" onNavigate={onNavigate}>Request an Estimate <ArrowRight size={17} /></InternalLink>
          <a className="button button-outline" href="tel:+13105056581"><Phone size={17} /> Call {phoneNumber}</a>
        </div>
      </div>
    </section>
  );
}

function SeparationNotice() {
  return (
    <section className="separation-notice" aria-labelledby="service-separation-title">
      <div className="container separation-inner">
        <ShieldCheck size={22} />
        <div>
          <h2 id="service-separation-title">Inspection and construction are separate services.</h2>
          <p>Home inspection is a separate C&amp;G service. C&amp;G Contracting Services does not offer or perform repairs on a property for which C&amp;G prepared a home inspection report during the previous 12 months.</p>
        </div>
        <a href={inspectionUrl}>Visit the inspection site <ArrowRight size={15} /></a>
      </div>
    </section>
  );
}

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Practical repairs.<br /><em>Built to last.</em></h1>
            <p>Residential repair and improvement work with clear scopes, dependable communication, and respect for your home.</p>
            <div className="hero-actions">
              <InternalLink className="button button-copper" href="/estimate" onNavigate={onNavigate}>Request an Estimate <ArrowRight size={17} /></InternalLink>
              <InternalLink className="text-link" href="/services" onNavigate={onNavigate}>Explore Services <ChevronRight size={16} /></InternalLink>
            </div>
          </div>
          <figure className="hero-image">
            <img src={assetUrl("assets/contractor-hero.jpg")} alt="Contractor carefully measuring interior wood trim" width="1536" height="1024" fetchPriority="high" decoding="async" />
            <figcaption>Careful scope. Clean finish. Clear communication.</figcaption>
          </figure>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div><span>01 / Services</span><h2>Focused work for the details that make a home feel finished.</h2></div>
            <p>Every request starts with project fit. C&amp;G confirms the scope, trade needs, and expectations before work is scheduled.</p>
          </div>
          <ServiceList />
          <InternalLink className="section-link" href="/services" onNavigate={onNavigate}>View service details <ArrowRight size={16} /></InternalLink>
        </div>
      </section>

      <section className="process-section">
        <div className="container process-grid">
          <div className="process-heading"><span>02 / Process</span><h2>A clear path from scope to finish.</h2><p>No mystery handoffs. The work starts with a written understanding of what is—and is not—included.</p></div>
          <ProcessList compact />
        </div>
      </section>

      <section className="about-preview">
        <div className="container about-preview-grid">
          <div className="about-image"><img src={assetUrl("assets/project-planning.jpg")} alt="Construction professionals reviewing a residential project plan" width="1536" height="1024" loading="lazy" decoding="async" /></div>
          <div className="about-copy">
            <span>03 / About</span>
            <h2>Practical experience. Straight answers.</h2>
            <p>C&amp;G approaches residential repair work with a construction-informed eye, careful communication, and respect for the property.</p>
            <div className="credential-line"><ShieldCheck size={20} /><div><strong>California General Building contractor</strong><a href={licenseUrl} target="_blank" rel="noreferrer">Verify CSLB #{licenseNumber} <ExternalLink size={13} /></a></div></div>
            <InternalLink className="text-link text-link-dark" href="/about" onNavigate={onNavigate}>Learn about C&amp;G <ChevronRight size={16} /></InternalLink>
          </div>
        </div>
      </section>

      <EstimateCta onNavigate={onNavigate} />
      <SeparationNotice />
    </>
  );
}

function ServicesPage({ onNavigate }) {
  return (
    <>
      <PageHero title="Residential work with a clear, practical scope." lede="From finish details to organized repair lists, C&G starts by defining the work carefully and confirming that the project fits the contractor’s license and capabilities.">
        <InternalLink className="button button-copper" href="/estimate" onNavigate={onNavigate}>Share your project <ArrowRight size={17} /></InternalLink>
      </PageHero>
      <section className="services-section services-page-section">
        <div className="container">
          <div className="section-heading split-heading"><div><span>Service categories</span><h2>Start with what needs attention.</h2></div><p>A service category is a starting point, not an automatic promise of scope. C&amp;G reviews the project details before accepting work.</p></div>
          <ServiceList detailed />
        </div>
      </section>
      <section className="scope-section">
        <div className="container scope-grid">
          <div><span>Project fit</span><h2>The right scope matters as much as the finish.</h2></div>
          <div className="scope-copy">
            <p>California General Building work can involve multiple building trades. Requests that are specialty-only, require engineering or design services, or fall outside the accepted scope may need another appropriately licensed professional.</p>
            <ul>
              <li><Check size={16} /> Written scope before scheduling</li>
              <li><Check size={16} /> Materials and access clarified up front</li>
              <li><Check size={16} /> Permit and specialty-trade needs identified when applicable</li>
              <li><Check size={16} /> Changes documented before extra work begins</li>
            </ul>
          </div>
        </div>
      </section>
      <EstimateCta onNavigate={onNavigate} />
      <SeparationNotice />
    </>
  );
}

function ProcessPage({ onNavigate }) {
  return (
    <>
      <PageHero title="A straightforward project should have a straightforward process." lede="C&G keeps the path visible: share the issue, clarify the scope, approve the written estimate, and coordinate the work.">
        <InternalLink className="button button-copper" href="/estimate" onNavigate={onNavigate}>Start a project request <ArrowRight size={17} /></InternalLink>
      </PageHero>
      <section className="process-section process-page-section">
        <div className="container process-grid"><div className="process-heading"><span>From request to walkthrough</span><h2>Four steps. No hidden phase.</h2><p>Timing depends on scope, access, materials, permits, and current availability. Those details are clarified before scheduling.</p></div><ProcessList /></div>
      </section>
      <section className="readiness-section">
        <div className="container readiness-grid">
          <div><img src={assetUrl("assets/finish-work.jpg")} alt="Craftsperson checking the alignment of a wood door and brass hardware" width="1448" height="1086" loading="lazy" decoding="async" /></div>
          <div className="readiness-copy"><span>Helpful before the review</span><h2>A few details make the first conversation more useful.</h2><ul><li><FileText size={18} /><div><strong>A short repair list</strong><p>Describe what is damaged, unfinished, or not working as expected.</p></div></li><li><Ruler size={18} /><div><strong>Approximate size and access</strong><p>Room, opening, surface, and access details help establish project fit.</p></div></li><li><CalendarCheck size={18} /><div><strong>Your timing priorities</strong><p>Share a target window, but wait for confirmed scheduling before making plans around the work.</p></div></li></ul></div>
        </div>
      </section>
      <EstimateCta onNavigate={onNavigate} />
      <SeparationNotice />
    </>
  );
}

function AboutPage({ onNavigate }) {
  return (
    <>
      <PageHero title="Practical experience, accountable work, and a clear point of contact." lede="C&G Contracting Services brings a construction-informed approach to residential repair and improvement work across Los Angeles County and nearby communities." />
      <section className="about-story">
        <div className="container about-story-grid">
          <div className="about-story-image"><img src={assetUrl("assets/contractor-hero.jpg")} alt="Contractor checking dimensions during interior finish work" width="1536" height="1024" loading="lazy" decoding="async" /></div>
          <div className="about-story-copy"><span>The approach</span><h2>Respect the home. Define the scope. Communicate the work.</h2><p>Small and mid-sized residential projects still deserve organized planning. C&amp;G begins with the condition in front of you, clarifies the expected finish, and documents the agreed work before scheduling.</p><p>The result is a practical process built around fewer surprises and a clear final walkthrough.</p></div>
        </div>
      </section>
      <section className="credentials-section">
        <div className="container credentials-grid">
          <div><span>License transparency</span><h2>Verify the contractor record directly.</h2></div>
          <div className="license-panel"><div><span>Contractor of record</span><strong>Coastal Construction Services</strong></div><div><span>California license</span><strong>CSLB #{licenseNumber}</strong></div><div><span>Classification</span><strong>B — General Building</strong></div><a className="button button-graphite" href={licenseUrl} target="_blank" rel="noreferrer">Open CSLB verification <ExternalLink size={16} /></a></div>
        </div>
      </section>
      <section className="area-section"><div className="container area-grid"><div><MapPin size={25} /><h2>Los Angeles County &amp; nearby communities</h2></div><p>Project location, travel, current schedule, and scope are confirmed before an estimate visit or work date is offered.</p></div></section>
      <EstimateCta onNavigate={onNavigate} />
      <SeparationNotice />
    </>
  );
}

function EstimateForm() {
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const inspected = form.get("inspected");

    if (inspected === "yes") {
      setStatus({ type: "blocked", message: "C&G Contracting Services cannot offer or perform repairs on this property within 12 months of a C&G home inspection. Please contact an independent contractor." });
      return;
    }

    const subject = `Project request — ${form.get("projectType")} — ${form.get("city")}`;
    const body = [
      `Name: ${form.get("name")}`,
      `Phone: ${form.get("phone")}`,
      `Email: ${form.get("email")}`,
      `City / ZIP: ${form.get("city")}`,
      `Project type: ${form.get("projectType")}`,
      `Preferred timing: ${form.get("timeline")}`,
      `C&G inspection in previous 12 months: ${inspected}`,
      "",
      "Project details:",
      form.get("details"),
    ].join("\n");

    setStatus({ type: "ready", message: "Your email app should open with the project details filled in. Review the message and send it when you are ready." });
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="estimate-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label><span>Name</span><input type="text" name="name" autoComplete="name" required /></label>
        <label><span>Phone</span><input type="tel" name="phone" autoComplete="tel" required /></label>
      </div>
      <div className="form-row">
        <label><span>Email</span><input type="email" name="email" autoComplete="email" required /></label>
        <label><span>City or ZIP</span><input type="text" name="city" autoComplete="postal-code" required /></label>
      </div>
      <div className="form-row">
        <label><span>Project type</span><select name="projectType" defaultValue="" required><option value="" disabled>Select one</option>{serviceRows.map(({ title }) => <option key={title}>{title}</option>)}<option>Other residential project</option></select></label>
        <label><span>Preferred timing</span><select name="timeline" defaultValue="Flexible" required><option>Flexible</option><option>Within 30 days</option><option>Within 1–3 months</option><option>Planning ahead</option></select></label>
      </div>
      <label><span>Has C&amp;G prepared a home inspection report for this property in the previous 12 months?</span><select name="inspected" defaultValue="" required><option value="" disabled>Select one</option><option value="no">No</option><option value="unsure">Not sure</option><option value="yes">Yes</option></select></label>
      <label><span>Project details</span><textarea name="details" rows="7" placeholder="Describe what needs attention, where it is located, and any access or timing details." required /></label>
      <div className="form-submit-row"><button className="button button-copper" type="submit">Prepare email request <ArrowRight size={17} /></button><p>This form opens your email app. Nothing is sent until you review and send the message.</p></div>
      {status ? <div className={`form-status form-status-${status.type}`} role="status">{status.message}</div> : null}
    </form>
  );
}

function EstimatePage() {
  return (
    <>
      <PageHero title="Tell us what needs attention." lede="Share the project basics and C&G will follow up to clarify fit, scope, access, and next steps." />
      <section className="estimate-page-section">
        <div className="container estimate-page-grid">
          <div className="estimate-form-wrap"><h2>Project request</h2><EstimateForm /></div>
          <aside className="estimate-sidebar">
            <div><span>Prefer to talk?</span><a href="tel:+13105056581"><Phone size={18} /> {phoneNumber}</a><a href={`mailto:${emailAddress}`}><Mail size={18} /> {emailAddress}</a></div>
            <div><span>Helpful to include</span><ul><li><Check size={15} /> A short repair list</li><li><Check size={15} /> Room or area of the home</li><li><Check size={15} /> Approximate timing</li><li><Check size={15} /> Photos by reply, if useful</li></ul></div>
            <div className="estimate-policy"><ShieldCheck size={20} /><p>If C&amp;G inspected the property during the previous 12 months, the contracting service cannot offer or perform repairs there.</p></div>
          </aside>
        </div>
      </section>
      <SeparationNotice />
    </>
  );
}

function NotFoundPage({ onNavigate }) {
  return <><PageHero title="That page is not part of this site." lede="Return home, review services, or start a project request."><InternalLink className="button button-copper" href="/" onNavigate={onNavigate}>Return home <ArrowRight size={17} /></InternalLink></PageHero><EstimateCta onNavigate={onNavigate} /></>;
}

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><Brand onNavigate={onNavigate} /><p>Residential repair and improvement work with a practical, clearly defined scope.</p></div>
        <div className="footer-links"><span>Explore</span>{navItems.slice(1).map(([label, href]) => <InternalLink href={href} onNavigate={onNavigate} key={href}>{label}</InternalLink>)}</div>
        <div className="footer-links"><span>Contact</span><a href="tel:+13105056581">{phoneNumber}</a><a href={`mailto:${emailAddress}`}>{emailAddress}</a><p>Los Angeles County &amp; nearby communities</p></div>
      </div>
      <div className="container footer-license"><span>Contractor of record: Coastal Construction Services</span><a href={licenseUrl} target="_blank" rel="noreferrer">CSLB #{licenseNumber} · B — General Building <ExternalLink size={12} /></a></div>
      <div className="container footer-bottom"><span>© 2026 C&amp;G Contracting Services</span><a href={inspectionUrl}>C&amp;G Certified Home Inspector</a></div>
    </footer>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState(() => routeKey());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(routeKey());
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const metadata = pageMeta[currentPage] || pageMeta.notFound;
    document.title = metadata.title;
    const setMeta = (attribute, key, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    setMeta("name", "description", metadata.description);
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pageUrl(Object.entries(pageByPath).find(([, key]) => key === currentPage)?.[0] || "/")}`;

    let schema = document.getElementById("cg-contractor-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "cg-contractor-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "GeneralContractor",
      name: "C&G Contracting Services",
      legalName: "Coastal Construction Services",
      description: metadata.description,
      telephone: "+1-310-505-6581",
      email: emailAddress,
      areaServed: "Los Angeles County and nearby communities",
      identifier: `CSLB #${licenseNumber}`,
      url: `${window.location.origin}${appBase}`,
      sameAs: [licenseUrl],
    });

    const frame = window.requestAnimationFrame(() => document.getElementById("page-content")?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [currentPage]);

  const onNavigate = (event, href) => {
    if (!href.startsWith("/")) return;
    event.preventDefault();
    window.history.pushState({}, "", pageUrl(href));
    setCurrentPage(routeKey(pageUrl(href)));
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const props = { onNavigate };
  const page = {
    home: <HomePage {...props} />,
    services: <ServicesPage {...props} />,
    process: <ProcessPage {...props} />,
    about: <AboutPage {...props} />,
    estimate: <EstimatePage {...props} />,
    notFound: <NotFoundPage {...props} />,
  }[currentPage] || <NotFoundPage {...props} />;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#page-content">Skip to content</a>
      <SiteHeader currentPage={currentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} onNavigate={onNavigate} />
      <main id="page-content" tabIndex="-1">{page}</main>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
