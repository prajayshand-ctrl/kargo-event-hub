"use client";

import { useState } from "react";

type Contact = {
  id: string;
  name: string;
  company: string;
  title: string;
  owner: string;
  source: string;
  notes: string[];
  followups: string[];
  tags: string[];
};

const starterContacts: Contact[] = [
  {
    id: "1",
    name: "Jane Smith",
    company: "Netflix",
    title: "VP, Partnerships",
    owner: "Clarke Johnson",
    source: "Salesforce synced",
    notes: [
      "Interested in attention measurement.",
      "Asked for case study after Cannes."
    ],
    followups: ["Send attention case study"],
    tags: ["@Clarke"]
  },
  {
    id: "2",
    name: "Mike Jones",
    company: "GroupM",
    title: "SVP, Media",
    owner: "Aurelio Farrell",
    source: "Salesforce synced",
    notes: ["Mentioned possible Q4 RFP."],
    followups: ["Send capabilities email"],
    tags: ["@Aurelio"]
  }
];

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>(starterContacts);
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");

  const selected = contacts.find((c) => c.id === selectedId) || contacts[0];

  function addMockSalesforceContact() {
    const newContact: Contact = {
      id: String(Date.now()),
      name: search || "Sarah Lee",
      company: "Nike",
      title: "Director, Brand Media",
      owner: "Dani Halle",
      source: "Mock Salesforce lookup",
      notes: ["Added from Salesforce read-only search."],
      followups: [],
      tags: []
    };

    setContacts([newContact, ...contacts]);
    setSelectedId(newContact.id);
    setSearch("");
  }

  function saveNote() {
    if (!note.trim()) return;

    setContacts(
      contacts.map((contact) =>
        contact.id === selected.id
          ? { ...contact, notes: [note, ...contact.notes] }
          : contact
      )
    );

    setNote("");
  }

  function addFollowup() {
    setContacts(
      contacts.map((contact) =>
        contact.id === selected.id
          ? {
              ...contact,
              followups: [`Follow up with ${selected.name}`, ...contact.followups]
            }
          : contact
      )
    );
  }

  function tagAurelio() {
    setContacts(
      contacts.map((contact) =>
        contact.id === selected.id
          ? { ...contact, tags: ["@Aurelio", ...contact.tags] }
          : contact
      )
    );
  }

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Kargo Internal Prototype</p>
          <h1>Kargo Event Hub</h1>
          <p>
            A mobile-first networking layer on top of Salesforce for events,
            notes, follow-ups, Granola context, and teammate tagging.
          </p>
        </div>
      </section>

      <section className="metrics">
        <div>
          <span>Event</span>
          <strong>Cannes Lions 2027</strong>
        </div>
        <div>
          <span>Contacts</span>
          <strong>{contacts.length}</strong>
        </div>
        <div>
          <span>Follow-ups</span>
          <strong>{contacts.reduce((sum, c) => sum + c.followups.length, 0)}</strong>
        </div>
        <div>
          <span>Tags</span>
          <strong>{contacts.reduce((sum, c) => sum + c.tags.length, 0)}</strong>
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Salesforce read-only search</h2>
          <p className="muted">
            This is mocked for now. Later this search box will call a Vercel API
            route that reads from Salesforce.
          </p>

          <div className="searchRow">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contact or account"
            />
            <button onClick={addMockSalesforceContact}>Attach</button>
          </div>

          <h2>Event contacts</h2>

          <div className="contacts">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                className={contact.id === selected.id ? "contact active" : "contact"}
                onClick={() => setSelectedId(contact.id)}
              >
                <div className="avatar">
                  {contact.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <strong>{contact.name}</strong>
                  <span>
                    {contact.company} · {contact.title}
                  </span>
                  <small>{contact.source}</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>{selected.name}</h2>
          <p className="muted">
            {selected.company} · {selected.title}
          </p>

          <div className="pillRow">
            <span>{selected.source}</span>
            <span>Owner: {selected.owner}</span>
          </div>

          <div className="capture">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add event note..."
            />
            <div className="buttonGrid">
              <button onClick={saveNote}>Save note</button>
              <button onClick={addFollowup}>Add follow-up</button>
              <button onClick={tagAurelio}>Tag @Aurelio</button>
              <button
                onClick={() =>
                  alert("Granola import placeholder. V1 can use paste/link import.")
                }
              >
                Import Granola
              </button>
            </div>
          </div>

          <div className="sections">
            <div>
              <h3>Notes</h3>
              {selected.notes.map((item, index) => (
                <p key={index} className="item">
                  {item}
                </p>
              ))}
            </div>

            <div>
              <h3>Follow-ups</h3>
              {selected.followups.map((item, index) => (
                <p key={index} className="item">
                  {item}
                </p>
              ))}
            </div>

            <div>
              <h3>Team tags</h3>
              {selected.tags.map((item, index) => (
                <p key={index} className="item">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}