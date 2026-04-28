interface JobDetails {
  id: number;
  title: string;
  location: string;
  compensation: string;
  company?: string;
}

interface Subscriber {
  email: string;
  fullName: string;
}

export async function sendJobAlertEmail(
  subscribers: Subscriber[],
  job: JobDetails,
  baseUrl: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY is not configured');
    return { success: false, sentCount: 0, errors: ['Brevo API key not configured'] };
  }

  const errors: string[] = [];
  let sentCount = 0;

  const applyUrl = `${baseUrl}/jobs?apply=${job.id}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Alert - SkillVeda</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #8B3CFF 0%, #4B66FF 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">SkillVeda</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">New Job Opportunity For You!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px; color: #1f2937; font-size: 22px; font-weight: 600;">
                ${job.title}
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Location</span>
                    <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${job.location}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Compensation</span>
                    <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${job.compensation}</p>
                  </td>
                </tr>
                ${job.company ? `
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Company</span>
                    <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${job.company}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${applyUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                You're receiving this email because you signed up for job alerts on SkillVeda.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} SkillVeda. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  for (const subscriber of subscribers) {
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
          to: [{ email: subscriber.email }],
          subject: 'Job alerts - SkillVeda',
          htmlContent: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      sentCount++;
    } catch (error: any) {
      console.error(`Failed to send email to ${subscriber.email}:`, error.message);
      errors.push(`${subscriber.email}: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    sentCount,
    errors,
  };
}
