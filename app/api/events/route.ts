import { NextResponse } from "next/server";
import { getSheetRows } from "@/app/lib/googleSheets";

type EventRow = {
  id: string;
  name: string;
  region: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  active: boolean;
  owner: string;
  createdDate: string;
  lastModifiedDate: string;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function rowToEvent(row: string[]): EventRow {
  const name = clean(row[0]);
  const id = clean(row[1]);
  const region = clean(row[2]);
  const type = clean(row[3]);
  const status = clean(row[4]);
  const startDate = clean(row[5]);
  const endDate = clean(row[6]);
  const active = clean(row[7]).toLowerCase() === "true";
  const owner = clean(row[14]);
  const createdDate = clean(row[15]);
  const lastModifiedDate = clean(row[16]);

  return {
    id,
    name,
    region,
    type,
    status,
    startDate,
    endDate,
    active,
    owner,
    createdDate,
    lastModifiedDate,
  };
}

export async function GET() {
  const rows = await getSheetRows("'Events'!A:Q");

  const events = (rows.slice(1) as string[][])
    .map(rowToEvent)
    .filter((event) => event.id && event.name && event.active);

  return NextResponse.json({
    mode: "private-google-sheet-events",
    count: events.length,
    results: events,
  });
}