# Email configuration readiness

Public production contact remains **`clarencegloss@gmail.com`** until domain mailboxes are confirmed operational. Do not display inactive `@cginspection.net` addresses on the live site.

## Preferred domain addresses (provisional)

Configured in `shared/ownerReview.js` as `preferredEmails`:

| Address | Intended use | Status |
|---|---|---|
| `inspections@cginspection.net` | Inspection contact forms and inspection pages | Provisional until delivery verified |
| `contracting@cginspection.net` | Contracting estimate forms and contracting pages | Provisional until delivery verified |
| `contact@cginspection.net` | General / property-services chooser | Provisional until delivery verified |
| `clarencegloss@gmail.com` (`preferredEmails.liveFallback`) | Current production fallback | Live |

## Where live email is configured today

| Surface | Config location | Current public value |
|---|---|---|
| Inspection site identity | `shared/siteData.js` → `business.inspection.email` | `clarencegloss@gmail.com` |
| Contracting site identity | `shared/siteData.js` → `business.contracting.email` | `clarencegloss@gmail.com` |
| Inspection contact form mailto | `inspector-site-prototype/src/components/ContactRequestForm.jsx` uses `business.inspection.email` | Gmail fallback |
| Contracting estimate form mailto | `contractor-site-prototype/src/components/EstimateRequestForm.jsx` uses `business.contracting.email` | Gmail fallback |
| Footers / contact panels | Render `business.*.email` | Gmail fallback |
| Staging-only preferred-address note | Contact form when `OWNER_REVIEW_STAGING` is on | Mentions preferred domain addresses without switching production transport |

Form transport remains mailto until an approved secure endpoint is enabled in `shared/integrationAdapters.js` / form-transport registries.

## Safe switch procedure

1. Create and verify DNS / mailbox delivery for each preferred address.
2. Optionally configure Gmail (or another inbox) as a **behind-the-scenes forward** so Clarence still receives mail in one place.
3. Send test messages to each domain address and confirm:
   - delivery to the intended mailbox
   - spam handling
   - reply-from behavior
   - mobile and desktop clients
4. Update only the authoritative live fields in `shared/siteData.js`:
   - `business.inspection.email` → `inspections@cginspection.net` (or keep Gmail if forwarding-only)
   - `business.contracting.email` → `contracting@cginspection.net`
5. Keep `preferredEmails` in sync, then set status notes to verified when owner confirms.
6. Rebuild, run `npm run release:verify`, and spot-check:
   - inspection contact mailto recipient
   - contracting estimate mailto recipient
   - footer and privacy contact lines
7. Do **not** publish domain addresses on the site before step 3 succeeds.

## Testing checklist

- [ ] MX / SPF / DKIM / DMARC as required by the mailbox host
- [ ] Send from an external account to each domain address
- [ ] Confirm forwarding (if used) lands in Gmail or the chosen inbox
- [ ] Confirm form mailto drafts use the new recipients after config change
- [ ] Confirm no staging-only preferred-address copy appears in production HTML

## Photography / trust-asset slots related to contact polish

Replacement slots (still unpublished until approved) are listed in `shared/ownerReview.js` → `photographyReplacementSlots`, including Clarence portrait and project photography.
