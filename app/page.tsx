"use client";

import { useState } from "react";

type Note = {
  id: string;
  text: string;
};

type Followup = {
  id: string;
  text: string;
};

type Tag = {
  id: string;
  person: string;
};

type Contact = {
  id: string;
  name: string;
  company: string;
  title: string;
  owner: string;
  source: string;
  notes: Note[];
  followups: Followup[];
  tags: Tag[];
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
      {
        id: "n1",
        text: "Interested in attention measurement.",
      },
      {
        id: "n2",
        text: "Asked for case study after Cannes.",
      },
    ],
    followups: [
      {
        id: "f1",
        text: "Send attention case study",
      },
    ],
    tags: [
      {
        id: "t1",
        person: "@Clarke",
      },
    ],
  },
  {
    id: "2",
    name: "Mike Jones",
    company: "GroupM",
    title: "SVP, Media",
    owner: "Aurelio Farrell",
    source: "Salesforce synced",
    notes: [
      {
        id: "n3",
        text: "Mentioned possible Q4 RFP.",
      },
    ],
    followups: [
      {
        id: "f2",
        text: "Send capabilities email",
      },
    ],
    tags: [
      {
        id: "t2",
        person: "@Aurelio",
      },
    ],
  },
];

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>(starterContacts);
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [captureText, setCaptureText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [selectedTag, setSelectedTag] = useState("@Aurelio");

  const selected = contacts.find((c) => c.id === selectedId) || contacts[0];

  const totalFollowups = contacts.reduce(
    (sum, contact) => sum + contact.followups.length,
    0
  );

  const totalTags = contacts.reduce(
    (sum, contact) => sum + contact.tags.length,
    0
  );

  function updateSelectedContact(updatedContact: Contact) {
    setContacts(
      contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  }

  function addMockSalesforceContact() {
    const newContact: Contact = {
      id: String(Date.now()),
      name: search || "Sarah Lee",
      company: "Nike",
      title: "Director, Brand Media",
      owner: "Dani Halle",
      source: "Mock Salesforce lookup",
      notes: [
        {
          id: String(Date.now()) + "-note",
          text: "Added from Salesforce read-only search.",
        },
      ],
      followups: [],
      tags: [],
    };

    setContacts([newContact, ...contacts]);
    setSelectedId(newContact.id);
    setSearch("");
  }

  function saveNote() {
    if (!captureText.trim()) return;

    updateSelectedContact({
      ...selected,
      notes: [
        {
          id: String(Date.now()),
          text: captureText.trim(),
        },
        ...selected.notes,
      ],
    });

    setCaptureText("");
  }

  function addFollowup() {
    if (!captureText.trim()) {
      alert("Write the follow-up in the text box first.");
      return;
    }

    updateSelectedContact({
      ...selected,
      followups: [
        {
          id: String(Date.now()),
          text: captureText.trim(),
        },
        ...selected.followups,
      ],
    });

    setCaptureText("");
  }

  function deleteNote(noteId: string) {
    updateSelectedContact({
      ...selected,
      notes: selected.notes.filter((note) => note.id !== noteId),
    });
  }

  function startEditingNote(note: Note) {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  }

  function saveEditedNote() {
    if (!editingNoteId) return;

    updateSelectedContact({
      ...selected,
      notes: selected.notes.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              text: editingNoteText,
            }
          : note
      ),
    });

    setEditingNoteId(null);
    setEditingNoteText("");
  }

  function deleteFollowup(followupId: string) {
    updateSelectedContact({
      ...selected,
      followups: selected.followups.filter(
        (followup) => followup.id !== followupId
      ),
    });
  }

  function tagRep() {
    updateSelectedContact({
      ...selected,
      tags: [
        {
          id: String(Date.now()),
          person: selectedTag,
        },
        ...selected.tags,
      ],
    });
  }

  function deleteTag(tagId: string) {
    updateSelectedContact({
      ...selected,
      tags: selected.tags.filter((tag) => tag.id !== tagId),
    });
  }

  function importGranola() {
    updateSelectedContact({
      ...selected,
      notes: [
        {
          id: String(Date.now()),
          text:
            "Granola import placeholder: paste or link meeting notes here in V1.",
        },
        ...selected.notes,
      ],
    });
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
          <strong>{totalFollowups}</strong>
        </div>
        <div>
          <span>Tags</span>
          <strong>{totalTags}</strong>
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
                className={
                  contact.id === selected.id ? "contact active" : "contact"
                }
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
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              placeholder="Write a note or follow-up here..."
            />

            <div className="tagRow">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option>@Aurelio</option>
                <option>@Clarke</option>
                <option>@Dani</option>
                <option>@Jerry</option>
                <option>@Naina</option>
              </select>
              <button onClick={tagRep}>Tag teammate</button>
            </div>

            <div className="buttonGrid">
              <button onClick={saveNote}>Save as note</button>
              <button onClick={addFollowup}>Save as follow-up</button>
              <button onClick={importGranola}>Import Granola</button>
            </div>
          </div>

          <div className="sections">
            <div>
              <h3>Notes</h3>
              {selected.notes.length === 0 && (
                <p className="empty">No notes yet.</p>
              )}

              {selected.notes.map((note) => (
                <div key={note.id} className="item">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                      />
                      <div className="miniActions">
                        <button onClick={saveEditedNote}>Save edit</button>
                        <button onClick={() => setEditingNoteId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{note.text}</p>
                      <div className="miniActions">
                        <button onClick={() => startEditingNote(note)}>
                          Edit
                        </button>
                        <button onClick={() => deleteNote(note.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h3>Follow-ups</h3>
              {selected.followups.length === 0 && (
                <p className="empty">No follow-ups yet.</p>
              )}

              {selected.followups.map((followup) => (
                <div key={followup.id} className="item">
                  <p>{followup.text}</p>
                  <div className="miniActions">
                    <button onClick={() => deleteFollowup(followup.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3>Team tags</h3>
              {selected.tags.length === 0 && (
                <p className="empty">No teammate tags yet.</p>
              )}

              {selected.tags.map((tag) => (
                <div key={tag.id} className="item tagItem">
                  <p>{tag.person}</p>
                  <button onClick={() => deleteTag(tag.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}