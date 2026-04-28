export async function sendCampaignEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY is not configured');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SkillVeda', email: 'Hello@skillveda.ai' },
        to: [{ email: to }],
        subject,
        htmlContent: htmlBody,
        tracking: {
          clicks: true,
          opens: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.message || `HTTP ${response.status}`;
      console.error(`Failed to send email to ${to}:`, msg);
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export function personalizeEmail(
  body: string,
  variables: Record<string, string>
): string {
  let result = body;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

export function wrapLinksWithTracking(
  html: string,
  baseUrl: string,
  campaignId: number,
  recipientId: number
): string {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_match, url) => {
      const trackingUrl = `${baseUrl}/api/email/click/${campaignId}/${recipientId}?redirect=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    }
  );
}

export function addTrackingPixel(
  html: string,
  baseUrl: string,
  campaignId: number,
  recipientId: number
): string {
  const pixel = `<img src="${baseUrl}/api/email/open/${campaignId}/${recipientId}" width="1" height="1" style="display:none" alt="" />`;
  return html + pixel;
}
