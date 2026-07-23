import { useRef, useState } from "react";
import { business, evaluateContractorEligibility, separationPolicy } from "../../../shared/siteData.js";

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

const requiredFields = ["fullName", "email", "phone", "contactMethod", "address", "propertyType", "authority", "occupancy", "category", "description", "affectedAreas", "sourceStatus", "timing", "eligibility", "hazards", "permitStatus", "designDocuments", "materialPreference", "ownerMaterials", "accurate", "contactConsent", "noPromise"];

function validate(values) {
  const errors = {};
  requiredFields.forEach((field) => { if (!values[field]) errors[field] = `${labels[field]} is required.`; });
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.phone && values.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a phone number with at least 10 digits.";
  return errors;
}

const buildBody = (values, reviewOnly) => [
  reviewOnly ? "ELIGIBILITY REVIEW ONLY" : "RESIDENTIAL PROJECT REQUEST",
  "",
  `Name: ${values.fullName}`,
  `Email: ${values.email}`,
  `Phone: ${values.phone}`,
  `Preferred contact: ${values.contactMethod}`,
  `Property address: ${values.address}`,
  `Property type: ${values.propertyType}`,
  `Occupancy: ${values.occupancy}`,
  `Access notes: ${values.accessNotes || "Not supplied"}`,
  `Category: ${values.category}`,
  `Issue and desired result: ${values.description}`,
  `Areas affected: ${values.affectedAreas}`,
  `First noticed: ${values.firstNoticed || "Not supplied"}`,
  `Source condition: ${values.sourceStatus}`,
  `Desired timing: ${values.timing}`,
  `C&G inspection during previous 12 months: ${values.eligibility}`,
  `Independent report authorized to share: ${values.independentReport || "Not supplied"}`,
  `Known hazard concerns: ${values.hazards}`,
  `Permit or plan status: ${values.permitStatus}`,
  `Design or engineering documents: ${values.designDocuments}`,
  `Material preference: ${values.materialPreference}`,
  `Owner-supplied materials: ${values.ownerMaterials}`,
  `Prior repair attempts: ${values.priorRepairs || "Not supplied"}`,
  `Other contractors or active claims: ${values.otherParties || "Not supplied"}`,
  "",
  "The submitter confirmed accuracy, authority, contact consent, and that this preparation is not acceptance, an estimate, a contract, or a schedule reservation.",
].join("\n");

function FieldError({ errors, name }) {
  return errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
}

export function EstimateRequestForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const summaryRef = useRef(null);

  const setValue = (event) => {
    const { name, type, checked, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setResult(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setResult(null);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const eligibility = evaluateContractorEligibility(values.eligibility);
    if (eligibility.state === "blocked") {
      setResult({ state: "blocked" });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const reviewOnly = eligibility.state === "manual-review";
    const subject = reviewOnly ? "C&G inspection eligibility review" : `C&G project request — ${values.category}`;
    const href = `mailto:${business.contracting.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody(values, reviewOnly))}`;
    setResult({ state: reviewOnly ? "manual-review" : "eligible", href });
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const inputProps = (name) => ({
    name,
    value: values[name],
    onChange: setValue,
    required: requiredFields.includes(name),
    "aria-required": requiredFields.includes(name) || undefined,
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

  return (
    <form className="estimate-form" noValidate onSubmit={handleSubmit}>
      {Object.keys(errors).length ? <div className="error-summary" ref={summaryRef} tabIndex="-1" role="alert"><strong>Please review these fields.</strong><ul>{Object.entries(errors).map(([field, message]) => <li key={field}><a href={`#${field}`}>{message}</a></li>)}</ul></div> : null}
      {result?.state === "blocked" ? <div className="form-status form-status-blocked" ref={summaryRef} tabIndex="-1" role="status"><strong>This property is not eligible for a C&G contracting request.</strong><p>{separationPolicy.blocked}</p></div> : null}
      {result?.state === "manual-review" ? <div className="form-status form-status-manual" ref={summaryRef} tabIndex="-1" role="status"><strong>Manual eligibility review is required.</strong><p>No estimate or work date is promised. Use the link below to prepare an email asking C&G to confirm eligibility first.</p><a className="button button-graphite" href={result.href}>Prepare eligibility review email</a></div> : null}
      {result?.state === "eligible" ? <div className="form-status" ref={summaryRef} tabIndex="-1" role="status"><strong>Your project email is ready to prepare.</strong><p>Nothing has been sent or received. Opening the link below starts a draft in your email application. No work or appointment is scheduled.</p><a className="button button-graphite" href={result.href}>Prepare project request email</a></div> : null}

      <fieldset><legend>Contact</legend><div className="form-row"><label htmlFor="fullName">Full name<input id="fullName" autoComplete="name" {...inputProps("fullName")} /><FieldError errors={errors} name="fullName" /></label><label htmlFor="email">Email<input id="email" type="email" autoComplete="email" {...inputProps("email")} /><FieldError errors={errors} name="email" /></label></div><div className="form-row"><label htmlFor="phone">Phone<input id="phone" type="tel" autoComplete="tel" {...inputProps("phone")} /><FieldError errors={errors} name="phone" /></label><label htmlFor="contactMethod">Preferred contact method<select id="contactMethod" {...inputProps("contactMethod")}><option value="">Select one</option><option>Email</option><option>Phone</option></select><FieldError errors={errors} name="contactMethod" /></label></div></fieldset>

      <fieldset><legend>Property</legend><label htmlFor="address">Full property address<input id="address" autoComplete="street-address" {...inputProps("address")} /><FieldError errors={errors} name="address" /></label><div className="form-row"><label htmlFor="propertyType">Property type<select id="propertyType" {...inputProps("propertyType")}><option value="">Select one</option><option>Single-family residence</option><option>Condominium or townhome</option><option>Small residential multi-unit property</option><option>Other residential property</option></select><FieldError errors={errors} name="propertyType" /></label><label htmlFor="occupancy">Occupancy<select id="occupancy" {...inputProps("occupancy")}><option value="">Select one</option><option>Owner occupied</option><option>Tenant occupied</option><option>Vacant</option><option>Other</option></select><FieldError errors={errors} name="occupancy" /></label></div><label htmlFor="accessNotes">Access notes<textarea id="accessNotes" rows="3" {...inputProps("accessNotes")} /></label><label className="check-label"><input {...checkProps("authority")} /> I am the owner or authorized agent for this property.</label><FieldError errors={errors} name="authority" /></fieldset>

      <fieldset><legend>Project</legend><label htmlFor="category">Project category<select id="category" {...inputProps("category")}><option value="">Select one</option><option>Interior repair and finish work</option><option>Drywall and surface repair</option><option>Doors, trim, and finish carpentry</option><option>Punch-list coordination</option><option>Property maintenance and turnover work</option><option>Exterior details</option><option>Small multi-trade residential project</option><option>Other or not sure</option></select><FieldError errors={errors} name="category" /></label><label htmlFor="description">Plain-language description of the issue and desired result<textarea id="description" rows="5" {...inputProps("description")} /><FieldError errors={errors} name="description" /></label><div className="form-row"><label htmlFor="affectedAreas">Areas or rooms affected<input id="affectedAreas" {...inputProps("affectedAreas")} /><FieldError errors={errors} name="affectedAreas" /></label><label htmlFor="firstNoticed">When first noticed, if relevant<input id="firstNoticed" {...inputProps("firstNoticed")} /></label></div><div className="form-row"><label htmlFor="sourceStatus">Is the source condition active or resolved?<select id="sourceStatus" {...inputProps("sourceStatus")}><option value="">Select one</option><option>Active</option><option>Resolved</option><option>Unknown</option><option>Not applicable</option></select><FieldError errors={errors} name="sourceStatus" /></label><label htmlFor="timing">Desired timing and any true deadline<input id="timing" {...inputProps("timing")} /><FieldError errors={errors} name="timing" /></label></div><p className="form-help">Photos are not accepted through this basic form. Wait for a reply with an approved sharing path. Do not email alarm codes, financial documents, government IDs, payment cards, claim files, or unredacted inspection reports.</p></fieldset>

      <fieldset id="inspection-eligibility" className="eligibility-fieldset"><legend>Inspection eligibility</legend><label htmlFor="eligibility">Has C&amp;G prepared a home inspection report for this property during the previous 12 months?<select id="eligibility" {...inputProps("eligibility")}><option value="">Select one</option><option value="no">No</option><option value="yes">Yes</option><option value="unsure">Not sure</option></select><FieldError errors={errors} name="eligibility" /></label><p>{separationPolicy.notice}</p><label htmlFor="independentReport">Do you have a report from an independent inspector that you are authorized to share?<select id="independentReport" {...inputProps("independentReport")}><option value="">Select one if applicable</option><option>Yes</option><option>No</option><option>Not sure</option><option>Not applicable</option></select></label></fieldset>

      <fieldset><legend>Scope context</legend><label htmlFor="hazards">Known water, fire, structural, electrical, gas, pest, or hazardous-material concern<select id="hazards" {...inputProps("hazards")}><option value="">Select one</option><option>None known</option><option>Yes — describe above</option><option>Not sure</option></select><FieldError errors={errors} name="hazards" /></label><div className="form-row"><label htmlFor="permitStatus">Permit or plan status<select id="permitStatus" {...inputProps("permitStatus")}><option value="">Select one</option><option>Unknown</option><option>Not started</option><option>In process</option><option>Available</option></select><FieldError errors={errors} name="permitStatus" /></label><label htmlFor="designDocuments">Design or engineering documents<select id="designDocuments" {...inputProps("designDocuments")}><option value="">Select one</option><option>Yes</option><option>No</option><option>Not applicable</option></select><FieldError errors={errors} name="designDocuments" /></label></div><div className="form-row"><label htmlFor="materialPreference">Material preference<select id="materialPreference" {...inputProps("materialPreference")}><option value="">Select one</option><option>Match existing</option><option>Owner selected</option><option>Needs guidance</option><option>Unknown</option></select><FieldError errors={errors} name="materialPreference" /></label><label htmlFor="ownerMaterials">Owner-supplied materials<select id="ownerMaterials" {...inputProps("ownerMaterials")}><option value="">Select one</option><option>Yes</option><option>No</option><option>Unknown</option></select><FieldError errors={errors} name="ownerMaterials" /></label></div><label htmlFor="priorRepairs">Prior repair attempts<textarea id="priorRepairs" rows="3" {...inputProps("priorRepairs")} /></label><label htmlFor="otherParties">Other contractors or active claims involved<textarea id="otherParties" rows="3" {...inputProps("otherParties")} /></label></fieldset>

      <fieldset><legend>Consent</legend><label className="check-label"><input {...checkProps("accurate")} /> The information is accurate to my knowledge.</label><FieldError errors={errors} name="accurate" /><label className="check-label"><input {...checkProps("contactConsent")} /> I consent to contact about this project request.</label><FieldError errors={errors} name="contactConsent" /><label className="check-label"><input {...checkProps("noPromise")} /> I understand preparing this email is not acceptance, an estimate, a contract, or a schedule reservation.</label><FieldError errors={errors} name="noPromise" /><p className="form-help">See the <a href="/contracting/privacy/">contractor privacy notice</a>. This website has no server-side form receiver; it prepares an email in your own email application.</p></fieldset>

      <div className="form-submit-row"><button className="button button-copper" type="submit">Review and prepare email</button><p>Nothing is uploaded or sent when you select this button.</p></div>
    </form>
  );
}
