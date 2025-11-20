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

  return rows.map((row) => ({
    timestamp: row[0] || "",
    email: row[1] || "",
    userAgent: row[2] || "",
    source: row[3] || "",
  }));
}

export default async function WaitlistAdminPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const entries = await getWaitlistEntries();

  const q = (searchParams?.q || "").toLowerCase().trim();

  const filtered = q
    ? entries.filter((e) => {
        const haystack = [
          e.timestamp,
          e.email,
          e.source,
          e.userAgent,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : entries;

  const shown = filtered.slice().reverse(); // newest first

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">CyberFist Waitlist</h1>
            <p className="text-slate-400 text-sm mt-1">
              Total signups: {entries.length} · Showing: {shown.length}
            </p>
          </div>

          <form
            method="GET"
            className="flex gap-2 items-center bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2"
          >
            <input
              type="text"
              name="q"
              placeholder="Filter by email, source, UA..."
              defaultValue={q}
              className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
            />
            {q && (
              <a
                href="/admin/waitlist"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </a>
            )}
          </form>
        </header>

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
                  Source / UTM
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  User Agent
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No entries match this filter.
                  </td>
                </tr>
              ) : (
                shown.map((entry, idx) => (
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
                    <td className="px-4 py-3 align-top text-slate-300 max-w-xs break-words">
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
