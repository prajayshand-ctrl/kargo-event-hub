import { NextResponse } from "next/server";
import { getSheetRows } from "@/app/lib/googleSheets";

export async function GET() {
  const contactsRows = await getSheetRows("'Contacts Data'!A1:I5");
  const usersRows = await getSheetRows("'Active Kargo Users'!A1:J5");

  return NextResponse.json({
    ok: true,
    contactsPreview: contactsRows,
    usersPreview: usersRows,
  });
}