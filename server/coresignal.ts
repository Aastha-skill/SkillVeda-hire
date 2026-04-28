const CORESIGNAL_API_KEY = process.env.CORESIGNAL_API_KEY || "";
const BASE_URL = "https://api.coresignal.com/cdapi/v2";

const ROLE_TITLE_MAP: Record<string, string[]> = {
  "Customer Success Manager": ["Customer Success Manager", "CSM", "Client Success Manager"],
  "Senior CSM": ["Senior Customer Success Manager", "Senior CSM"],
  "CS Associate": ["Customer Success Associate", "Customer Success Executive", "Customer Success Specialist"],
  "Technical CSM": ["Technical Customer Success Manager", "Technical Account Manager"],
  "CS Lead": ["Customer Success Lead", "CS Team Lead"],
  "Implementation Specialist": ["Implementation Specialist", "Onboarding Specialist"],
  "Customer Support Manager": ["Customer Support Manager", "Customer Service Manager"],
  "Customer Representative": ["Customer Success Representative", "Customer Support Executive"],
  "Renewal Manager": ["Renewal Manager", "Renewals Manager"],
  "CS Operations": ["Customer Success Operations", "CS Ops Manager"],
  "Head of CS": ["Head of Customer Success", "VP Customer Success", "Director of Customer Success"],
};

// ── SEARCH + PREVIEW (0 collect credits) ─────────────
// Uses es_dsl/preview — returns basic profile data
// NO collect credits used during search
async function searchAndPreview(
  title: string,
  city: string,
  minMonths: number,
  maxMonths: number,
  limit: number
): Promise<any[]> {

  const must: any[] = [
    { match: { active_experience_title: title } }
  ];

  const filter: any[] = [
    { term: { location_country_iso2: "IN" } },
    { term: { is_deleted: 0 } },
    { term: { is_working: 1 } },
    {
      range: {
        total_experience_duration_months: {
          gte: minMonths,
          lte: maxMonths,
        }
      }
    }
  ];

  if (city?.trim()) {
    filter.push({ match: { location_city: city.trim() } });
  }

  const query = {
    query: { bool: { must, filter } }
  };

  try {
    console.log(`[Coresignal] Preview search: "${title}"`);

    const res = await fetch(
      `${BASE_URL}/employee_multi_source/search/es_dsl/preview`,
      {
        method: "POST",
        headers: {
          "apikey": CORESIGNAL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      }
    );

    const text = await res.text();
    console.log(`[Coresignal] Preview status: ${res.status}`);

    if (!res.ok) {
      console.error(`[Coresignal] Preview error "${title}":`, res.status, text.substring(0, 200));
      return [];
    }

    const profiles: any[] = JSON.parse(text);
    console.log(`[Coresignal] "${title}" → ${profiles.length} preview profiles`);

    // Return only what we need
    return profiles.slice(0, limit);

  } catch (e) {
    console.error(`[Coresignal] Preview failed "${title}":`, e);
    return [];
  }
}

// ── FULL COLLECT (only on unlock) ────────────────────
// Called when company pays 1 credit to unlock a candidate
// Returns full profile with email
export async function collectFullProfile(
  coresignalId: string
): Promise<any | null> {
  console.log(`[Coresignal] Full collect for ID: ${coresignalId}`);

  try {
    const res = await fetch(
      `${BASE_URL}/employee_multi_source/collect/${coresignalId}`,
      {
        method: "GET",
        headers: { "apikey": CORESIGNAL_API_KEY },
      }
    );

    if (!res.ok) {
      console.error("[Coresignal] Collect error:", res.status);
      return null;
    }

    const profile = await res.json();
    console.log(`[Coresignal] Collected: ${profile.full_name}`);
    return profile;

  } catch (e) {
    console.error("[Coresignal] Collect failed:", e);
    return null;
  }
}

// ── MAP PREVIEW → candidate format ───────────────────
export function mapPreviewToCandidate(profile: any) {
  const expYears = Math.round(
    (profile.total_experience_duration_months || 0) / 12
  );

  // Build summary from preview fields
  const summaryParts = [
    profile.headline || "",
    profile.active_experience_description
      ? `Current role: ${profile.active_experience_description}`
      : "",
    profile.summary || "",
  ].filter(Boolean);

  return {
    id: String(profile.id),
    coresignalId: String(profile.id),
    name: profile.full_name || "Unknown",
    linkedinUrl: profile.linkedin_url || "",
    profilePhoto: profile.picture_url || "",
    jobTitle: profile.active_experience_title || profile.headline || "",
    employer: profile.company_name || "",
    location: profile.location_full || profile.location_city || "India",
    experienceYears: String(expYears),
    aiSummary: summaryParts.join("\n"),
    skills: profile.inferred_skills || [],
    email: null,
    phone: null,
    noticePeriod: "30 days",
    estimatedSalary: "Not disclosed",
    matchScore: "Medium" as const,
    aiScore: 50,
    tier: 3 as const,
    breakdown: {},
    strengths: [],
    gaps: [],
    hiringRecommendation: "Maybe" as const,
    standoutSignal: "",
    dealBreakerTriggered: false,
    isPreviewOnly: true,
  };
}

export const mapToCandidate = mapPreviewToCandidate;

// ── MAP FULL PROFILE (after unlock) ──────────────────
export function mapFullProfile(profile: any) {
  const currentExp = profile.experience?.find(
    (e: any) => e.active_experience === 1
  );
  const expYears = Math.round(
    (profile.total_experience_duration_months || 0) / 12
  );

  const workHistory = (profile.experience || [])
    .slice(0, 4)
    .map((e: any) =>
      `${e.position_title} at ${e.company_name} (${e.duration_months} months)` +
      `${e.description ? ": " + e.description : ""}`
    )
    .join("\n");

  const certifications = (profile.certifications || [])
    .map((c: any) => c.title)
    .join(", ");

  return {
    id: String(profile.id),
    coresignalId: String(profile.id),
    name: profile.full_name || "Unknown",
    linkedinUrl: profile.linkedin_url || "",
    profilePhoto: profile.picture_url || "",
    jobTitle: currentExp?.position_title || profile.headline || "",
    employer: currentExp?.company_name || "",
    location: profile.location_full || profile.location_city || "India",
    experienceYears: String(expYears),
    aiSummary: [
      profile.summary || profile.headline || "",
      workHistory ? `\nWORK HISTORY:\n${workHistory}` : "",
      certifications ? `\nCERTIFICATIONS: ${certifications}` : "",
    ].filter(Boolean).join("\n"),
    skills: profile.inferred_skills || [],
    email: profile.primary_professional_email || null,
    phone: null,
    noticePeriod: "30 days",
    estimatedSalary: "Not disclosed",
    certifications: (profile.certifications || []).map((c: any) => c.title),
    isPreviewOnly: false,
  };
}

// ── MAIN SEARCH FUNCTION ──────────────────────────────
// OPTIMIZED: Uses preview only — 0 collect credits on search
// Collect only happens on unlock (company pays 1 credit)
export async function findCandidates(params: {
  roleType: string;
  managementLevel?: string;
  minYears: number;
  maxYears: number;
  city: string;
  limit?: number;
}): Promise<any[]> {

  const limit = params.limit || 20;
  const titles = ROLE_TITLE_MAP[params.roleType] || [params.roleType];
  const perTitle = Math.ceil(limit / titles.length) + 2;

  console.log("[Coresignal] === SEARCH START (optimized) ===");
  console.log("[Coresignal] Key length:", CORESIGNAL_API_KEY.length);
  console.log("[Coresignal] Mode: Preview only — 0 collect credits");
  console.log("[Coresignal] Titles:", titles);

  if (!CORESIGNAL_API_KEY) {
    console.error("[Coresignal] NO API KEY");
    return [];
  }

  // Search + preview for each title variation
  const allProfiles = new Map<string, any>();

  for (const title of titles) {
    if (allProfiles.size >= limit) break;

    const previews = await searchAndPreview(
      title,
      params.city,
      params.minYears * 12,
      params.maxYears * 12,
      perTitle
    );

    // Deduplicate by ID
    for (const p of previews) {
      if (!allProfiles.has(String(p.id))) {
        allProfiles.set(String(p.id), p);
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  const profiles = Array.from(allProfiles.values()).slice(0, limit);
  console.log(`[Coresignal] Total unique preview profiles: ${profiles.length}`);

  if (profiles.length === 0) return [];

  // Map to candidate format
  const candidates = profiles.map(mapPreviewToCandidate);

  console.log(`[Coresignal] ✅ ${candidates.length} candidates ready for scoring`);
  console.log("[Coresignal] Cost: 0 collect credits (preview only)");
  console.log("[Coresignal] === SEARCH END ===");

  return candidates;
}
