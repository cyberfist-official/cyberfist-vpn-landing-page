import { google } from "googleapis";

const sheets = google.sheets("v4");

type WaitlistEntry = {
  timestamp: string;
  email: string;
  userAgent: string;
  source: string;
};

async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.error("[WAITLIST ADMIN] Missing Google Sheets env vars");
    return [];
  }

  const key = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  await auth.authorize();

  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A:D",
  });

  const rows = res.data.values || [];

  // rows: [ [timestamp, email, userAgent, source], ... ]
  return rows.map((row) => ({
    timestamp: row[0] || "",
    email: row[1] || "",
    userAgent: row[2] || "",
    source: row[3] || "",
  }));
}

export default async function WaitlistAdminPage() {
  const entries = await getWaitlistEntries();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">CyberFist Waitlist</h1>
        <p className="text-slate-400 mb-6">
          Total signups: {entries.length}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Time (UTC)
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Source
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  User Agent
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No entries yet.
                  </td>
                </tr>
              ) : (
                entries
                  .slice() // shallow copy
                  .reverse() // show newest first
                  .map((entry, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-slate-800 hover:bg-slate-900/60"
                    >
                      <td className="px-4 py-3 align-top text-slate-300">
                        {entry.timestamp}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-100">
                        {entry.email}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {entry.source || "direct"}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-500 max-w-xl break-words">
                        {entry.userAgent}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
