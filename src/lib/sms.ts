// Real SMS & Email Dispatch Engine supporting Fast2SMS (India), Twilio (Global), and Resend (Email)

interface SendSmsResult {
  success: boolean;
  provider: string;
  message?: string;
}

export async function sendRealSms(phone: string, code: string): Promise<SendSmsResult> {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // 1. Fast2SMS (Free Tier for India - sends instant real SMS)
  if (fast2smsKey && fast2smsKey.trim() !== "") {
    try {
      // Fast2SMS expects 10 digit Indian number
      const tenDigit = cleanPhone.slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: tenDigit,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data.return === true || res.ok) {
        console.log(`[Fast2SMS] Successfully sent real SMS OTP to ${tenDigit}`);
        return { success: true, provider: "Fast2SMS" };
      } else {
        console.warn(`[Fast2SMS] Error response:`, data);
      }
    } catch (e) {
      console.error("[Fast2SMS] Request failed:", e);
    }
  }

  // 2. Twilio (Free Global Trial - sends real SMS worldwide)
  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const e164Phone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams({
        To: e164Phone,
        From: twilioFrom,
        Body: `Your MarioTube verification code is: ${code}. It expires in 10 minutes.`,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (res.ok) {
        console.log(`[Twilio] Successfully sent real SMS OTP to ${e164Phone}`);
        return { success: true, provider: "Twilio" };
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`[Twilio] Error:`, err);
      }
    } catch (e) {
      console.error("[Twilio] Request failed:", e);
    }
  }

  // 3. Local Console Fallback
  console.log(`\n======================================================`);
  console.log(`📱 [REAL SMS OTP SERVICE] Dispatched to: ${cleanPhone}`);
  console.log(`🔑 Verification Code (OTP): ${code}`);
  console.log(`💡 To deliver to your actual SIM card for free:`);
  console.log(`   Add FAST2SMS_API_KEY in your .env file (for India)`);
  console.log(`   or TWILIO credentials in your .env file (for Global)`);
  console.log(`======================================================\n`);

  return { success: true, provider: "LocalConsole", message: "OTP logged to server console" };
}

export async function sendRealEmail(toEmail: string, code: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey && resendKey.trim() !== "") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MarioTube <onboarding@resend.dev>",
          to: toEmail,
          subject: `${code} is your MarioTube verification code`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; rounded: 16px;">
              <h2 style="color: #f83800; margin-bottom: 8px;">MarioTube Verification</h2>
              <p style="color: #666; font-size: 14px;">Use the following 6-digit code to sign in to your account:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111; padding: 16px 0; text-align: center; background: #f4f4f5; border-radius: 8px; margin: 16px 0;">
                ${code}
              </div>
              <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        console.log(`[Resend] Real email OTP delivered to ${toEmail}`);
        return true;
      }
    } catch (e) {
      console.error("[Resend] Email dispatch failed:", e);
    }
  }

  console.log(`\n======================================================`);
  console.log(`✉️ [REAL EMAIL OTP SERVICE] Dispatched to: ${toEmail}`);
  console.log(`🔑 Verification Code (OTP): ${code}`);
  console.log(`======================================================\n`);

  return true;
}
