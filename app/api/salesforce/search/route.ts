import { NextResponse } from "next/server";
import { getSheetRows } from "@/app/lib/googleSheets";

type SheetContact = {
  salesforceContactId: string;
  salesforceAccountId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  accountOwnerName: string;
  accountOwnerEmail: string;
  accountOwnerUserId: string;
  contactOwnerUserId: string;
  source: string;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function makeOwnerUserId(ownerEmail: string, ownerName: string) {
  const base = ownerEmail || ownerName || "unknown-owner";
  return `owner-${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function rowToContact(row: string[]): SheetContact {
  const firstName = clean(row[0]);
  const lastName = clean(row[1]);
  const salesforceContactId = clean(row[2]);
  const email = clean(row[3]);
  const title = clean(row[4]);
  const company = clean(row[5]);
  const salesforceAccountId = clean(row[6]);
  const accountOwnerName = clean(row[7]);
  const accountOwnerEmail = clean(row[8]);

  const accountOwnerUserId = makeOwnerUserId(accountOwnerEmail, accountOwnerName);

  return {
    salesforceContactId,
    salesforceAccountId,
    name: [firstName, lastName].filter(Boolean).join(" "),
    firstName,
    lastName,
    email,
    title,
    company,
    accountOwnerName,
    accountOwnerEmail,
    accountOwnerUserId,
    contactOwnerUserId: accountOwnerUserId,
    source: "Private Salesforce Sheet",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = clean(searchParams.get("q")).toLowerCase();

  const rows = await getSheetRows("'Contacts Data'!A:I");

  const dataRows = rows.slice(1) as string[][];

  const contacts = dataRows
    .map(rowToContact)
    .filter((contact) => contact.salesforceContactId || contact.email);

  const results = contacts.filter((contact) => {
    const searchable = [
      contact.name,
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.title,
      contact.company,
      contact.salesforceContactId,
      contact.salesforceAccountId,
      contact.accountOwnerName,
      contact.accountOwnerEmail,
    ]
      .join(" ")
      .toLowerCase();

    return !q || searchable.includes(q);
  });

  return NextResponse.json({
    mode: "private-google-sheet-salesforce-contacts",
    count: results.length,
    results: results.slice(0, 25),
  });
}