export const inspectorFaqGroups = [
  {
    title: "Planning and scheduling",
    items: [
      ["What does a home inspection include?", "A home inspection is a visual, non-invasive review of major visible and accessible systems and components. The property-specific agreement defines the final scope. Common areas include the site, exterior, roof, structure, electrical, plumbing, heating and cooling, water heater, interior rooms, kitchen, bathrooms, laundry, attic, crawlspace, and garage."],
      ["How much does an inspection cost?", "Pricing depends on details such as property type, size, age, location, occupancy, additional structures, and any optional add-ons. Share the address and known property details for a quote before scheduling."],
      ["How long does an inspection take?", "The time depends on the property's size, age, condition, systems, access, and inspection scope. C&G will provide a scheduling window rather than a universal duration promise."],
      ["How do I schedule?", "Use the contact page, call (310) 505-6581, or email clarencegloss@gmail.com. Provide the property address, property type, approximate size, desired date, and reason for the inspection. A request is not confirmed until C&G accepts the time and scope."],
      ["Do you offer weekend appointments?", "Weekend availability depends on the property, travel, and existing schedule. Share the timing you need and C&G will confirm what can be offered for that request."],
      ["What property types do you inspect?", "Residential single-family, condominium, townhome, and similar properties are commonly reviewed. Specialty property acceptance is confirmed property by property before scheduling."],
    ],
  },
  {
    title: "Before the inspection",
    items: [
      ["How should the property be prepared?", "Utilities should be on when safe and authorized. Provide access to electrical panels, the attic, crawlspace, water heater, HVAC equipment, garages, gates, and other included areas. Move storage away from key systems, unlock access points, and secure pets. The inspector does not move heavy furniture or personal belongings."],
      ["Should I inspect a newer or remodeled home?", "Age alone does not show whether visible conditions, installation concerns, incomplete work, or maintenance needs are present. An inspection can provide useful documentation, but it is not a code-compliance or permit-history certification."],
      ["Should the seller be present?", "Attendance and access arrangements are usually coordinated through the parties and real-estate professionals involved. The property must be available for the agreed inspection without creating a conflict or unsafe condition."],
      ["What if utilities are off or an area is locked?", "The inspector documents the limitation and does not operate systems that lack necessary service or authorization. Depending on the importance of the inaccessible area, the client may need to arrange a return visit under separately agreed terms."],
    ],
  },
  {
    title: "During the inspection",
    items: [
      ["May I attend?", "Clients are encouraged to discuss attendance when scheduling. On-site questions can be helpful, but access, occupancy, safety, and transaction rules still apply. Follow the inspector's direction around ladders, roofs, electrical equipment, crawlspaces, and other hazards."],
      ["Will every outlet, window, and component be tested?", "The inspection follows the signed agreement and applicable standard of practice. Some components may be sampled or inaccessible. The report should make significant limitations clear."],
      ["Do you use special tools?", "The inspection remains a visual, non-invasive review under the signed agreement. Tools that support an observation do not turn the service into destructive testing, engineering analysis, or a guarantee that a concealed condition will be found."],
      ["Do you walk on the roof or enter the crawlspace?", "Only when access and conditions are reasonably safe. Height, slope, material, weather, opening size, clearance, water, animals, suspected hazards, and observed damage can limit access. Alternative vantage points may be used."],
    ],
  },
  {
    title: "Reports and decisions",
    items: [
      ["When will I receive the report?", "C&G confirms the expected report delivery window when the inspection is scheduled. Timing depends on property size, complexity, access, and the agreed scope."],
      ["What is included in the report?", "The report identifies inspected systems and components, visible observations, material concerns, relevant photographs, recommendations, and important limitations. A summary helps with navigation but does not replace the full report."],
      ["Will the inspector tell me whether to buy the home?", "No. The inspector provides information about observed conditions. The purchase decision belongs to the client in consultation with the appropriate real-estate, legal, financial, insurance, and specialist advisers."],
      ["Is the inspection pass/fail?", "No. A home inspection documents conditions at a point in time. It is not a code-enforcement approval, warranty, appraisal, or pass/fail certification."],
      ["Can I ask questions after reading the report?", "Yes. Contact C&G with the report section and question so the observation and recommendation can be discussed in context."],
      ["Does the report include repair prices?", "The inspection may explain priority or recommend evaluation, but it is not a contractor bid. Obtain independent written estimates from appropriately qualified providers. C&G's separate contracting service cannot offer or perform repairs on a property C&G inspected during the previous 12 months."],
    ],
  },
  {
    title: "Scope and limitations",
    items: [
      ["Can an inspection find hidden defects?", "No inspection can reveal every concealed condition. Walls, ceilings, floors, insulation, stored belongings, finishes, underground systems, and equipment housings can limit what is visible. The report documents known limitations and may recommend further evaluation."],
      ["Is this a code-compliance inspection?", "No. The inspector may note safety or installation concerns, but the service does not certify compliance with current or past codes, permits, manufacturer instructions, or local enforcement requirements."],
      ["Do you inspect pools, spas, sewer lines, solar, mold, or termites?", "Specialty evaluations such as sewer, solar, mold, termite, and specialist pool or spa inspections require a separate qualified provider unless specifically approved and included in the signed agreement."],
      ["Does an inspection guarantee future condition?", "No. Systems can fail after the inspection, and conditions can change. The report describes observations made at the time under the conditions then present."],
      ["Do you inspect everything behind furniture or stored items?", "No. The inspector does not move heavy furniture, appliances, personal belongings, stored materials, or finishes. Blocked areas are limitations."],
    ],
  },
  {
    title: "Service area and follow-up",
    items: [
      ["What areas do you serve?", "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation."],
      ["What are your business hours?", "Contact C&G by phone or email with the property details and preferred timing. Availability and response expectations are confirmed for each request."],
      ["Can C&G repair items found in the inspection?", "No repair offer or work may be provided by C&G Contracting Services on a property for which C&G prepared a home inspection report during the previous 12 months. Use independent contractors during that period."],
      ["Can my agent receive the report?", "The client controls report sharing subject to the agreement and applicable transaction requirements. Obtain clear client authorization before sending the report to another person."],
    ],
  },
];

export const inspectorFaqItems = inspectorFaqGroups.flatMap((group) =>
  group.items.map(([question, answer]) => ({ question, answer, group: group.title })),
);
