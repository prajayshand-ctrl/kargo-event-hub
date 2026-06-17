import { NextResponse } from "next/server";
import { getSheetRows } from "@/app/lib/googleSheets";

type CampaignMember = {
  campaignName: string;
  campaignId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  name: string;
  startDate: string;
  endDate: string;
  memberStatus: string;
  salesforceContactId: string;
  email: string;
  title: string;
  company: string;
  salesforceAccountId: string;
  accountOwnerName: string;
  accountOwnerEmail: string;
  source: string;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeId(value: string) {
  return clean(value).toLowerCase();
}

function rowToContactLookup(row: string[]) {
  const firstName = clean(row[0]);
  const lastName = clean(row[1]);
  const salesforceContactId = clean(row[2]);

  return {
    firstName,
    lastName,
    salesforceContactId,
    email: clean(row[3]),
    title: clean(row[4]),
    company: clean(row[5]),
    salesforceAccountId: clean(row[6]),
    accountOwnerName: clean(row[7]),
    accountOwnerEmail: clean(row[8]),
  };
}

function rowToCampaignMember(
  row: string[],
  contactLookup: Map<string, ReturnType<typeof rowToContactLookup>>
): CampaignMember {
  const campaignName = clean(row[0]);
  const campaignId = clean(row[1]);
  const memberId = clean(row[2]);
  const firstName = clean(row[3]);
  const lastName = clean(row[4]);
  const startDate = clean(row[5]);
  const endDate = clean(row[6]);
  const memberStatus = clean(row[7]);
  const salesforceContactId = clean(row[8]);

  const contactDetails = contactLookup.get(normalizeId(salesforceContactId));

  return {
    campaignName,
    campaignId,
    memberId,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" "),
    startDate,
    endDate,
    memberStatus,
    salesforceContactId,
    email: contactDetails?.email || "",
    title: contactDetails?.title || "",
    company: contactDetails?.company || "",
    salesforceAccountId: contactDetails?.salesforceAccountId || "",
    accountOwnerName: contactDetails?.accountOwnerName || "",
    accountOwnerEmail: contactDetails?.accountOwnerEmail || "",
    source: "Private Campaign Member Sheet",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = clean(searchParams.get("campaignId"));
  const status = clean(searchParams.get("status")).toLowerCase();

 if (!campaignId) {
  const [campaignRows, contactRows] = await Promise.all([
    getSheetRows("'campaigns with contacts'!A:I"),
    getSheetRows("'Contacts Data'!A:I"),
  ]);

  return NextResponse.json({
    ok: true,
    message: "No campaignId provided. Showing first 10 campaign member rows for debugging.",
    headers: campaignRows[0],
    previewRows: campaignRows.slice(1, 11),
    contactHeaders: contactRows[0],
  });
}

  const [campaignRows, contactRows] = await Promise.all([
    getSheetRows("'campaigns with contacts'!A:I"),
    getSheetRows("'Contacts Data'!A:I"),
  ]);

  const contactLookup = new Map(
    (contactRows.slice(1) as string[][]).map((row) => {
      const contact = rowToContactLookup(row);
      return [normalizeId(contact.salesforceContactId), contact];
    })
  );

  let members = (campaignRows.slice(1) as string[][])
    .map((row) => rowToCampaignMember(row, contactLookup))
    .filter(
  (member) =>
    member.campaignId.trim().toLowerCase() ===
    campaignId.trim().toLowerCase()
);

  if (status && status !== "all") {
    members = members.filter((member) =>
      member.memberStatus.toLowerCase().includes(status)
    );
  }

  return NextResponse.json({
    mode: "private-google-sheet-campaign-members",
    campaignId,
    count: members.length,
    results: members,
  });
}