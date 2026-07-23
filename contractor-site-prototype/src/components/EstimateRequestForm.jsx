import { useRef, useState } from "react";
import { business, evaluateContractorEligibility, separationPolicy } from "../../../shared/siteData.js";
import {
  contractorRequestCategories,
  contractorRequestCategoryByKey,
  contractorServiceById,
} from "../content/services.js";

const initialValues = {
  fullName: "", email: "", phone: "", contactMethod: "", address: "", propertyType: "", authority: false,
  occupancy: "", accessNotes: "", category: "", description: "", affectedAreas: "", firstNoticed: "",
  sourceStatus: "", timing: "", eligibility: "", independentReport: "", hazards: "", permitStatus: "",
  designDocuments: "", materialPreference: "", ownerMaterials: "", priorRepairs: "", otherParties: "",
  accurate: false, contactConsent: false, noPromise: false,
};

const labels = {
  fullName: "Full name", email: "Email", phone: "Phone", contactMethod: "Preferred contact method", address: "Full property address",
  propertyType: "Property type", authority: "Authority to request work", occupancy: "Occupancy", category: "Project category",
  description: "Issue and desired result", affectedAreas: "Areas or rooms affected", sourceStatus: "Source condition",
  timing: "Desired timing", eligibility: "Inspection eligibility", hazards: "Known hazard concerns", permitStatus: "Permit or plan status",
  designDocuments: "Design or engineering documents", materialPreference: "Material preference", ownerMaterials: "Owner-supplied materials",
  accurate: "Accuracy confirmation", contactConsent: "Contact consent", noPromise: "No-promise acknowledgment",
};

const firstStepFields = ["eligibility", "category"];
const contactStepFields = ["fullName", "email", "phone", "contactMethod", "address", "propertyType", "authority", "occupancy"];
const projectStepFields = ["description", "affectedAreas", "sourceStatus", "timing", "hazards", "permitStatus", "designDocuments", "materialPreference", "ownerMaterials"];
const consentStepFields = ["accurate", "contactConsent", "noPromise"];
const manualReviewFields = ["fullName", "email", "phone", "contactMethod", "address", "authority", "contactConsent", "noPromise"];
const requiredFields = new Set([...firstStepFields, ...contactStepFields, ...projectStepFields, ...consentStepFields]);

function validateFields(values, fields) {
  const errors = {};
  fields.forEach((field) => { if (!values[field]) errors[field] = `${labels[field]} is required.`; });
  if (fields.includes("email") && values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (fields.includes("phone") && values.phone && values.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a phone number with at least 10 digits.";
  return errors;
}

const categoryLabel = (key) => contractorRequestCategoryByKey.get(key)?.label || "Other or not sure";

const buildProjectBody = (values) => [
  "RESIDENTIAL PROJECT REQUEST",
  "",
  `Name: ${values.fullName}`,
  `Email: ${values.email}`,
  `Phone: ${values.phone}`,
  `Preferred contact: ${values.contactMethod}`,
  `Property address: ${values.address}`,
  `Property type: ${values.propertyType}`,
  `Occupancy: ${values.occupancy}`,
  `Access notes: ${values.accessNotes || "Not supplied"}`,
  `Category: ${categoryLabel(values.category)}`,
  `Issue and desired result: ${values.description}`,
  `Areas affected: ${values.affectedAreas}`,
  `First noticed: ${values.firstNoticed || "Not supplied"}`,
  `Source condition: ${values.sourceStatus}`,
  `Desired timing: ${values.timing}`,
  `C&G inspection during previous 12 months: No`,
  `Independent report authorized to share: ${values.independentReport || "Not supplied"}`,
  `Known hazard concerns: ${values.hazards}`,
  `Permit or plan status: ${values.permitStatus}`,
  `Design or engineering documents: ${values.designDocuments}`,
  `Material preference: ${values.materialPreference}`,
  `Owner-supplied materials: ${values.ownerMaterials}`,
  `Prior repair attempts: ${values.priorRepairs || "Not supplied"}`,
  `Other contractors or active claims: ${values.otherParties || "Not supplied"}`,
  "",
  "The submitter confirmed accuracy, authority, contact consent, and that preparing this email is not acceptance, an estimate, a contract, or a schedule reservation.",
].join("\n");

const buildEligibilityBody = (values) => [
  "INSPECTION ELIGIBILITY REVIEW ONLY",
  "",
  `Name: ${values.fullName}`,
  `Email: ${values.email}`,
  `Phone: ${values.phone}`,
  `Preferred contact: ${values.contactMethod}`,
  `Property address: ${values.address}`,
  "C&G inspection during previous 12 months: Not sure",
  "",
  "The submitter confirmed authority to ask about this property, consent to contact, and that this is an eligibility question only—not an estimate, work request, contract, or schedule reservation.",
].join("\n");

function FieldError({ errors, name }) {
  return errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
}

function Progress({ step }) {
  const items = ["Eligibility", "Contact & property", "Project details", "Review & consent"];
  return <nav className="estimate-progress" aria-label="Project request progress"><ol>{items.map((item, index) => {
    const number = index + 1;
    return <li key={item} className={number < step ? "is-complete" : ""} aria-current={number === step ? "step" : undefined}><span>{String(number).padStart(2, "0")}</span><strong>{item}</strong></li>;
  })}</ol></nav>;
}

function ReviewItem({ term, children }) {
  return <div><dt>{term}</dt><dd>{children || "Not supplied"}</dd></div>;
}

export function EstimateRequestForm({ initialCategoryKey = "" }) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    category: contractorRequestCategoryByKey.has(initialCategoryKey) ? initialCategoryKey : "",
  }));
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const summaryRef = useRef(null);
  const stepHeadingRef = useRef(null);

  const eligibility = evaluateContractorEligibility(values.eligibility);
  const currentService = contractorServiceById.get(values.category);

  const focusSummary = () => requestAnimationFrame(() => summaryRef.current?.focus());
  const focusStep = () => requestAnimationFrame(() => {
    stepHeadingRef.current?.focus();
    stepHeadingRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  });
  const showErrors = (nextErrors) => {
    setErrors(nextErrors);
    setResult(null);
    focusSummary();
  };

  const setValue = (event) => {
    const { name, type, checked, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setResult(null);
  };

  const setEligibility = (event) => {
    const nextValue = event.target.value;
    setValues((current) => ({ ...current, eligibility: nextValue }));
    setErrors({});
    setStep(1);
    if (nextValue === "yes") {
      setResult({ state: "blocked" });
      focusSummary();
    } else {
      setResult(null);
    }
  };

  const inputProps = (name) => ({
    name,
    value: values[name],
    onChange: setValue,
    required: requiredFields.has(name),
    "aria-required": requiredFields.has(name) || undefined,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const checkProps = (name) => ({
    id: name,
    name,
    type: "checkbox",
    checked: values[name],
    onChange: setValue,
    required: true,
    "aria-required": true,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const moveToStep = (nextStep, fields) => {
    const nextErrors = validateFields(values, fields);
    if (Object.keys(nextErrors).length) {
      showErrors(nextErrors);
      return;
    }
    setErrors({});
    setResult(null);
    setStep(nextStep);
    focusStep();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (eligibility.state === "manual-review") {
      const nextErrors = validateFields(values, manualReviewFields);
      if (Object.keys(nextErrors).length) {
        showErrors(nextErrors);
        return;
      }
      const href = `mailto:${business.contracting.email}?subject=${encodeURIComponent("C&G inspection eligibility review")}&body=${encodeURIComponent(buildEligibilityBody(values))}`;
      setResult({ state: "manual-review", href });
      focusSummary();
      return;
    }
    if (eligibility.state !== "eligible") {
      showErrors({ eligibility: "Inspection eligibility is required." });
      setStep(1);
      return;
    }

    const allFields = [...firstStepFields, ...contactStepFields, ...projectStepFields, ...consentStepFields];
    const nextErrors = validateFields(values, allFields);
    if (Object.keys(nextErrors).length) {
      const targetStep = contactStepFields.some((field) => nextErrors[field]) ? 2 : projectStepFields.some((field) => nextErrors[field]) ? 3 : 4;
      setStep(targetStep);
      showErrors(nextErrors);
      return;
    }
    const subject = `C&G project request — ${categoryLabel(values.category)}`;
    const href = `mailto:${business.contracting.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildProjectBody(values))}`;
    setResult({ state: "eligible", href });
    focusSummary();
  };

  return (
    <form className="estimate-form" noValidate onSubmit={handleSubmit}>
      {Object.keys(errors).length ? <div className="error-summary" ref={summaryRef} tabIndex="-1" role="alert"><strong>Please review these fields.</strong><ul>{Object.entries(errors).map(([field, message]) => <li key={field}><a href={`#${field}`}>{message}</a></li>)}</ul></div> : null}
      {result?.state === "eligible" ? <div className="form-status" ref={summaryRef} tabIndex="-1" role="status"><strong>Your project email is ready to prepare.</strong><p>Nothing has been sent or received. Opening the link below starts a draft in your email application. No work or appointment is scheduled.</p><a className="button button-graphite" href={result.href}>Prepare project request email</a></div> : null}

      {values.eligibility !== "unsure" ? <Progress step={step} /> : <p className="manual-track-label">Eligibility review only · no ordinary estimate request</p>}

      {step === 1 ? <section className="estimate-step" aria-labelledby="eligibility-step-heading">
        <div className="estimate-step-intro"><span>Step 01</span><h3 id="eligibility-step-heading" ref={stepHeadingRef} tabIndex="-1">Eligibility comes first.</h3><p>Answer the property-level question before sharing contact or project details.</p></div>
        <fieldset className="eligibility-fieldset" id="inspection-eligibility"><legend>Inspection eligibility</legend><label htmlFor="eligibility">Has C&amp;G prepared a home inspection report for this property during the previous 12 months?<select id="eligibility" name="eligibility" value={values.eligibility} onChange={setEligibility} required aria-required="true" aria-invalid={Boolean(errors.eligibility)} aria-describedby={errors.eligibility ? "eligibility-help eligibility-error" : "eligibility-help"}><option value="">Select one</option><option value="no">No</option><option value="yes">Yes</option><option value="unsure">Not sure</option></select><FieldError errors={errors} name="eligibility" /></label><p id="eligibility-help">{separationPolicy.notice}</p></fieldset>
        <p className="form-submit-truth">Nothing is uploaded or sent while you use this guide.</p>

        {eligibility.state === "validation-error" ? <div className="form-submit-row"><button className="button button-copper" type="button" onClick={() => showErrors(validateFields(values, ["eligibility"]))}>Continue</button><p>Choose an answer before any contact or project details appear.</p></div> : null}

        {result?.state === "blocked" ? <div className="form-status form-status-blocked" ref={summaryRef} tabIndex="-1" role="status"><strong>This property is not eligible for a C&amp;G contracting request.</strong><p>{separationPolicy.blocked}</p><p>No contact or project information is required. Nothing has been sent by this website.</p></div> : null}

        {eligibility.state === "manual-review" ? <section className="manual-review-track" aria-labelledby="manual-review-title">
          <div className="estimate-step-intro"><span>Limited path</span><h3 id="manual-review-title">Ask C&amp;G to confirm eligibility.</h3><p>Only contact and property-identification details are requested. This does not begin an estimate or repair-sales process.</p></div>
          {result?.state === "manual-review" ? <div className="form-status form-status-manual" ref={summaryRef} tabIndex="-1" role="status"><strong>Your eligibility-review email is ready.</strong><p>Nothing has been sent or received. Opening the link prepares a draft asking C&amp;G to confirm eligibility only.</p><a className="button button-graphite" href={result.href}>Prepare eligibility review email</a></div> : null}
          <fieldset><legend>Contact for eligibility review</legend><div className="form-row"><label htmlFor="fullName">Full name<input id="fullName" autoComplete="name" {...inputProps("fullName")} /><FieldError errors={errors} name="fullName" /></label><label htmlFor="email">Email<input id="email" type="email" autoComplete="email" {...inputProps("email")} /><FieldError errors={errors} name="email" /></label></div><div className="form-row"><label htmlFor="phone">Phone<input id="phone" type="tel" autoComplete="tel" {...inputProps("phone")} /><FieldError errors={errors} name="phone" /></label><label htmlFor="contactMethod">Preferred contact method<select id="contactMethod" {...inputProps("contactMethod")}><option value="">Select one</option><option>Email</option><option>Phone</option></select><FieldError errors={errors} name="contactMethod" /></label></div><label htmlFor="address">Full property address<input id="address" autoComplete="street-address" {...inputProps("address")} /><FieldError errors={errors} name="address" /></label><label className="check-label"><input {...checkProps("authority")} /> I am the owner or authorized agent for this property.</label><FieldError errors={errors} name="authority" /><label className="check-label"><input {...checkProps("contactConsent")} /> I consent to contact about this eligibility question.</label><FieldError errors={errors} name="contactConsent" /><label className="check-label"><input {...checkProps("noPromise")} /> I understand this is not an estimate, work request, contract, or schedule reservation.</label><FieldError errors={errors} name="noPromise" /></fieldset>
          <div className="form-submit-row"><button className="button button-copper" type="submit">Review eligibility email</button><p>Nothing is uploaded or sent when you select this button.</p></div>
        </section> : null}

        {eligibility.state === "eligible" ? <>
          <fieldset><legend>Project starting point</legend><label htmlFor="category">Which category is closest to the request?<select id="category" {...inputProps("category")}><option value="">Select one</option>{contractorRequestCategories.map((category) => <option value={category.key} key={category.key}>{category.label}</option>)}</select><FieldError errors={errors} name="category" /></label></fieldset>
          {currentService ? <aside className="category-context" aria-live="polite"><span>Selected starting point</span><h3>{currentService.title}</h3><p>{currentService.summary}</p><div><section><h4>Helpful details to describe</h4><ul>{currentService.examples.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Important boundaries</h4><ul>{currentService.boundaries.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></section></div><small>This category organizes the request; it does not accept the work or promise license fit, price, or availability.</small></aside> : null}
          {values.category === "other-or-not-sure" ? <p className="category-uncertain">That is okay. Choose this option when no listed category fits; C&amp;G will review the description without treating it as accepted scope.</p> : null}
          <div className="form-submit-row"><button className="button button-copper" type="button" onClick={() => moveToStep(2, firstStepFields)}>Continue to contact and property</button><p>Nothing is uploaded or sent while you use this guide.</p></div>
        </> : null}
      </section> : null}

      {step === 2 ? <section className="estimate-step" aria-labelledby="contact-step-heading">
        <div className="estimate-step-intro"><span>Step 02</span><h3 id="contact-step-heading" ref={stepHeadingRef} tabIndex="-1">Contact and property.</h3><p>Share who may discuss the request and the residential property involved.</p></div>
        <fieldset><legend>Contact</legend><div className="form-row"><label htmlFor="fullName">Full name<input id="fullName" autoComplete="name" {...inputProps("fullName")} /><FieldError errors={errors} name="fullName" /></label><label htmlFor="email">Email<input id="email" type="email" autoComplete="email" {...inputProps("email")} /><FieldError errors={errors} name="email" /></label></div><div className="form-row"><label htmlFor="phone">Phone<input id="phone" type="tel" autoComplete="tel" {...inputProps("phone")} /><FieldError errors={errors} name="phone" /></label><label htmlFor="contactMethod">Preferred contact method<select id="contactMethod" {...inputProps("contactMethod")}><option value="">Select one</option><option>Email</option><option>Phone</option></select><FieldError errors={errors} name="contactMethod" /></label></div></fieldset>
        <fieldset><legend>Property</legend><label htmlFor="address">Full property address<input id="address" autoComplete="street-address" {...inputProps("address")} /><FieldError errors={errors} name="address" /></label><div className="form-row"><label htmlFor="propertyType">Property type<select id="propertyType" {...inputProps("propertyType")}><option value="">Select one</option><option>Single-family residence</option><option>Condominium or townhome</option><option>Small residential multi-unit property</option><option>Other residential property</option></select><FieldError errors={errors} name="propertyType" /></label><label htmlFor="occupancy">Occupancy<select id="occupancy" {...inputProps("occupancy")}><option value="">Select one</option><option>Owner occupied</option><option>Tenant occupied</option><option>Vacant</option><option>Other</option></select><FieldError errors={errors} name="occupancy" /></label></div><label htmlFor="accessNotes">Access notes<textarea id="accessNotes" rows="3" {...inputProps("accessNotes")} /></label><label className="check-label"><input {...checkProps("authority")} /> I am the owner or authorized agent for this property.</label><FieldError errors={errors} name="authority" /></fieldset>
        <div className="form-navigation"><button className="button button-outline-dark" type="button" onClick={() => moveToStep(1, [])}>Back</button><button className="button button-copper" type="button" onClick={() => moveToStep(3, contactStepFields)}>Continue to project details</button></div>
      </section> : null}

      {step === 3 ? <section className="estimate-step" aria-labelledby="project-step-heading">
        <div className="estimate-step-intro"><span>Step 03</span><h3 id="project-step-heading" ref={stepHeadingRef} tabIndex="-1">Describe the condition and desired result.</h3><p>Useful context helps identify source conditions, trade boundaries, access, materials, permits, and information still missing.</p></div>
        <fieldset><legend>Project</legend><div className="selected-category-line"><span>Starting category</span><strong>{categoryLabel(values.category)}</strong><button type="button" onClick={() => moveToStep(1, [])}>Change</button></div><label htmlFor="description">Plain-language description of the issue and desired result<textarea id="description" rows="5" {...inputProps("description")} /><FieldError errors={errors} name="description" /></label><div className="form-row"><label htmlFor="affectedAreas">Areas or rooms affected<input id="affectedAreas" {...inputProps("affectedAreas")} /><FieldError errors={errors} name="affectedAreas" /></label><label htmlFor="firstNoticed">When first noticed, if relevant<input id="firstNoticed" {...inputProps("firstNoticed")} /></label></div><div className="form-row"><label htmlFor="sourceStatus">Is the source condition active or resolved?<select id="sourceStatus" {...inputProps("sourceStatus")}><option value="">Select one</option><option>Active</option><option>Resolved</option><option>Unknown</option><option>Not applicable</option></select><FieldError errors={errors} name="sourceStatus" /></label><label htmlFor="timing">Desired timing and any true deadline<input id="timing" {...inputProps("timing")} /><FieldError errors={errors} name="timing" /></label></div><p className="form-help">Photos are not accepted through this basic form. Wait for a reply with an approved sharing path. Do not email alarm codes, financial documents, government IDs, payment cards, claim files, or unredacted inspection reports.</p></fieldset>
        <fieldset><legend>Scope context</legend><label htmlFor="independentReport">Do you have a report from an independent inspector that you are authorized to share?<select id="independentReport" {...inputProps("independentReport")}><option value="">Select one if applicable</option><option>Yes</option><option>No</option><option>Not sure</option><option>Not applicable</option></select></label><label htmlFor="hazards">Known water, fire, structural, electrical, gas, pest, or hazardous-material concern<select id="hazards" {...inputProps("hazards")}><option value="">Select one</option><option>None known</option><option>Yes — describe above</option><option>Not sure</option></select><FieldError errors={errors} name="hazards" /></label><div className="form-row"><label htmlFor="permitStatus">Permit or plan status<select id="permitStatus" {...inputProps("permitStatus")}><option value="">Select one</option><option>Unknown</option><option>Not started</option><option>In process</option><option>Available</option></select><FieldError errors={errors} name="permitStatus" /></label><label htmlFor="designDocuments">Design or engineering documents<select id="designDocuments" {...inputProps("designDocuments")}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not applicable</option></select><FieldError errors={errors} name="designDocuments" /></label></div><div className="form-row"><label htmlFor="materialPreference">Material preference<select id="materialPreference" {...inputProps("materialPreference")}><option value="">Select one</option><option>Match existing</option><option>Owner selected</option><option>Needs guidance</option><option>Unknown</option></select><FieldError errors={errors} name="materialPreference" /></label><label htmlFor="ownerMaterials">Owner-supplied materials<select id="ownerMaterials" {...inputProps("ownerMaterials")}><option value="">Select one</option><option>Yes</option><option>No</option><option>Unknown</option></select><FieldError errors={errors} name="ownerMaterials" /></label></div><label htmlFor="priorRepairs">Prior repair attempts<textarea id="priorRepairs" rows="3" {...inputProps("priorRepairs")} /></label><label htmlFor="otherParties">Other contractors or active claims involved<textarea id="otherParties" rows="3" {...inputProps("otherParties")} /></label></fieldset>
        <div className="form-navigation"><button className="button button-outline-dark" type="button" onClick={() => moveToStep(2, [])}>Back</button><button className="button button-copper" type="button" onClick={() => moveToStep(4, projectStepFields)}>Continue to review</button></div>
      </section> : null}

      {step === 4 ? <section className="estimate-step" aria-labelledby="review-step-heading">
        <div className="estimate-step-intro"><span>Step 04</span><h3 id="review-step-heading" ref={stepHeadingRef} tabIndex="-1">Review before preparing the email.</h3><p>Confirm the essentials and acknowledgments. The website still has not sent or stored the request.</p></div>
        <div className="request-review"><section><div><h4>Contact and property</h4><button type="button" onClick={() => moveToStep(2, [])}>Edit</button></div><dl><ReviewItem term="Name">{values.fullName}</ReviewItem><ReviewItem term="Preferred contact">{values.contactMethod}</ReviewItem><ReviewItem term="Property">{values.address}</ReviewItem><ReviewItem term="Occupancy">{values.occupancy}</ReviewItem></dl></section><section><div><h4>Project starting point</h4><button type="button" onClick={() => moveToStep(3, [])}>Edit</button></div><dl><ReviewItem term="Category">{categoryLabel(values.category)}</ReviewItem><ReviewItem term="Affected areas">{values.affectedAreas}</ReviewItem><ReviewItem term="Source condition">{values.sourceStatus}</ReviewItem><ReviewItem term="Desired timing">{values.timing}</ReviewItem></dl></section></div>
        <fieldset><legend>Consent</legend><label className="check-label"><input {...checkProps("accurate")} /> The information is accurate to my knowledge.</label><FieldError errors={errors} name="accurate" /><label className="check-label"><input {...checkProps("contactConsent")} /> I consent to contact about this project request.</label><FieldError errors={errors} name="contactConsent" /><label className="check-label"><input {...checkProps("noPromise")} /> I understand preparing this email is not acceptance, an estimate, a contract, or a schedule reservation.</label><FieldError errors={errors} name="noPromise" /><p className="form-help">See the <a href="/contracting/privacy/">contractor privacy notice</a>. This website has no server-side form receiver; it prepares an email in your own email application.</p></fieldset>
        <div className="form-navigation"><button className="button button-outline-dark" type="button" onClick={() => moveToStep(3, [])}>Back</button><button className="button button-copper" type="submit">Review and prepare email</button></div><p className="form-submit-truth">Nothing is uploaded or sent when you select this button.</p>
      </section> : null}
    </form>
  );
}
