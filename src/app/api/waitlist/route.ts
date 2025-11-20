import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";
import { waitlistLimiter } from "@/lib/rateLimit";

const sheets = google.sheets("v4");
const resend = new Resend(process.env.RESEND_API_KEY);

async function addToWaitlist(
  email: string,
  userAgent: string,
  source: string,
) {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.error("[WAITLIST] Missing Google Sheets env vars");
    throw new Error("Server not configured for waitlist storage");
  }

  const key = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();

  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[now, email, userAgent, source]],
    },
  });
}

async function sendNotificationEmail(
  email: string,
  userAgent: string,
  source: string,
) {
  const to = process.env.WAITLIST_NOTIFY_TO;
  const from =
    process.env.WAITLIST_NOTIFY_FROM ||
    "CyberFist Waitlist <no-reply@example.com>";

  if (!process.env.RESEND_API_KEY) {
    console.error("[WAITLIST] RESEND_API_KEY not set, skipping notification");
    return;
  }

  if (!to) {
    console.error("[WAITLIST] WAITLIST_NOTIFY_TO not set, skipping notification");
    return;
  }

  try {
    await resend.emails.send({
      from,
      to,
      subject: "New CyberFist waitlist signup",
      text: [
        "New waitlist signup",
        "",
        `Email: ${email}`,
        `Source/UTM: ${source || "unknown"}`,
        `User-Agent: ${userAgent || "unknown"}`,
        `Time (ISO): ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[WAITLIST] Failed to send notification email:", err);
  }
}

async function sendWelcomeEmail(email: string) {
  const from =
    process.env.WAITLIST_NOTIFY_FROM ||
    "CyberFist Waitlist <no-reply@example.com>";

  if (!process.env.RESEND_API_KEY) {
    console.error("[WAITLIST] RESEND_API_KEY not set, skipping welcome email");
    return;
  }

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: "You’re on the CyberFist VPN waitlist",
      text: [
        "Thanks for joining the CyberFist VPN waitlist.",
        "",
        "We’re building a fast, privacy-first VPN focused on real security, not marketing buzzwords.",
        "You’ll be one of the first to know when we’re ready for beta access.",
        "",
        "— CyberFist",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[WAITLIST] Failed to send welcome email:", err);
  }
}

function buildSourceWithTracking(
  rawSource: string | undefined,
  referer: string | null,
): string {
  const baseSource = rawSource || referer || "direct";

  if (!referer) return baseSource;

  try {
    const url = new URL(referer);
    const params = url.searchParams;

    const bits: string[] = [];

    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    if (utmSource) bits.push(`utm_source=${utmSource}`);
    if (utmMedium) bits.push(`utm_medium=${utmMedium}`);
    if (utmCampaign) bits.push(`utm_campaign=${utmCampaign}`);

    if (!bits.length) return baseSource;

    return `${baseSource} | ${bits.join("&")}`;
  } catch {
    return baseSource;
  }
}

export async function POST(req: Request) {
  try {
    // --- Rate limiting per IP: 5 req / minute ---
    if (waitlistLimiter) {
      const ipHeader = req.headers.get("x-forwarded-for") ?? "";
      const ip = ipHeader.split(",")[0].trim() || "unknown";

      const { success } = await waitlistLimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Try again later." },
          { status: 429 },
        );
      }
    } else {
      console.warn("[WAITLIST] Rate limiter not configured – no limit applied");
    }

    const body = await req.json();

    const email = body?.email as string | undefined;
    const clientSource =
      typeof body?.source === "string" ? body.source : undefined;
    const honeypot = typeof body?.hp === "string" ? body.hp : "";

    // Honeypot: if bots fill this, pretend success and bail.
    if (honeypot.trim().length > 0) {
      console.warn("[WAITLIST] Honeypot triggered, dropping spam submission");
      return NextResponse.json({ success: true });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer");

    const source = buildSourceWithTracking(clientSource, referer);

    await addToWaitlist(email, userAgent, source);

    await Promise.all([
      sendNotificationEmail(email, userAgent, source),
      sendWelcomeEmail(email),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WAITLIST] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
