import { google } from "googleapis";

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!key) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY");
  }

  return key.replace(/\\n/g, "\n");
}

export async function getSheetRows(range: string) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL");
  }

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const auth = new google.auth.JWT({
    email,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  return response.data.values || [];
}