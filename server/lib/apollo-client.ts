// Apollo /api/v1/people/match — email-only enrichment.
// Phone reveal requires async webhook_url and is V2; do not add it here.

const APOLLO_MATCH_URL = "https://api.apollo.io/api/v1/people/match";
const APOLLO_TIMEOUT_MS = 15_000;
const EMAIL_NOT_UNLOCKED_SENTINEL = "email_not_unlocked";

export interface ApolloMatchInput {
  linkedinUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
}

export interface ApolloMatchResult {
  matched: boolean;
  email: string | null;
  emailStatus: string | null;
  rawResponse: any;
}

export class ApolloError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Apollo request failed (${status}): ${body.slice(0, 200)}`);
    this.name = "ApolloError";
    this.status = status;
    this.body = body;
  }
}

function isRealEmail(email: unknown): email is string {
  return typeof email === "string"
    && email.length > 0
    && !email.toLowerCase().includes(EMAIL_NOT_UNLOCKED_SENTINEL);
}

export async function matchPersonEmail(input: ApolloMatchInput): Promise<ApolloMatchResult> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) throw new ApolloError(401, "APOLLO_API_KEY not set");

  const body: Record<string, unknown> = { reveal_personal_emails: true };
  if (input.linkedinUrl) body.linkedin_url = input.linkedinUrl;
  if (input.firstName) body.first_name = input.firstName;
  if (input.lastName) body.last_name = input.lastName;
  if (input.organizationName) body.organization_name = input.organizationName;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), APOLLO_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(APOLLO_MATCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApolloError(res.status, text);
  }

  const data: any = await res.json();
  const person = data?.person;

  if (!person) {
    return { matched: false, email: null, emailStatus: null, rawResponse: data };
  }

  // email_status may be missing/null even on matched persons — treat as null,
  // never infer "verified" from absence.
  const rawStatus = person.email_status;
  const emailStatus: string | null = typeof rawStatus === "string" && rawStatus.length > 0
    ? rawStatus
    : null;

  const primaryEmail: unknown = person.email;
  if (isRealEmail(primaryEmail)) {
    return { matched: true, email: primaryEmail, emailStatus, rawResponse: data };
  }

  const personal: unknown = person.personal_emails;
  if (Array.isArray(personal)) {
    const fallback = personal.find(isRealEmail);
    if (fallback) {
      return { matched: true, email: fallback, emailStatus, rawResponse: data };
    }
  }

  return { matched: false, email: null, emailStatus, rawResponse: data };
}
