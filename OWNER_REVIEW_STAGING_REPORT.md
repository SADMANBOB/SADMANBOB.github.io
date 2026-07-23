# C&G owner-review staging report

Generated: 2026-07-23T21:25:12.881Z

## Operating instructions

### Enable owner-review staging locally

```bash
OWNER_REVIEW_STAGING=1 VITE_OWNER_REVIEW_STAGING=1 npm run build:owner-review
# or
npm run build:owner-review
```

Serve the assembled site:

```bash
OWNER_REVIEW_STAGING=1 VITE_OWNER_REVIEW_STAGING=1 npm run build && cd _site && python3 -m http.server 4177
```

Then open http://127.0.0.1:4177/

### Produce a production-safe build

```bash
# Staging must be unset / not 1|true|yes
npm run build
```

`OWNER_REVIEW_STAGING_VISIBLE` defaults **off**. Do not leave staging env vars set in CI or deploy scripts.

### Confirm staging content is absent from production output

1. Build with staging unset.
2. Confirm `_site/index.html` and `_site/contracting/index.html` omit `owner-review-banner`, `provisional-label`, legacy feedback copy, preferred domain emails, and the sample-report route.
3. Confirm `_site/sitemap.xml` does not list `/sample-report/`.
4. Run `npm run verify` and expect the production isolation asserts to pass.

### Promote individual claims and reviews after owner approval

1. Move approved claim status to approved / verified with evidence fields filled.
2. Promote individual legacy reviews to status=approved with exactApprovedText, publicationPermissionAt, allowedSurfaces, and displayAttribution.
3. Approve customerTestimonials claim only after reviews are source-backed.
4. Add redacted sample PDF to the sample-report registry and set status=approved.
5. Switch public email only after preferred domain mailboxes are confirmed operational.
6. Keep infrared/moisture claims productionVisible:false unless intentionally published.

### Disable staging mode before deployment

Unset OWNER_REVIEW_STAGING and VITE_OWNER_REVIEW_STAGING (or set them to 0). Deploy only from a production-safe npm run build / npm run release:verify on main.

## Summary

- Staging visible while generating this report: yes (report script forces staging on)
- Verified service areas: los-angeles-county, riverside-county
- Production-approved reviews: 0
- Legacy reviews shown in staging: 20
- Provisional claims: 11
- Inspector area pages: 2
- Contractor area pages: 2

## Verified geography

- **Los Angeles County** (`los-angeles-county`) — 19 representative communities
- **Riverside County** (`riverside-county`) — 6 representative communities

## Legacy feedback pending confirmation

Status on every imported review: `legacy_pending_owner_confirmation`

1. 5/5 — M.R., Homebuyer, Compton, California
   > Clarence was extremely thorough and explained everything clearly. The same-day report helped us close confidently.

2. 5/5 — J.T., Realtor, Riverside County
   > As an agent, I value inspectors who communicate well. C&G is my go-to in Riverside County.

3. 5/5 — D.G., Buyers, Los Angeles, California
   > His construction experience really shows. Caught issues other inspectors missed.

4. 5/5 — L.V., Investor, Long Beach, California
   > Very detailed, honest, and professional. Arrived early and delivered fast.

5. 5/5 — N.R., Buyer, Hawthorne, California
   > Great communication and very friendly. Made the whole process easy.

6. 4/5 — R.A., Investor, Inglewood, California
   > Very professional and knowledgeable. Would have liked a bit more detail on one item, but overall excellent.

7. 4/5 — K.D., Homeowner, Bellflower, California
   > Quick turnaround and a solid report. Would definitely use again.

8. 5/5 — J.P., Realtor, Norwalk, California
   > Clarence is dependable and consistent. My clients always appreciate his work.

9. 5/5 — M.C., First-Time Buyer, Paramount, California
   > He explained what was urgent, what could wait, and helped us budget our repairs.

10. 3/5 — T.H., Buyer, Riverside County
   > Solid inspection. A bit more photos would’ve helped, but still very good overall.

11. 5/5 — E.F., Buyer, Lynwood, California
   > Friendly, honest, and extremely thorough. Highly recommend.

12. 4/5 — B.P., Homeowner, Downey, California
   > Great service and fast scheduling. Everything was smooth.

13. 5/5 — S.K., Agent, Compton, California
   > Very detailed report. Worth every penny.

14. 3/5 — W.L., Homeowner, Carson, California
   > Good inspection overall. A little shorter than expected, but still clear and helpful.

15. 5/5 — J.S., Buyer, Los Angeles, California
   > Fast, professional, and very clear. You can tell he cares about his work.

16. 5/5 — D.M., Homeowner, Compton, California
   > Straightforward, honest, and reliable. Highly recommend.

17. 4/5 — S.T., Buyer, Ontario, California
   > Report was easy to read and well organized.

18. 5/5 — C.F., Buyer, Gardena, California
   > Very thorough! Helped us avoid a bad purchase.

19. 5/5 — R.B., Homeowner, Torrance, California
   > Professional, respectful, and extremely detail-oriented.

20. 4/5 — L.H., Buyer, Bell Gardens, California
   > Great experience. Would recommend to anyone buying an older home.

## Provisional business details requiring approval

- `internachiCertification`: Professional home inspection credentials and continuing-education details are being finalized for publication.
- `generalLiabilityInsurance`: Insurance and professional coverage details are available upon confirmation and will be published after owner review.
- `errorsAndOmissionsInsurance`: Insurance and professional coverage details are available upon confirmation and will be published after owner review.
- `nextDayReports`: Most inspection reports are delivered within 24 hours. Larger, more complex, or specialty properties may require up to 48 hours.
- `weekendAvailability`: Saturday appointments are available. Limited Sunday appointments may be available by request.
- `responseTime`: Calls, emails, and website inquiries are typically answered within one business day.
- `clarenceBiography`: Clarence Gloss brings a practical, construction-informed perspective to property inspections and residential improvement work. His approach emphasizes careful observation, clear communication, and helping clients understand which findings require immediate attention and which can be planned for over time. Through C&G Certified Home Inspector and C&G Contracting Services, Clarence works with homeowners, buyers, sellers, agents, investors, and property professionals across Los Angeles and Riverside counties.
- `poolSpaInspection` (hidden from ordinary production surfaces): Visible pool and spa components may be observed as an optional add-on when access, conditions, and scheduling allow. This is not a specialist pool inspection unless explicitly arranged.
- `manufacturedHomes` (hidden from ordinary production surfaces): Manufactured-home inspections may be accepted after property-specific review. Scope and access requirements must be confirmed before scheduling.
- `moistureMeters` (hidden from ordinary production surfaces): Moisture meters may be used when conditions warrant to support observations of suspected moisture intrusion. Readings are limited to accessible areas and are not a guarantee that hidden moisture is absent.
- `infraredImaging` (hidden from ordinary production surfaces): Infrared imaging may be used when available and appropriate as a supplemental observation tool. It does not replace invasive testing or specialist evaluation.

### Preferred emails (provisional)

- inspections@cginspection.net
- contracting@cginspection.net
- contact@cginspection.net

Preferred domain mailboxes stay provisional until confirmed operational. Public forms continue to use the current Gmail fallback.

## Production gates that remain closed

- getApprovedReviews remains empty until status=approved + customerTestimonials claim approved
- claimIsApproved ignores provisional_owner_review and legacy_pending_owner_confirmation
- sampleReportIsApproved remains false until a redacted PDF record is approved
- secure form transports remain mailto until HTTPS endpoints are approved
- preferred domain emails are provisional; Gmail remains the live public fallback

## Owner approval checklist

1. Confirm LA County and Riverside County wording and community lists
2. Approve or revise each of the 20 legacy feedback entries
3. Approve report turnaround, hours, weekend, and response-time wording
4. Supply credential organization/number/URL or keep credentials unpublished
5. Supply insurance wording with evidence or keep insurance unpublished
6. Approve or revise Clarence biography
7. Decide pool/spa, manufactured homes, moisture meters, and infrared publication
8. Provide redacted sample-report PDF
9. Confirm domain email addresses are operational before switching from Gmail
10. Approve HTTPS form processor endpoint and privacy policy
11. Replace editorial photography using documented slots
12. Approve typical contractor project category list
