const vocabulary = {
  inspector: {
    suggestions: [
      "Roof and attic",
      "Electrical panel",
      "Water heater",
      "Inspection report",
      "Visible and accessible",
    ],
    groups: [
      {
        aliases: ["ac", "a/c", "air conditioner", "air conditioning", "hvac"],
        expansions: ["heating and cooling", "air conditioning"],
      },
      {
        aliases: ["breaker box", "breaker panel", "electrical box", "electrical panel"],
        expansions: ["electrical panel", "breakers and wiring"],
      },
      {
        aliases: ["hot water", "hot water tank", "water tank", "water heater"],
        expansions: ["water heater", "water heating"],
      },
      {
        aliases: ["crawl space", "crawlspace", "foundation"],
        expansions: ["foundation and crawlspace", "structure"],
      },
      {
        aliases: ["inspection results", "inspection report", "report"],
        expansions: ["inspection report", "findings and follow-up"],
      },
      {
        aliases: ["coverage", "inspection scope", "scope", "what is inspected"],
        expansions: ["visible and accessible", "inspection limitations"],
      },
    ],
  },
  contractor: {
    suggestions: [
      "Drywall repair",
      "Doors and trim",
      "Estimate process",
      "Permits and scope",
      "12-month eligibility",
    ],
    groups: [
      {
        aliases: ["bid", "cost", "price", "pricing", "quote"],
        expansions: ["estimate process", "project scope"],
      },
      {
        aliases: ["ceiling repair", "sheetrock", "wall repair"],
        expansions: ["drywall and surface repair", "wall and ceiling surfaces"],
      },
      {
        aliases: ["baseboard", "baseboards", "carpentry", "molding", "trim"],
        expansions: ["doors trim and finish carpentry", "finish details"],
      },
      {
        aliases: ["permit", "permits"],
        expansions: ["permits and scope", "project requirements"],
      },
      {
        aliases: ["12 month", "12-month", "eligibility", "inspection report"],
        expansions: ["12-month eligibility", "inspection eligibility"],
      },
      {
        aliases: ["remodel", "remodeling", "renovation"],
        expansions: ["repair and improvement project", "project planning"],
      },
    ],
  },
};

const normalize = (value) => value.trim().replace(/\s+/g, " ");
const comparable = (value) => normalize(value).toLocaleLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const includesAlias = (query, alias) => {
  const phrase = escapeRegex(alias).replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${phrase}([^a-z0-9]|$)`, "i").test(query);
};

export const searchSuggestions = Object.freeze({
  inspector: Object.freeze([...vocabulary.inspector.suggestions]),
  contractor: Object.freeze([...vocabulary.contractor.suggestions]),
});

export function expandedSearchTerms(surface, rawQuery) {
  const term = normalize(rawQuery);
  const surfaceVocabulary = vocabulary[surface];
  if (!term || !surfaceVocabulary) return term ? [term] : [];

  const seen = new Set([comparable(term)]);
  const expanded = [term];
  for (const group of surfaceVocabulary.groups) {
    if (!group.aliases.some((alias) => includesAlias(term, alias))) continue;
    for (const candidate of group.expansions) {
      const key = comparable(candidate);
      if (seen.has(key)) continue;
      seen.add(key);
      expanded.push(candidate);
    }
  }
  return expanded.slice(0, 5);
}

export function dedupeSearchRecords(records, limit = 10) {
  const seen = new Set();
  const unique = [];
  for (const record of records) {
    const key = record?.url || record?.meta?.title;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(record);
    if (unique.length === limit) break;
  }
  return unique;
}
