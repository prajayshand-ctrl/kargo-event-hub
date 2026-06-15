import { NextResponse } from "next/server";

const mockSalesforceContacts = [
  {
    salesforceContactId: "003-netflix-jane",
    salesforceAccountId: "001-netflix",
    name: "Jane Smith",
    email: "jane.smith@netflix.com",
    title: "VP, Partnerships",
    company: "Netflix",
    accountOwnerUserId: "user-clarke",
    contactOwnerUserId: "user-clarke",
    source: "Salesforce read-only mock",
  },
  {
    salesforceContactId: "003-groupm-mike",
    salesforceAccountId: "001-groupm",
    name: "Mike Jones",
    email: "mike.jones@groupm.com",
    title: "SVP, Media",
    company: "GroupM",
    accountOwnerUserId: "user-aurelio",
    contactOwnerUserId: "user-aurelio",
    source: "Salesforce read-only mock",
  },
  {
    salesforceContactId: "003-nike-sarah",
    salesforceAccountId: "001-nike",
    name: "Sarah Lee",
    email: "sarah.lee@nike.com",
    title: "Director, Brand Media",
    company: "Nike",
    accountOwnerUserId: "user-dani",
    contactOwnerUserId: "user-dani",
    source: "Salesforce read-only mock",
  },
  {
    salesforceContactId: "003-amazon-priya",
    salesforceAccountId: "001-amazon",
    name: "Priya Raman",
    email: "priya.raman@amazon.com",
    title: "Head of Media Strategy",
    company: "Amazon",
    accountOwnerUserId: "user-naina",
    contactOwnerUserId: "user-naina",
    source: "Salesforce read-only mock",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  const results = mockSalesforceContacts.filter((contact) => {
    const searchable = [
      contact.name,
      contact.email,
      contact.title,
      contact.company,
      contact.salesforceContactId,
      contact.salesforceAccountId,
    ]
      .join(" ")
      .toLowerCase();

    return !q || searchable.includes(q);
  });

  return NextResponse.json({
    mode: "mock-salesforce-read-only",
    results,
  });
}
