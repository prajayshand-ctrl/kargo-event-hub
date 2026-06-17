import { google } from "googleapis";

function getGoogleCredentials() {
  const encoded = process.env.GOOGLE_CREDENTIALS_BASE64;

  if (encoded) {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json);
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_CREDENTIALS_BASE64"
    );
  }

  if (!privateKey) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_CREDENTIALS_BASE64");
  }

  return {
    client_email: email,
    private_key: privateKey.replace(/\\n/g, "\n"),
  };
}

export async function getSheetRows(range: string) {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const credentials = getGoogleCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
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