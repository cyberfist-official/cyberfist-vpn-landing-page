import { NextResponse } from "next/server";
import { google } from "googleapis";

const sheets = google.sheets("v4");

async function addToWaitlist(email: string, userAgent: string, source: string) {
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
    range: "Sheet1!A:D", // change Sheet1 if you rename the tab
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[now, email, userAgent, source]],
    },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

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
    const referer = req.headers.get("referer") || "direct";

    await addToWaitlist(email, userAgent, referer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WAITLIST] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
