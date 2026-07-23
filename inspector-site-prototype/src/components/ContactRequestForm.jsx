import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { business } from "../../../shared/siteData.js";

const requiredFields = ["name", "email", "address", "propertyType", "purpose", "preferredWindow", "occupancy", "consent"];

const labelByField = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  address: "Property address",
  propertyType: "Property type",
  purpose: "Inspection purpose",
  preferredWindow: "Preferred date or time window",
  occupancy: "Occupancy",
  consent: "Contact consent",
};

export function ContactRequestForm() {
  const [errors, setErrors] = useState({});
  const [preparedEmail, setPreparedEmail] = useState(null);
  const [preferredContact, setPreferredContact] = useState("email");
  const errorSummaryRef = useRef(null);
  const preparedStateRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = {};

    for (const field of requiredFields) {
      if (!String(form.get(field) || "").trim()) nextErrors[field] = `${labelByField[field]} is required.`;
    }
    const email = String(form.get("email") || "").trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter an email address in the format name@example.com.";
    if (form.get("preferredContact") === "phone" && !String(form.get("phone") || "").trim()) {
      nextErrors.phone = "Phone is required when phone follow-up is selected.";
    }
    if (form.get("consent") !== "yes") nextErrors.consent = "Confirm that C&G may contact you about this request.";

    if (Object.keys(nextErrors).length) {
      setPreparedEmail(null);
      setErrors(nextErrors);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setErrors({});
    const subject = `Inspection request — ${form.get("address")}`;
    const body = [
      `Name: ${form.get("name")}`,
      `Email: ${form.get("email")}`,
      `Phone: ${form.get("phone") || "Not provided"}`,
      `Preferred contact: ${form.get("preferredContact")}`,
      `Property address: ${form.get("address")}`,
      `Property type: ${form.get("propertyType")}`,
      `Approximate square footage: ${form.get("squareFootage") || "Not provided"}`,
      `Inspection purpose: ${form.get("purpose")}`,
      `Preferred window: ${form.get("preferredWindow")}`,
      `Occupancy: ${form.get("occupancy")}`,
      "",
      "Access or deadline notes:",
      form.get("notes") || "None provided",
    ].join("\n");
    setPreparedEmail(`mailto:${business.inspection.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    window.requestAnimationFrame(() => preparedStateRef.current?.focus());
  };

  const errorFor = (name) => errors[name] ? <span className="field-error" id={`inspection-${name}-error`}>{errors[name]}</span> : null;
  const fieldState = (name) => {
    const required = requiredFields.includes(name) || (name === "phone" && preferredContact === "phone");
    return {
      required,
      "aria-required": required || undefined,
      "aria-invalid": errors[name] ? "true" : undefined,
      "aria-describedby": errors[name] ? `inspection-${name}-error` : undefined,
    };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPreparedEmail(null);
    if (name === "preferredContact") setPreferredContact(value);
    if (!name) return;
    setErrors((current) => {
      if (!current[name] && !(name === "preferredContact" && value === "email" && current.phone)) return current;
      const next = { ...current };
      delete next[name];
      if (name === "preferredContact" && value === "email") delete next.phone;
      return next;
    });
  };

  return (
    <form className="request-form" onSubmit={handleSubmit} onChange={handleChange} noValidate data-testid="inspection-contact-form" aria-labelledby="inspection-request">
      <div className="request-form-heading">
        <p className="eyebrow eyebrow-dark">Request details</p>
        <h2 id="inspection-request" tabIndex="-1">Start your inspection request.</h2>
        <p>Required fields are marked with an asterisk. This page checks the details locally and prepares an email draft; it does not send or store the request.</p>
      </div>

      {Object.keys(errors).length ? (
        <div className="form-error-summary" ref={errorSummaryRef} tabIndex="-1" role="alert" aria-labelledby="inspection-error-summary-title">
          <h3 id="inspection-error-summary-title">Review the request details</h3>
          <ul>{Object.entries(errors).map(([field, message]) => <li key={field}><a href={`#inspection-${field}`}>{message}</a></li>)}</ul>
        </div>
      ) : null}

      <fieldset className="request-form-group">
        <legend>Contact</legend>
        <div className="form-row">
          <label htmlFor="inspection-name">Name <span aria-hidden="true">*</span></label>
          <input id="inspection-name" name="name" type="text" autoComplete="name" {...fieldState("name")} />
          {errorFor("name")}
        </div>
        <div className="form-grid-two">
          <div className="form-row">
            <label htmlFor="inspection-email">Email <span aria-hidden="true">*</span></label>
            <input id="inspection-email" name="email" type="email" autoComplete="email" inputMode="email" {...fieldState("email")} />
            {errorFor("email")}
          </div>
          <div className="form-row">
            <label htmlFor="inspection-phone">Phone {preferredContact === "phone" ? <><span aria-hidden="true">*</span> <span className="field-optional">Required for phone follow-up</span></> : <span className="field-optional">Optional unless phone follow-up is selected</span>}</label>
            <input id="inspection-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" {...fieldState("phone")} />
            {errorFor("phone")}
          </div>
        </div>
        <div className="form-choice-row" role="group" aria-labelledby="inspection-preferred-contact-label">
          <span id="inspection-preferred-contact-label">Preferred contact method</span>
          <label><input type="radio" name="preferredContact" value="email" defaultChecked /> Email</label>
          <label><input type="radio" name="preferredContact" value="phone" /> Phone</label>
        </div>
      </fieldset>

      <fieldset className="request-form-group">
        <legend>Property</legend>
        <div className="form-row">
          <label htmlFor="inspection-address">Full property address <span aria-hidden="true">*</span></label>
          <input id="inspection-address" name="address" type="text" autoComplete="street-address" {...fieldState("address")} />
          {errorFor("address")}
        </div>
        <div className="form-grid-two">
          <div className="form-row">
            <label htmlFor="inspection-propertyType">Property type <span aria-hidden="true">*</span></label>
            <input id="inspection-propertyType" name="propertyType" type="text" placeholder="Describe the residential property type" {...fieldState("propertyType")} />
            {errorFor("propertyType")}
          </div>
          <div className="form-row">
            <label htmlFor="inspection-squareFootage">Approximate square footage <span className="field-optional">Optional</span></label>
            <input id="inspection-squareFootage" name="squareFootage" type="text" inputMode="numeric" />
          </div>
        </div>
      </fieldset>

      <fieldset className="request-form-group">
        <legend>Timing and context</legend>
        <div className="form-grid-two">
          <div className="form-row">
            <label htmlFor="inspection-purpose">Inspection purpose <span aria-hidden="true">*</span></label>
            <select id="inspection-purpose" name="purpose" defaultValue="" {...fieldState("purpose")}>
              <option value="" disabled>Select one</option>
              <option>Buying a home</option>
              <option>Preparing to sell</option>
              <option>Homeowner planning</option>
              <option>Other property decision</option>
            </select>
            {errorFor("purpose")}
          </div>
          <div className="form-row">
            <label htmlFor="inspection-occupancy">Occupancy <span aria-hidden="true">*</span></label>
            <select id="inspection-occupancy" name="occupancy" defaultValue="" {...fieldState("occupancy")}>
              <option value="" disabled>Select one</option>
              <option>Occupied</option>
              <option>Vacant</option>
              <option>Unknown</option>
            </select>
            {errorFor("occupancy")}
          </div>
        </div>
        <div className="form-row">
          <label htmlFor="inspection-preferredWindow">Preferred date or time window <span aria-hidden="true">*</span></label>
          <input id="inspection-preferredWindow" name="preferredWindow" type="text" placeholder="Include any true transaction deadline" {...fieldState("preferredWindow")} />
          {errorFor("preferredWindow")}
        </div>
        <div className="form-row">
          <label htmlFor="inspection-notes">Access or deadline notes <span className="field-optional">Optional</span></label>
          <textarea id="inspection-notes" name="notes" rows="5" placeholder="Include known access limitations, utility status, or additional structures." />
        </div>
        <div className="form-consent-row">
          <label htmlFor="inspection-consent">
            <input id="inspection-consent" name="consent" type="checkbox" value="yes" {...fieldState("consent")} />
            <span>I consent to being contacted about this inspection request. A request is not a confirmed appointment.</span>
          </label>
          {errorFor("consent")}
        </div>
        <p className="form-privacy-note">Do not include lockbox codes, alarm codes, financial records, offer documents, or a full inspection report. See the <a href="/privacy/">privacy notice</a>.</p>
      </fieldset>

      <button className="button button-gold" type="submit">Prepare email <ArrowRight size={17} aria-hidden="true" /></button>

      {preparedEmail ? (
        <div className="form-prepared-state" ref={preparedStateRef} tabIndex="-1" role="status" aria-labelledby="inspection-prepared-title" data-testid="inspection-prepared-state">
          <h3 id="inspection-prepared-title">Your inspection request is prepared.</h3>
          <p>An appointment is not confirmed until C&G reviews the property, scope, availability, and price with you. Nothing has been sent yet.</p>
          <a className="button button-dark" href={preparedEmail}>Open your email app</a>
        </div>
      ) : null}
    </form>
  );
}
