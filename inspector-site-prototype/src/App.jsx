import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ClipboardCheck,
  ChevronRight,
  Clock3,
  FileCheck2,
  Hammer,
  Menu,
  Phone,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";

const bookingUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSc4O-SjvnZyKU7dTZoinpogjsNcC6NxJHNhDP1Lxp-1WYYCTw/viewform";
const contractorUrl = "/contracting/";
const phoneNumber = "(310) 505-6581";
const appBase = import.meta.env.BASE_URL;
const assetUrl = (path) => `${appBase}${path.replace(/^\//, "")}`;
const pageUrl = (path) => path === "/" ? appBase : `${appBase}${path.replace(/^\//, "")}`;

const navItems = [
  ["Home", "/"],
  ["Services", "/services"],
  ["About", "/about"],
  ["Areas We Serve", "/areas"],
  ["FAQ", "/faq"],
  ["Resources", "/resources"],
  ["Contact", "/contact"],
];

const pageByPath = {
  "/": "home",
  "/services": "services",
  "/about": "about",
  "/areas": "areas",
  "/faq": "faq",
  "/resources": "resources",
  "/contact": "contact",
};

const pageMeta = {
  home: {
    title: "C&G Certified Home Inspector | Know what you’re buying.",
    description: "Construction-informed home inspections across Los Angeles County with clear answers, detailed photos, and practical next steps.",
  },
  services: {
    title: "Inspection Services | C&G Certified Home Inspector",
    description: "Explore C&G inspection services, typical inspection areas, photo-rich reports, and practical recommendations.",
  },
  about: {
    title: "About C&G | Certified Home Inspector",
    description: "Meet C&G Certified Home Inspector and learn about the construction-informed approach behind every inspection.",
  },
  areas: {
    title: "Areas We Serve | C&G Certified Home Inspector",
    description: "C&G Certified Home Inspector serves Los Angeles County, the San Gabriel Valley, the South Bay, and surrounding communities.",
  },
  faq: {
    title: "FAQ | C&G Certified Home Inspector",
    description: "Straightforward answers about C&G home inspections, reports, scheduling, and what to expect.",
  },
  resources: {
    title: "Home Inspection Resources | C&G Certified Home Inspector",
    description: "Practical home inspection guidance for preparing, reviewing a report, and planning next steps.",
  },
  notFound: {
    title: "Page Not Found | C&G Certified Home Inspector",
    description: "The page you were looking for is not available. Return to C&G Certified Home Inspector for clear answers and practical next steps.",
  },
  contact: {
    title: "Contact C&G | Schedule a Home Inspection",
    description: "Schedule a C&G home inspection or contact the team about a property in Los Angeles County and surrounding communities.",
  },
};

const resourcePlanSteps = [
  ["01", "Before the visit", "Confirm access, gather the questions already on your mind, and share any property context that will help the inspection start with the right focus."],
  ["02", "During the inspection", "Use the time on site to ask questions, understand what is visible, and separate a current priority from a condition that simply needs watching."],
  ["03", "After the report", "Review the priorities first, then decide which questions need a qualified trade follow-up, a repair conversation, or no immediate action."],
];

const contactPathSteps = [
  ["01", "Start with a property question", "Use the scheduling form or call C&G directly if you want to talk through the property first."],
  ["02", "Choose a time that works", "Pick an inspection window that fits the decision in front of you and the access the property allows."],
  ["03", "Use the report", "Review photos, context, and priorities so the next conversation starts with better information."],
];

function routeKey(pathname = window.location.pathname) {
  const basePath = appBase.replace(/\/+$/, "");
  const relativePath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const cleanPath = relativePath.replace(/\/+$/, "") || "/";
  return pageByPath[cleanPath] || "notFound";
}

function BrandMark({ onNavigate }) {
  return (
    <a className="brand" href={pageUrl("/")} onClick={(event) => onNavigate(event, "/")} aria-label="C&G Certified Home Inspector home">
      <span className="brand-mark-wrap">
        <img src={assetUrl("assets/cg-logo-mark.png")} alt="" className="brand-mark" />
      </span>
      <span className="brand-copy">
        <strong>C&amp;G Certified</strong>
        <span>Home Inspector</span>
      </span>
    </a>
  );
}

function InternalLink({ href, onNavigate, children, className = "" }) {
  return (
    <a className={className} href={pageUrl(href)} onClick={(event) => onNavigate(event, href)}>
      {children}
    </a>
  );
}

function SiteHeader({ mobileMenuOpen, setMobileMenuOpen, currentPage, onNavigate }) {
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandMark onNavigate={onNavigate} />

        <nav className={`desktop-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a
              className={currentPage === routeKey(href) ? "is-active" : ""}
              key={href}
              href={pageUrl(href)}
              aria-current={currentPage === routeKey(href) ? "page" : undefined}
              onClick={(event) => {
                onNavigate(event, href);
                closeMenu();
              }}
            >
              {label}
            </a>
          ))}
          <a className="mobile-menu-cta button button-gold" href={bookingUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Schedule an Inspection <ArrowRight size={16} />
          </a>
          <a className="mobile-menu-sister" href={contractorUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Visit C&amp;G Contracting Services <ArrowRight size={14} />
          </a>
        </nav>

        <div className="header-actions">
          <a className="phone-link" href="tel:+13105056581" aria-label={`Call C&G at ${phoneNumber}`}>
            <Phone size={16} strokeWidth={1.8} />
            <span>{phoneNumber}</span>
          </a>
          <a className="button button-small button-gold" href={bookingUrl} target="_blank" rel="noreferrer">
            Schedule an Inspection
          </a>
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
  );
}

function PageHero({ eyebrow, title, children, actions }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
        {actions ? <div className="page-hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

function BookingCallout({ onNavigate, eyebrow = "Ready to know more?", title = "Make the next decision with better information." }) {
  return (
    <section className="contact-section">
      <div className="container contact-card">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="contact-actions">
          <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">
            Schedule an Inspection <ArrowRight size={17} />
          </a>
          <a className="button button-outline-light" href="tel:+13105056581">
            <Phone size={17} /> Call {phoneNumber}
          </a>
        </div>
      </div>
    </section>
  );
}

const featureCards = [
  {
    number: "01",
    title: "Photo-rich reports",
    description: "See the condition, understand the context, and keep a clear record for the next conversation.",
    image: assetUrl("assets/report-laptop.jpg"),
    alt: "Home inspection report and tools on a desk",
  },
  {
    number: "02",
    title: "Practical recommendations",
    description: "Construction perspective without the pressure—just a useful read on what deserves attention.",
    image: assetUrl("assets/attic-inspection.jpg"),
    alt: "Inspector measuring attic framing with a flashlight",
  },
  {
    number: "03",
    title: "Clear next steps",
    description: "Findings are organized so you can separate timely follow-up from routine maintenance and longer-term planning.",
    icon: <ClipboardCheck size={28} strokeWidth={1.5} />,
  },
];

function FeatureGrid() {
  return (
    <div className="feature-grid">
      {featureCards.map((card) => (
        <article className={`feature-card ${card.icon ? "feature-card-icon" : "feature-card-image"}`} key={card.number}>
          {card.image ? (
            <div className="feature-image"><img src={card.image} alt={card.alt} width="1536" height="1024" loading="lazy" decoding="async" /></div>
          ) : (
            <div className="feature-icon">{card.icon}</div>
          )}
          <div className="feature-card-body">
            <span className="feature-number">{card.number}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

const claritySteps = [
  ["01", "Observe", "Review the major visible and accessible systems without destructive testing or guesswork."],
  ["02", "Explain", "Connect photos and plain-language notes so each finding has useful context."],
  ["03", "Prioritize", "Separate timely qualified follow-up from routine maintenance and longer-term planning."],
];

function ClaritySection() {
  return (
    <section className="clarity-section">
      <div className="container clarity-grid">
        <div className="clarity-heading">
          <p className="eyebrow">How clarity is built</p>
          <h2>Useful information beats a wall of findings.</h2>
          <p>The goal is a calm, property-focused record you can review with the people helping you make the decision.</p>
        </div>
        <ol className="clarity-list">
          {claritySteps.map(([number, title, description]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const inspectionAreas = [
  ["01", "Exterior & roofline", "A practical look at the visible exterior conditions that shape how the home performs and what deserves follow-up."],
  ["02", "Structure, attic & crawlspaces", "Accessible areas are documented with photos and context so you can understand the condition without guessing."],
  ["03", "Plumbing, electrical & HVAC", "Major visible and accessible systems are reviewed with an emphasis on clear priorities and useful next steps."],
  ["04", "Interior & safety", "We document the rooms, components, and visible safety concerns that matter to your decision."],
];

function InspectionAreaGrid() {
  return (
    <div className="inspection-area-grid">
      {inspectionAreas.map(([number, title, description]) => (
        <details className="inspection-area-card" key={number}>
          <summary>
            <span className="inspection-area-number">{number}</span>
            <span className="inspection-area-title">{title}</span>
            <ChevronRight size={18} />
          </summary>
          <p>{description}</p>
        </details>
      ))}
    </div>
  );
}

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Serving Los Angeles County &amp; surrounding communities</p>
            <h1>Know what you’re <em>buying.</em></h1>
            <p className="hero-lede">
              Construction-informed home inspections with clear answers, detailed photos, and no scare tactics.
            </p>
            <div className="hero-actions">
              <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">
                Schedule an Inspection <ArrowRight size={17} />
              </a>
              <InternalLink className="text-link text-link-light" href="/services" onNavigate={onNavigate}>
                See What We Inspect <ChevronRight size={16} />
              </InternalLink>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck size={16} /> Independent, property-focused guidance</span>
              <span><Camera size={16} /> Photo-rich digital reporting</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={assetUrl("assets/hero-inspector.jpg")} alt="Home inspector using a diagnostic meter beside a stucco home" width="1731" height="909" fetchPriority="high" decoding="async" />
            <div className="hero-caption">
              <span className="caption-rule" />
              <span>Clear answers for your next move.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-band">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div>
              <p className="eyebrow eyebrow-dark">What you get</p>
              <h2>A report you can actually use.</h2>
            </div>
            <p>Every inspection is built to help you understand the home, prioritize what matters, and move forward with confidence.</p>
          </div>
          <FeatureGrid />
          <InternalLink className="section-link" href="/services" onNavigate={onNavigate}>
            See every inspection service <ArrowRight size={17} />
          </InternalLink>
        </div>
      </section>

      <section className="home-process-section">
        <div className="container home-process-grid">
          <div>
            <p className="eyebrow eyebrow-dark">The C&amp;G approach</p>
            <h2>From first question to confident decision.</h2>
          </div>
          <div className="home-process-copy">
            <p>C&amp;G brings a construction-informed perspective to the inspection process—so you get a thoughtful look at the home and a straightforward conversation about what comes next.</p>
            <InternalLink className="button button-dark" href="/about" onNavigate={onNavigate}>
              Meet C&amp;G <ArrowRight size={17} />
            </InternalLink>
          </div>
        </div>
      </section>

      <ClaritySection />

      <section className="sister-section sister-section-home">
        <div className="container sister-grid">
          <div className="sister-image-wrap">
            <img src={assetUrl("assets/contracting-review.jpg")} alt="Construction professionals reviewing plans in a kitchen" width="1536" height="1024" loading="lazy" decoding="async" />
            <span className="sister-image-label">The C&amp;G family of services</span>
          </div>
          <div className="sister-copy">
            <p className="eyebrow eyebrow-dark">A related C&amp;G service</p>
            <h2>Inspection and construction stay separate.</h2>
            <p>C&amp;G Contracting Services is part of the broader C&amp;G family. It does not offer or perform repairs on a property for which C&amp;G prepared a home inspection report during the previous 12 months.</p>
            <a className="button button-gold" href={contractorUrl} target="_blank" rel="noreferrer">
              Explore C&amp;G Contracting Services <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <BookingCallout onNavigate={onNavigate} />
    </>
  );
}

function ServicesPage({ onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="What we inspect"
        title="A closer look at the home, with a clearer report."
        actions={(
          <>
            <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">Schedule an Inspection <ArrowRight size={17} /></a>
            <InternalLink className="text-link text-link-light" href="/contact" onNavigate={onNavigate}>Ask a question <ChevronRight size={16} /></InternalLink>
          </>
        )}
      >
        <p className="page-hero-lede">A practical inspection helps you understand the property before the next decision—whether you are buying, selling, maintaining, or planning repairs.</p>
      </PageHero>
      <section className="page-section page-section-cream">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div>
              <p className="eyebrow eyebrow-dark">Inspection services</p>
              <h2>Useful detail without the overwhelm.</h2>
            </div>
            <p>We focus on the major visible and accessible systems that shape your understanding of the property.</p>
          </div>
          <FeatureGrid />
        </div>
      </section>
      <section className="page-section page-section-cream page-section-tight-top">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div>
              <p className="eyebrow eyebrow-dark">Typical inspection areas</p>
              <h2>Open the details that matter to your property.</h2>
            </div>
            <p>Visible and accessible conditions are documented in the report. Final scope depends on the property and inspection agreement.</p>
          </div>
          <InspectionAreaGrid />
        </div>
      </section>
      <section className="page-section page-section-cream page-section-tight-top">
        <div className="container resource-checklist-grid">
          <div>
            <p className="eyebrow">Before we arrive</p>
            <h2>A smoother inspection starts with a little access.</h2>
          </div>
          <div className="resource-checklist resource-checklist-light">
            <div><Check size={18} /><span>Make sure the inspector can reach the major systems and accessible areas.</span></div>
            <div><Check size={18} /><span>Unlock gates, garages, utility spaces, and other areas included in the inspection.</span></div>
            <div><Check size={18} /><span>Bring the questions or concerns you want answered while we are on site.</span></div>
            <div><Check size={18} /><span>Share any known repairs, permits, or recent work that may add useful context.</span></div>
          </div>
        </div>
      </section>
      <section className="page-section page-section-deep">
        <div className="container page-split-grid">
          <div>
            <p className="eyebrow">A construction-informed perspective</p>
            <h2>Know what deserves attention now—and what can wait.</h2>
          </div>
          <div className="page-copy-light">
            <p>Every finding is documented with context so you can have a more useful conversation with your agent, contractor, seller, or family.</p>
            <ul className="service-list">
              <li><Camera size={18} /> Detailed photos and visible conditions</li>
              <li><FileCheck2 size={18} /> Clear reporting with prioritized recommendations</li>
              <li><ShieldCheck size={18} /> A straightforward, no-pressure inspection experience</li>
              <li><Clock3 size={18} /> Report timing confirmed when you schedule</li>
            </ul>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow="Have a property in mind?" title="Schedule a clear, practical inspection." />
    </>
  );
}

function AboutPage({ onNavigate }) {
  const steps = [
    ["01", "Schedule", "Choose a time that works for your inspection window."],
    ["02", "On-site inspection", "We look closely, document clearly, and answer questions as we go."],
    ["03", "Clear reporting", "Your report arrives with photos, context, and practical next steps."],
    ["04", "Confident decisions", "Use the information to buy, negotiate, maintain, or plan."],
  ];

  return (
    <>
      <PageHero
        eyebrow="About C&G"
        title="Experience you can understand, delivered with integrity."
        actions={(
          <>
            <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">Schedule an Inspection <ArrowRight size={17} /></a>
            <InternalLink className="text-link text-link-light" href="/services" onNavigate={onNavigate}>See our services <ChevronRight size={16} /></InternalLink>
          </>
        )}
      >
        <p className="page-hero-lede">C&amp;G Certified Home Inspector brings a builder’s eye and a calm, clear communication style to every inspection.</p>
      </PageHero>
      <section className="process-section page-process-section">
        <div className="container process-grid">
          <div className="process-lede">
            <p className="eyebrow eyebrow-dark">A better inspection experience</p>
            <h2>From first question to confident decision.</h2>
            <p>C&amp;G brings a construction-informed perspective to the inspection process. You get a thoughtful look at the home and a straightforward conversation about what comes next.</p>
            <InternalLink className="button button-dark" href="/contact" onNavigate={onNavigate}>
              Talk with C&amp;G <ArrowRight size={17} />
            </InternalLink>
          </div>
          <div className="process-list">
            {steps.map(([number, title, description]) => (
              <div className="process-item" key={number}>
                <span className="process-number">{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <Check size={18} className="process-check" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container values-grid">
          <div>
            <p className="eyebrow eyebrow-dark">What guides the work</p>
            <h2>Professional, practical, and respectful of your time.</h2>
          </div>
          <div className="values-list">
            <div><ShieldCheck size={19} /><span><strong>Integrity first</strong><small>Clear findings and honest context, without the scare tactics.</small></span></div>
            <div><Camera size={19} /><span><strong>Show the work</strong><small>Photo-rich documentation that makes the report easier to use.</small></span></div>
            <div><Hammer size={19} /><span><strong>Construction perspective</strong><small>Experience that helps separate urgent issues from future planning.</small></span></div>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow="Start a conversation" title="Get a clearer read on your next property." />
    </>
  );
}

function AreasPage({ onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Areas we serve"
        title="Local perspective for Southern California homes."
        actions={<a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">Schedule an Inspection <ArrowRight size={17} /></a>}
      >
        <p className="page-hero-lede">Serving Los Angeles County and surrounding communities for buyers, sellers, homeowners, and real estate professionals.</p>
      </PageHero>
      <section className="experience-section areas-main-section">
        <div className="container experience-grid">
          <div>
            <p className="eyebrow">Built for local homes</p>
            <h2>A clear read, wherever you are in the process.</h2>
          </div>
          <div className="experience-copy">
            <p>Whether you are preparing to buy, planning a sale, maintaining a home, or deciding what to repair, the inspection is designed to give you useful context for the next conversation.</p>
            <div className="area-list">
              <span>Los Angeles County</span>
              <span>San Gabriel Valley</span>
              <span>South Bay</span>
              <span>Surrounding communities</span>
            </div>
          </div>
        </div>
      </section>
      <section className="page-section page-section-cream">
        <div className="container page-audience-grid">
          <div><p className="eyebrow eyebrow-dark">Who we help</p><h2>One inspection. A lot more clarity.</h2></div>
          <div className="audience-cards">
            <article><span>01</span><h3>Home buyers</h3><p>Understand the condition before you commit and keep the negotiation grounded in facts.</p></article>
            <article><span>02</span><h3>Homeowners</h3><p>Build a practical maintenance plan from a clear look at the home’s visible systems.</p></article>
            <article><span>03</span><h3>Sellers &amp; agents</h3><p>Surface the important details early so the next conversation starts with better information.</p></article>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow="Serving your next move" title="Let’s get a practical inspection on the calendar." />
    </>
  );
}

const faqItems = [
  ["What does a home inspection cover?", "We look at the major visible and accessible systems of the home, document findings with photos, and explain what deserves attention."],
  ["When will I receive my report?", "Report timing is confirmed when you schedule so you know what to expect before the inspection begins."],
  ["Do you work with buyers and homeowners?", "Yes. The inspection experience is designed for buyers, sellers, homeowners, and the professionals helping them make a decision."],
  ["How do I schedule an inspection?", "Use the scheduling link to choose a time, or call C&G directly if you would rather talk through the property first."],
  ["What should I have ready before the inspection?", "Make sure accessible areas are reachable, bring the questions you already have, and share any known repairs or recent work that adds useful context."],
  ["How should I use the report afterward?", "Start with the overall context and priority findings, then decide which questions need qualified follow-up, a repair conversation, or no immediate action."],
];

function FaqPage({ onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Common questions"
        title="Good information should feel straightforward."
        actions={<InternalLink className="text-link text-link-light" href="/contact" onNavigate={onNavigate}>Talk with C&amp;G <ArrowRight size={16} /></InternalLink>}
      >
        <p className="page-hero-lede">A few answers to help you know what to expect before, during, and after your inspection.</p>
      </PageHero>
      <section className="faq-section faq-page-section">
        <div className="container faq-grid">
          <div>
            <p className="eyebrow eyebrow-dark">Still have a question?</p>
            <h2>Call C&amp;G directly and get a real answer.</h2>
            <p className="faq-intro">The right inspection should leave you with fewer unknowns and a clearer next step.</p>
            <a className="text-link text-link-dark" href="tel:+13105056581">Call {phoneNumber} <ChevronRight size={16} /></a>
            <div className="faq-next-links">
              <span className="footer-label">Keep going</span>
              <InternalLink className="text-link text-link-dark" href="/resources" onNavigate={onNavigate}>Prepare for the inspection <ChevronRight size={16} /></InternalLink>
              <InternalLink className="text-link text-link-dark" href="/services" onNavigate={onNavigate}>See what we inspect <ChevronRight size={16} /></InternalLink>
              <InternalLink className="text-link text-link-dark" href="/contact" onNavigate={onNavigate}>Open scheduling and contact options <ChevronRight size={16} /></InternalLink>
            </div>
          </div>
          <div className="faq-list">
            {faqItems.map(([question, answer], index) => (
              <details open={index === 0} key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <BookingCallout eyebrow="Ready when you are" title="Turn the unknowns into a clearer decision." />
    </>
  );
}

function ContactPage({ onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Contact C&G"
        title="Let’s get your next inspection moving."
        actions={<InternalLink className="text-link text-link-light" href="/services" onNavigate={onNavigate}>Review inspection services <ChevronRight size={16} /></InternalLink>}
      >
        <p className="page-hero-lede">Choose a time online, call directly, or send a note if you want to talk through the property before scheduling.</p>
      </PageHero>
      <section className="page-section page-section-cream contact-page-section">
        <div className="container contact-page-grid">
          <div>
            <p className="eyebrow eyebrow-dark">The easiest next step</p>
            <h2>Pick a time that works for you.</h2>
            <p className="page-copy">The scheduling form is the fastest way to request an inspection. If you prefer a conversation first, C&amp;G is available by phone or email.</p>
            <a className="button button-dark" href={bookingUrl} target="_blank" rel="noreferrer">Open the scheduling form <ArrowRight size={17} /></a>
          </div>
          <div className="contact-details">
            <div><span className="footer-label">Call</span><a href="tel:+13105056581">{phoneNumber}</a></div>
            <div><span className="footer-label">Email</span><a href="mailto:clarencegloss@gmail.com">clarencegloss@gmail.com</a></div>
            <div><span className="footer-label">Service area</span><p>Los Angeles County &amp; surrounding communities</p></div>
          </div>
        </div>
      </section>
      <section className="process-section contact-process-section">
        <div className="container process-grid">
          <div className="process-lede">
            <p className="eyebrow eyebrow-dark">What happens next</p>
            <h2>From scheduling to a clearer decision.</h2>
            <p>There is no need to have every question figured out before you reach out. Start with what you know, and use the inspection to build a more useful next step.</p>
            <InternalLink className="button button-dark" href="/resources" onNavigate={onNavigate}>
              Prepare for the inspection <ArrowRight size={17} />
            </InternalLink>
          </div>
          <div className="process-list">
            {contactPathSteps.map(([number, title, description]) => (
              <div className="process-item" key={number}>
                <span className="process-number">{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <Check size={18} className="process-check" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="sister-section">
        <div className="container sister-grid">
          <div className="sister-image-wrap"><img src={assetUrl("assets/contracting-review.jpg")} alt="Construction professionals reviewing plans in a kitchen" width="1536" height="1024" loading="lazy" decoding="async" /></div>
          <div className="sister-copy">
            <p className="eyebrow eyebrow-dark">A separate service path</p>
            <h2>Meet the other side of the C&amp;G family.</h2>
            <p>C&amp;G Contracting Services maintains a strict separation from inspected properties: no repair offer or work on a property inspected by C&amp;G during the previous 12 months.</p>
            <a className="button button-gold" href={contractorUrl} target="_blank" rel="noreferrer">Explore the contractor site <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>
    </>
  );
}

function ResourcesPage({ onNavigate }) {
  const resources = [
    ["01", "Before the inspection", "Make sure the property is accessible, bring your questions, and use the inspection to understand the home—not just to collect a checklist.", ClipboardCheck],
    ["02", "Reading your report", "Start with the overall context, then focus on findings that affect safety, function, maintenance, or your next conversation.", BookOpen],
    ["03", "Planning next steps", "Use the report to prioritize questions, request qualified follow-up when needed, and make a decision that fits your plans.", FileCheck2],
  ];

  return (
    <div className="resources-page">
      <PageHero
        eyebrow="Resources"
        title="A little more clarity before the next decision."
        actions={(
          <>
            <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer">Schedule an Inspection <ArrowRight size={17} /></a>
            <InternalLink className="text-link text-link-light" href="/faq" onNavigate={onNavigate}>Read common questions <ChevronRight size={16} /></InternalLink>
          </>
        )}
      >
        <p className="page-hero-lede">Simple guidance for preparing for an inspection, reading the report, and deciding what comes next.</p>
      </PageHero>
      <section className="page-section page-section-cream">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div>
              <p className="eyebrow eyebrow-dark">Practical guidance</p>
              <h2>Use the inspection as a better conversation starter.</h2>
            </div>
            <p>The goal is not to create more anxiety. It is to give you enough context to ask better questions and choose the right next step.</p>
          </div>
          <div className="resource-grid">
            {resources.map(([number, title, description, Icon]) => (
              <article className="resource-card" key={number}>
                <div className="resource-card-icon"><Icon size={24} strokeWidth={1.5} /></div>
                <span className="feature-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section resource-plan-section">
        <div className="container">
          <div className="section-intro section-intro-row">
            <div>
              <p className="eyebrow eyebrow-dark">A useful rhythm</p>
              <h2>Three moments that make the inspection easier to use.</h2>
            </div>
            <p>Good inspection work is more than the visit itself. A little preparation and a calm follow-up make the information more useful.</p>
          </div>
          <ol className="resource-plan-list">
            {resourcePlanSteps.map(([number, title, description]) => (
              <li key={number}>
                <span className="resource-plan-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="page-section page-section-deep printable-resource">
        <div className="container resource-checklist-grid">
          <div>
            <p className="eyebrow">Before you schedule</p>
            <h2>Bring the questions you already have.</h2>
          </div>
          <div className="resource-checklist">
            <div><Check size={18} /><span>Property context: buying, selling, maintenance, or planning</span></div>
            <div><Check size={18} /><span>Known concerns you want documented clearly</span></div>
            <div><Check size={18} /><span>Time to review the findings and ask questions</span></div>
            <div><Check size={18} /><span>A plan for qualified follow-up when a finding needs more detail</span></div>
          </div>
          <button className="button button-outline-light resource-print-button" type="button" onClick={() => window.print()}>
            <Printer size={16} /> Print this checklist
          </button>
        </div>
      </section>
      <section className="page-section page-section-cream page-section-tight-top">
        <div className="container resource-glossary-grid">
          <div>
            <p className="eyebrow eyebrow-dark">Inspection language</p>
            <h2>A few terms worth knowing before the report arrives.</h2>
          </div>
          <div className="resource-glossary">
            <details>
              <summary>Accessible areas</summary>
              <p>Areas that can be reached safely and reasonably at the time of inspection. Final scope depends on the property and inspection agreement.</p>
            </details>
            <details>
              <summary>Visible condition</summary>
              <p>A condition that can be observed without destructive testing, dismantling, or moving stored belongings.</p>
            </details>
            <details>
              <summary>Qualified follow-up</summary>
              <p>A closer evaluation by the appropriate licensed or qualified trade professional when a finding needs more detail.</p>
            </details>
            <details>
              <summary>Priority finding</summary>
              <p>An item that deserves timely attention because it may affect safety, function, active damage, or the next decision.</p>
            </details>
          </div>
        </div>
      </section>
      <BookingCallout onNavigate={onNavigate} eyebrow="Still deciding?" title="Call C&G and talk through the property first." />
    </div>
  );
}

function NotFoundPage({ onNavigate }) {
  return (
    <>
      <PageHero
        eyebrow="Page not found"
        title="Let’s get you back to clear answers."
        actions={<InternalLink className="button button-gold" href="/" onNavigate={onNavigate}>Return to Home <ArrowRight size={17} /></InternalLink>}
      >
        <p className="page-hero-lede">That page is not available in this version of the site. The inspection, resources, and contact paths are still right here.</p>
      </PageHero>
      <BookingCallout onNavigate={onNavigate} eyebrow="Need a hand?" title="Call C&G or schedule an inspection directly." />
    </>
  );
}

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <BrandMark onNavigate={onNavigate} />
          <p>Inspecting with integrity across Los Angeles County and surrounding communities.</p>
        </div>
        <div className="footer-links">
          <span className="footer-label">Explore</span>
          {navItems.slice(1, 6).map(([label, href]) => <InternalLink key={href} href={href} onNavigate={onNavigate}>{label}</InternalLink>)}
        </div>
        <div className="footer-links">
          <span className="footer-label">Contact</span>
          <a href="tel:+13105056581">{phoneNumber}</a>
          <a href="mailto:clarencegloss@gmail.com">clarencegloss@gmail.com</a>
          <a href={contractorUrl} target="_blank" rel="noreferrer"><Hammer size={14} /> C&amp;G Contracting Services</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 C&amp;G Certified Home Inspector</span>
        <span>Independent inspection guidance</span>
      </div>
    </footer>
  );
}

export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => routeKey());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(routeKey());
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const metadata = pageMeta[currentPage] || pageMeta.home;
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
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);

    let schema = document.getElementById("cg-business-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "cg-business-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "C&G Certified Home Inspector",
      description: metadata.description,
      telephone: "+1-310-505-6581",
      email: "clarencegloss@gmail.com",
      areaServed: ["Los Angeles County", "San Gabriel Valley", "South Bay", "Surrounding communities"],
      url: `${window.location.origin}${appBase}`,
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pageUrl(Object.entries(pageByPath).find(([, key]) => key === currentPage)?.[0] || "/")}`;
  }, [currentPage]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("page-content")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentPage]);

  const onNavigate = (event, href) => {
    if (!href.startsWith("/")) return;
    event.preventDefault();
    window.history.pushState({}, "", pageUrl(href));
    setCurrentPage(routeKey(href));
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const pageProps = { onNavigate };
  const page = {
    home: <HomePage {...pageProps} />,
    services: <ServicesPage {...pageProps} />,
    about: <AboutPage {...pageProps} />,
    areas: <AreasPage {...pageProps} />,
    faq: <FaqPage {...pageProps} />,
    resources: <ResourcesPage {...pageProps} />,
    contact: <ContactPage {...pageProps} />,
    notFound: <NotFoundPage {...pageProps} />,
  }[currentPage] || <NotFoundPage {...pageProps} />;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#page-content">Skip to content</a>
      <SiteHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      <main id="page-content" tabIndex="-1">{page}</main>
      <SiteFooter onNavigate={onNavigate} />
      <MobileQuickActions />
    </div>
  );
}

function MobileQuickActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 260);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="mobile-quick-actions" aria-label="Quick contact actions">
      <a className="button button-gold" href={bookingUrl} target="_blank" rel="noreferrer"><ArrowRight size={15} /> Schedule</a>
      <a className="button button-dark" href="tel:+13105056581"><Phone size={15} /> Call</a>
    </div>
  );
}
