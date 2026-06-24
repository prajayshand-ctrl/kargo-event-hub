import { NextResponse } from "next/server";
import { getSheetRows } from "@/app/lib/googleSheets";

type ActiveUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  region: string;
  salesforceUserId: string;
  slackUserId: string;
  active: boolean;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeHeader(value: string) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getValue(row: string[], headerMap: Map<string, number>, possibleHeaders: string[]) {
  for (const header of possibleHeaders) {
    const index = headerMap.get(normalizeHeader(header));

    if (index !== undefined) {
      return clean(row[index]);
    }
  }

  return "";
}

function makeUserId(email: string, name: string) {
  const base = email || name || "unknown-user";
  return `user-${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function isActiveValue(value: string) {
  const normalized = value.toLowerCase();

  if (!normalized) return true;

  return ["true", "yes", "y", "active", "1"].includes(normalized);
}

function isSeller(role: string, team: string) {
  const searchable = `${role} ${team}`.toLowerCase();

  return (
    searchable.includes("seller") ||
    searchable.includes("sales") ||
    searchable.includes("account executive") ||
    searchable.includes("ae") ||
    searchable.includes("brand sales")
  );
}

export async function GET() {
  try {
    const rows = await getSheetRows("'Active Kargo Users'!A:Z");

    const headers = (rows[0] || []) as string[];
    const dataRows = rows.slice(1) as string[][];

    const headerMap = new Map(
      headers.map((header, index) => [normalizeHeader(header), index])
    );

    const users: ActiveUser[] = dataRows
      .map((row) => {
        const firstName = getValue(row, headerMap, ["First Name", "FirstName"]);
        const lastName = getValue(row, headerMap, ["Last Name", "LastName"]);
        const fullName = getValue(row, headerMap, ["Name", "Full Name", "User Name"]);
        const email = getValue(row, headerMap, ["Email", "User Email", "Email Address"]);
        const role = getValue(row, headerMap, ["Role", "Title", "Job Title"]);
        const team = getValue(row, headerMap, ["Team", "Department", "Function"]);
        const region = getValue(row, headerMap, ["Region", "Market"]);
        const active = getValue(row, headerMap, ["Active", "Is Active", "Status"]);
        const salesforceUserId = getValue(row, headerMap, [
          "Salesforce User ID",
          "SalesforceUserId",
          "SFDC User ID",
          "User ID",
        ]);
        const slackUserId = getValue(row, headerMap, ["Slack User ID", "SlackUserId"]);

        const name = fullName || [firstName, lastName].filter(Boolean).join(" ");

        return {
          id: makeUserId(email, name),
          name,
          email,
          role,
          team,
          region,
          salesforceUserId: salesforceUserId || makeUserId(email, name),
          slackUserId,
          active: isActiveValue(active),
        };
      })
      .filter((user) => user.name && user.email)
      .filter((user) => user.active)
      .filter((user) => isSeller(user.role, user.team));

    return NextResponse.json({
      mode: "private-google-sheet-active-kargo-users",
      count: users.length,
      results: users,
    });
  } catch (error) {
    console.error("Users API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}